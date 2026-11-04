"use client";

import type { CSSProperties } from "react";
import { usePrefs } from "@/lib/client/prefs";
import { formatWind } from "@/lib/format";
import { directionKey } from "@/lib/units";
import type { CurrentWeather, WeatherKind } from "@/lib/types";
import { computeWindScene, type Season } from "@/lib/wind-scene";

/* Deterministic pseudo-random values, so server and client render the same
   scene without hydration warnings. */

const LEAF_COLORS: Record<Season, string[] | null> = {
  autumn: ["#e8b04b", "#d97706", "#c2410c", "#e0803c", "#9bbf5a"],
  summer: ["#7cc45f", "#5aa64b", "#8ed471", "#63b052"],
  spring: ["#f9a8d4", "#fbcfe8", "#fde68a", "#fda4af"],
  winter: null,
};

const LEAF_COUNT: Record<Season, number> = { autumn: 9, summer: 5, spring: 6, winter: 0 };

function makeLeaves(season: Season) {
  const colors = LEAF_COLORS[season];
  if (!colors) return [];
  const small = season === "spring";
  return Array.from({ length: LEAF_COUNT[season] }, (_, i) => {
    const onBigTree = i % 2 === 0;
    const cx = onBigTree ? 90 + ((i * 23) % 42) : 148 + ((i * 17) % 26);
    const cy = onBigTree ? 32 + ((i * 19) % 50) : 72 + ((i * 13) % 30);
    return {
      cx,
      cy,
      delay: -(((i * 1.37) % 7) + 0.3).toFixed(2),
      dur: (0.72 + ((i * 13) % 50) / 100).toFixed(2),
      rx: small ? 2.6 + ((i * 7) % 12) / 10 : 3.4 + ((i * 7) % 18) / 10,
      color: colors[i % colors.length],
    };
  });
}

/* Rain: three density tiers. Drizzle and sleet show the first five drops,
   rain and thunderstorms ten, a downpour all fourteen. */
const RAIN = Array.from({ length: 14 }, (_, i) => ({
  x: 10 + i * 13.2,
  delay: -(((i * 0.77) % 2.4) + 0.1).toFixed(2),
  dur: (0.8 + ((i * 19) % 40) / 100).toFixed(2),
  tier: i < 5 ? 1 : i < 10 ? 2 : 3,
}));

const SNOW = Array.from({ length: 12 }, (_, i) => ({
  cx: 8 + ((i * 37) % 184),
  cy: 4 + ((i * 23) % 26),
  r: 1.2 + ((i * 11) % 10) / 10,
  delay: -(((i * 1.19) % 9) + 0.2).toFixed(2),
  dur: (0.8 + ((i * 17) % 40) / 100).toFixed(2),
  tier: i < 8 ? 1 : 2,
}));

const HAIL = Array.from({ length: 7 }, (_, i) => ({
  cx: 18 + ((i * 43) % 168),
  delay: -(((i * 0.9) % 1.8) + 0.1).toFixed(2),
  r: 1.7 + ((i * 7) % 8) / 10,
}));

/* A narrow, dense lawn: twenty-four blades packed on the mound. */
const GRASS = Array.from({ length: 24 }, (_, i) => {
  const x = 38 + i * 5.4 + (((i * 31) % 5) - 2);
  const h = 8 + ((i * 23) % 12);
  const b = i % 2 === 0 ? 2.8 : -2.4;
  return {
    d: `M${x.toFixed(1)} 146q${b} ${(-h * 0.55).toFixed(1)} ${(b * 1.8).toFixed(1)} ${-h}`,
    color: i % 3 === 0 ? "#4c9440" : "#69b455",
    delay: -(((i * 0.41) % 3) + 0.05).toFixed(2),
  };
});

export function WindCard({ current }: { current: CurrentWeather }) {
  const { prefs, t } = usePrefs();
  const speed = current.windSpeed ?? 0;
  const kind: WeatherKind = current.kind;
  const isDay = current.isDay;

  const scene = computeWindScene(speed, current.windDirection, new Date());
  const { level, season, leafless, strength, lean, pushX, flip, drift, fallDur, swayDur } = scene;
  const snowyKind = kind === "snow" || kind === "sleet";
  const snowy = leafless || snowyKind;
  const wetKind = kind === "rain" || kind === "drizzle" || kind === "heavy-rain" || kind === "thunder" || kind === "hail" || kind === "sleet";

  const leaves = makeLeaves(leafless ? "winter" : season);
  const direction = directionKey(current.windDirection);
  // Rain lines tilt downwind; the steeper the wind, the slanted the rain.
  const slant = -(Math.min(drift, 120) * 0.09).toFixed(1);

  return (
    <article
      className="card wind-card"
      data-motion={prefs.motion}
      data-season={season}
      data-wind-level={level}
      data-kind={kind}
      data-day={String(isDay)}
      data-leafless={String(leafless)}
      data-snowy={String(snowy)}
      style={
        {
          "--wind-strength": strength.toFixed(2),
          "--wind-duration": `${swayDur}s`,
          "--wind-lean": `${(lean * 15 * pushX).toFixed(2)}deg`,
          "--wind-flip": String(flip),
          "--leaf-drift": String(drift),
          "--leaf-fall-dur": `${fallDur}s`,
        } as CSSProperties
      }
    >
      <header className="card-head">
        <h3>{t("metric.wind")}</h3>
        <span className="wind-chips">
          <span className="chip chip-soft">{t(`cond.${kind}`)}</span>
          <span className="chip chip-soft">{t(`wind.level.${level}`)}</span>
          <span className="chip chip-soft">{t(`wind.season.${season}`)}</span>
        </span>
      </header>

      <div className="wind-body">
        <div className="wind-art" aria-hidden="true">
          <svg viewBox="0 0 200 150">
            <rect className="wind-veil" x="0" y="0" width="200" height="138" />

            {/* sky: sun / moon / clouds / fog / lightning */}
            <g className="wind-sky-sun">
              <circle cx="36" cy="26" r="9" />
              <g className="wind-sky-rays">
                {Array.from({ length: 8 }, (_, index) => (
                  <line
                    key={index}
                    x1="36"
                    y1="11"
                    x2="36"
                    y2="15.5"
                    transform={`rotate(${index * 45} 36 26)`}
                  />
                ))}
              </g>
            </g>
            <g className="wind-sky-moon">
              <defs>
                <mask id="windSkyMoon">
                  <rect x="0" y="0" width="200" height="150" fill="white" />
                  <circle cx="43" cy="21" r="8" fill="black" />
                </mask>
              </defs>
              <circle cx="36" cy="26" r="9" mask="url(#windSkyMoon)" />
              <circle className="wind-sky-star" cx="52" cy="14" r="1.2" />
              <circle className="wind-sky-star" cx="58" cy="24" r="0.9" />
              <circle className="wind-sky-star" cx="18" cy="12" r="1" />
            </g>
            <g className="wind-sky-clouds">
              <g className="wind-sky-cloud wind-sky-cloud-a">
                <ellipse cx="58" cy="30" rx="15" ry="6.5" />
                <ellipse cx="70" cy="27" rx="11" ry="5.5" />
              </g>
              <g className="wind-sky-cloud wind-sky-cloud-b">
                <ellipse cx="146" cy="22" rx="13" ry="5.5" />
                <ellipse cx="157" cy="20" rx="9" ry="4.5" />
              </g>
            </g>
            <g className="wind-sky-fog">
              <rect x="10" y="56" width="180" height="6" rx="3" />
              <rect x="24" y="74" width="152" height="5" rx="2.5" />
              <rect x="40" y="90" width="120" height="4.5" rx="2.2" />
            </g>
            <polygon
              className="wind-sky-bolt"
              points="148,8 139,34 145,34 136,60 154,30 147,30 157,8"
            />

            {/* precipitation, driven by the live weather kind */}
            <g className="wind-rain">
              {RAIN.map((drop, index) => (
                <line
                  key={index}
                  className="wind-rainf"
                  data-tier={drop.tier}
                  x1={drop.x}
                  y1={-6}
                  x2={(drop.x + Number(slant)).toFixed(1)}
                  y2="4"
                  style={
                    {
                      "--drop-delay": `${drop.delay}s`,
                      "--drop-dur": `calc(var(--leaf-fall-dur) * ${drop.dur} * 0.55)`,
                      "--drop-mul": drop.dur,
                    } as CSSProperties
                  }
                />
              ))}
            </g>
            <g className="wind-snowing">
              {SNOW.map((flake, index) => (
                <g
                  key={index}
                  className="wind-snowf"
                  data-tier={flake.tier}
                  style={
                    {
                      "--drop-delay": `${flake.delay}s`,
                      "--drop-dur": `calc(var(--leaf-fall-dur) * ${flake.dur} * 1.6)`,
                      "--drop-mul": flake.dur,
                    } as CSSProperties
                  }
                >
                  <circle className="wind-snow-dot" cx={flake.cx} cy={flake.cy} r={flake.r} />
                </g>
              ))}
            </g>
            <g className="wind-hailing">
              {HAIL.map((stone, index) => (
                <circle
                  key={index}
                  className="wind-hailf"
                  cx={stone.cx}
                  cy="0"
                  r={stone.r}
                  style={
                    {
                      "--drop-delay": `${stone.delay}s`,
                      "--drop-dur": `calc(var(--leaf-fall-dur) * 0.45)`,
                      "--drop-mul": "1",
                    } as CSSProperties
                  }
                />
              ))}
            </g>

            {/* seasonal leaves from the broadleaf crowns */}
            <g className="wind-leaves">
              {leaves.map((leaf, index) => (
                <g
                  key={index}
                  className="wind-leaf"
                  style={
                    {
                      "--leaf-delay": `${leaf.delay}s`,
                      "--leaf-dur": `calc(var(--leaf-fall-dur) * ${leaf.dur})`,
                      "--leaf-mul": leaf.dur,
                      "--leaf-drop": `${140 - leaf.cy}px`,
                    } as CSSProperties
                  }
                >
                  <ellipse
                    className="wind-leaf-blade"
                    cx={leaf.cx}
                    cy={leaf.cy}
                    rx={leaf.rx}
                    ry={(leaf.rx * 0.58).toFixed(2)}
                    fill={leaf.color}
                  />
                </g>
              ))}
            </g>

            <line className="wind-ground" x1="4" y1="146" x2="196" y2="146" />
            <ellipse className="wind-mound" cx="100" cy="147.5" rx="70" ry="3.2" />

            {/* fir: three stiff tiers, evergreen, bends the least */}
            <g className="wind-lean wind-lean-fir">
              <g className="wind-tree wind-tree-fir">
                <rect className="wind-trunk" x="49.5" y="130" width="5" height="16" rx="1.5" />
                <polygon className="wind-fir-t1" points="52,58 37,90 67,90" />
                <polygon className="wind-fir-t2" points="52,80 33,112 71,112" />
                <polygon className="wind-fir-t3" points="52,102 30,136 74,136" />
                <g className="wind-fir-snow">
                  <ellipse cx="52" cy="61" rx="8" ry="2.6" />
                  <ellipse cx="52" cy="83" rx="11" ry="3" />
                  <ellipse cx="52" cy="105" rx="14" ry="3.4" />
                </g>
              </g>
            </g>

            {/* big broadleaf: crown in the warm seasons, bare branches in winter */}
            <g className="wind-lean wind-lean-big">
              <g className="wind-tree wind-tree-big">
                <path
                  className="wind-trunk"
                  d="M104 146c.6-22 1.2-40 2-60h6c.8 20 1.4 38 2 60Z"
                />
                <g className="wind-bare">
                  <path className="wind-branch" d="M107 96C100 88 94 82 88 76" />
                  <path className="wind-branch" d="M109 88C116 80 122 74 128 66" />
                  <path className="wind-branch" d="M108 80C108 70 107 62 106 52" />
                  <g className="wind-branch-snow">
                    <ellipse cx="88" cy="74" rx="5" ry="1.8" />
                    <ellipse cx="128" cy="64" rx="5" ry="1.8" />
                    <ellipse cx="106" cy="50" rx="4.5" ry="1.8" />
                  </g>
                </g>
                <g className="wind-crown">
                  <ellipse cx="108" cy="50" rx="26" ry="29" />
                  <ellipse cx="90" cy="66" rx="20" ry="22" />
                  <ellipse cx="127" cy="64" rx="21" ry="24" />
                  <ellipse cx="108" cy="80" rx="28" ry="19" />
                </g>
                <g className="wind-crown-snow">
                  <ellipse cx="108" cy="27" rx="19" ry="7" />
                  <ellipse cx="90" cy="48" rx="14" ry="5.5" />
                  <ellipse cx="128" cy="46" rx="14" ry="5.5" />
                </g>
              </g>
            </g>

            {/* small round broadleaf */}
            <g className="wind-lean wind-lean-small">
              <g className="wind-tree wind-tree-small">
                <path
                  className="wind-trunk"
                  d="M158 146c.4-14 .8-26 1.4-40h4c.6 14 1.2 26 1.6 40Z"
                />
                <g className="wind-bare">
                  <path className="wind-branch" d="M159 112C153 106 149 100 146 94" />
                  <path className="wind-branch" d="M161 108C167 102 171 96 174 90" />
                  <path className="wind-branch" d="M160 102L160 88" />
                  <g className="wind-branch-snow">
                    <ellipse cx="146" cy="92" rx="4" ry="1.6" />
                    <ellipse cx="174" cy="88" rx="4" ry="1.6" />
                    <ellipse cx="160" cy="86" rx="4" ry="1.6" />
                  </g>
                </g>
                <g className="wind-crown wind-crown-b">
                  <ellipse cx="160" cy="80" rx="17" ry="20" />
                  <ellipse cx="148" cy="92" rx="13" ry="14" />
                  <ellipse cx="172" cy="91" rx="13" ry="14" />
                  <ellipse cx="160" cy="98" rx="18" ry="12" />
                </g>
                <g className="wind-crown-snow">
                  <ellipse cx="160" cy="64" rx="13" ry="5" />
                  <ellipse cx="148" cy="81" rx="9" ry="4" />
                  <ellipse cx="172" cy="80" rx="9" ry="4" />
                </g>
              </g>
            </g>

            <g className="wind-grass">
              {GRASS.map((blade, index) => (
                <path
                  key={index}
                  d={blade.d}
                  style={{ stroke: blade.color, animationDelay: `${blade.delay}s` }}
                />
              ))}
            </g>
          </svg>
        </div>

        <div className="wind-readout">
          <strong>{formatWind(current.windSpeed, prefs.wind, prefs.locale)}</strong>
          <span>{direction ? t(direction) : "—"}</span>
          <small>
            {t("metric.gust")}: {formatWind(current.windGust, prefs.wind, prefs.locale)}
          </small>
        </div>
      </div>
    </article>
  );
}
