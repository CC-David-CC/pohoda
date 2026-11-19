"use client";

import { useId, type ReactNode } from "react";
import type { IconPack } from "@/lib/client/prefs";
import { scenePreset } from "@/lib/weather/kind";
import type { MotionLevel, WeatherKind } from "@/lib/types";

interface WeatherIconProps {
  kind: WeatherKind;
  isDay?: boolean | null;
  pack: IconPack;
  motion?: MotionLevel;
  size?: number;
  className?: string;
  title?: string;
}

const CLOUD_PATH =
  "M17 44a9 9 0 0 1 .6-17.9 13 13 0 0 1 24.6-1.6A9.5 9.5 0 0 1 47 44Z";

function Rays({ cx, cy, inner, outer }: { cx: number; cy: number; inner: number; outer: number }) {
  return (
    <g className="wi-rays">
      {Array.from({ length: 8 }, (_, index) => (
        <line
          key={index}
          x1={cx}
          y1={cy - inner}
          x2={cx}
          y2={cy - outer}
          transform={`rotate(${index * 45} ${cx} ${cy})`}
        />
      ))}
    </g>
  );
}

function Cloud({
  transform,
  className = "wi-cloud",
}: {
  transform?: string;
  className?: string;
}) {
  return (
    <g className={className} transform={transform}>
      <path d={CLOUD_PATH} />
    </g>
  );
}

function Drops({ count, snow = false }: { count: number; snow?: boolean }) {
  const positions = [
    [23, 47],
    [31.5, 49],
    [40, 47],
    [27, 54],
    [36, 55],
  ];
  const items = [];
  for (let index = 0; index < count; index += 1) {
    const [x, y] = positions[index % positions.length];
    if (snow) {
      items.push(
        <g key={index} className="wi-flake" style={{ animationDelay: `${index * 0.42}s` }}>
          <path d={`M${x - 2.4} ${y}h4.8M${x} ${y - 2.4}v4.8M${x - 1.7} ${y - 1.7}l3.4 3.4M${x + 1.7} ${y - 1.7}l-3.4 3.4`} />
        </g>,
      );
    } else {
      items.push(
        <line
          key={index}
          className="wi-drop"
          x1={x}
          y1={y}
          x2={x - 1.6}
          y2={y + 5}
          style={{ animationDelay: `${index * 0.28}s` }}
        />,
      );
    }
  }
  return <g className="wi-precip">{items}</g>;
}

function Bolt({ x = 0, y = 0, scale = 1 }: { x?: number; y?: number; scale?: number }) {
  return (
    <g className="wi-bolt" transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M32 44 24 56h6l-3 8 12-13h-7l4-7Z" />
    </g>
  );
}

function Stars({ points }: { points: Array<[number, number]> }) {
  return (
    <g className="wi-stars">
      {points.map(([x, y], index) => (
        <circle
          key={index}
          cx={x}
          cy={y}
          r={index % 2 === 0 ? 1.5 : 1}
          style={{ animationDelay: `${index * 0.6}s` }}
        />
      ))}
    </g>
  );
}

function Crescent({ cx = 31, cy = 30, r = 14 }: { cx?: number; cy?: number; r?: number }) {
  const raw = useId();
  const mask = `moon${raw.replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <g className="wi-moon">
      <defs>
        <mask id={mask}>
          <rect x="0" y="0" width="64" height="64" fill="white" />
          <circle cx={cx + 10} cy={cy - 7} r={r - 2} fill="black" />
        </mask>
      </defs>
      <circle cx={cx} cy={cy} r={r} mask={`url(#${mask})`} />
    </g>
  );
}

function SvgGlyph({
  kind,
  isDay,
  pack,
}: {
  kind: WeatherKind;
  isDay: boolean;
  pack: IconPack;
}) {
  const preset = scenePreset(kind);
  const day = isDay;
  const clear = preset === "clear";

  const sun =
    clear && day ? (
      <g className="wi-sun">
        <circle cx="32" cy="30" r="10" />
        <Rays cx={32} cy={30} inner={14} outer={19} />
      </g>
    ) : null;

  const moon =
    clear && !day ? (
      <g>
        <Crescent />
        <Stars points={[[48, 16], [51, 27], [43, 12], [19, 18]]} />
      </g>
    ) : null;

  if (clear && day) return sun;
  if (clear) return moon;

  const smallSun =
    preset === "partly" && day ? (
      <g className="wi-sun wi-sun-small" transform="translate(-9 -9) scale(0.72)">
        <circle cx="32" cy="30" r="9" />
        <Rays cx={32} cy={30} inner={13} outer={18} />
      </g>
    ) : null;

  const smallMoon =
    preset === "partly" && !day ? (
      <g transform="translate(-8 -8) scale(0.66)">
        <Crescent cx={32} cy={30} r={13} />
      </g>
    ) : null;

  const doubleCloud = kind === "overcast";

  return (
    <g>
      {smallSun}
      {smallMoon}
      {doubleCloud ? (
        <Cloud className="wi-cloud wi-cloud-back" transform="translate(8 4) scale(0.7)" />
      ) : null}
      <Cloud transform={preset === "partly" ? "translate(4 8) scale(0.86)" : undefined} />
      {preset === "fog" ? (
        <g className="wi-fog">
          <line x1="18" y1="48" x2="46" y2="48" />
          <line x1="22" y1="53" x2="42" y2="53" />
          <line x1="26" y1="58" x2="38" y2="58" />
        </g>
      ) : null}
      {preset === "rain" ? (
        <Drops count={kind === "drizzle" ? 2 : kind === "heavy-rain" ? 5 : 3} />
      ) : null}
      {preset === "snow" ? <Drops count={kind === "sleet" ? 2 : 4} snow /> : null}
      {preset === "storm" ? (
        <g>
          {kind === "hail" ? (
            <g className="wi-hail">
              <circle cx="23" cy="51" r="2.1" />
              <circle cx="31" cy="56" r="2.1" />
              <circle cx="39" cy="51" r="2.1" />
            </g>
          ) : null}
          <Bolt />
        </g>
      ) : null}
      {pack === "neon" ? <circle className="wi-halo" cx="32" cy="34" r="26" /> : null}
    </g>
  );
}

const EMOJI: Record<WeatherKind, [string, string]> = {
  unknown: ["—", "—"],
  clear: ["☀️", "🌙"],
  partly: ["⛅", "☁️"],
  cloudy: ["🌥️", "☁️"],
  overcast: ["☁️", "☁️"],
  fog: ["🌫️", "🌫️"],
  drizzle: ["🌦️", "🌧️"],
  rain: ["🌧️", "🌧️"],
  "heavy-rain": ["🌧️", "🌧️"],
  snow: ["🌨️", "🌨️"],
  sleet: ["🌨️", "🌨️"],
  thunder: ["⛈️", "⛈️"],
  hail: ["⛈️", "⛈️"],
};

/* ------------------------------ pixel ------------------------------------ */
/* 8-bit weather on a 16×16 grid. Rects only, stepped motion. */

const PIXEL_SHAPES: Record<string, Array<{ x: number; y: number; w: number; h: number; role: string }>> = {
  sun: [
    { x: 5, y: 5, w: 6, h: 6, role: "sun" },
    { x: 7, y: 1, w: 2, h: 2, role: "sun" },
    { x: 7, y: 13, w: 2, h: 2, role: "sun" },
    { x: 1, y: 7, w: 2, h: 2, role: "sun" },
    { x: 13, y: 7, w: 2, h: 2, role: "sun" },
    { x: 2, y: 2, w: 1, h: 1, role: "star" },
    { x: 13, y: 2, w: 1, h: 1, role: "star" },
    { x: 2, y: 13, w: 1, h: 1, role: "star" },
    { x: 13, y: 13, w: 1, h: 1, role: "star" },
  ],
  moon: [
    { x: 4, y: 2, w: 4, h: 2, role: "moon" },
    { x: 3, y: 3, w: 2, h: 3, role: "moon" },
    { x: 3, y: 8, w: 2, h: 3, role: "moon" },
    { x: 4, y: 13, w: 4, h: 2, role: "moon" },
    { x: 7, y: 4, w: 2, h: 1, role: "moon" },
    { x: 7, y: 11, w: 2, h: 1, role: "moon" },
    { x: 2, y: 6, w: 1, h: 1, role: "star" },
    { x: 13, y: 2, w: 1, h: 1, role: "star" },
    { x: 12, y: 13, w: 1, h: 1, role: "star" },
  ],
  cloud: [
    { x: 3, y: 7, w: 10, h: 4, role: "cloud" },
    { x: 5, y: 5, w: 5, h: 3, role: "cloud" },
    { x: 2, y: 9, w: 2, h: 2, role: "cloud" },
    { x: 12, y: 9, w: 2, h: 2, role: "cloud" },
  ],
};

function PixelShape({ role, x, y, w, h }: { role: string; x: number; y: number; w: number; h: number }) {
  return <rect className={`wi-px wi-px-${role}`} x={x} y={y} width={w} height={h} />;
}

function PixelIcon({ kind, isDay }: { kind: WeatherKind; isDay: boolean }) {
  const preset = scenePreset(kind);
  const cloud = PIXEL_SHAPES.cloud;
  const clear = preset === "clear";

  if (clear) {
    return (
      <svg viewBox="0 0 16 16" className="wi-svg" aria-hidden="true">
        {(isDay ? PIXEL_SHAPES.sun : PIXEL_SHAPES.moon).map((shape, index) => (
          <PixelShape key={index} {...shape} />
        ))}
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 16 16" className="wi-svg" aria-hidden="true">
      {preset === "partly" ? (
        <g className="wi-px-sun-group" transform="translate(1 -1)">
          {PIXEL_SHAPES.sun.slice(0, 5).map((shape, index) => (
            <PixelShape key={index} {...shape} />
          ))}
        </g>
      ) : null}
      {kind === "overcast" ? (
        <g transform="translate(2 1) scale(0.85)" opacity="0.55">
          {cloud.map((shape, index) => (
            <PixelShape key={index} {...shape} />
          ))}
        </g>
      ) : null}
      <g transform={preset === "partly" ? "translate(-1 3)" : "translate(0 1)"}>
        {cloud.map((shape, index) => (
          <PixelShape key={index} {...shape} />
        ))}
      </g>
      {preset === "rain" ? (
        <g className="wi-px-drops">
          <rect className="wi-px wi-px-drop" x="4" y="12" width="1" height="2" />
          <rect className="wi-px wi-px-drop" x="7" y="13" width="1" height="2" />
          <rect className="wi-px wi-px-drop" x="10" y="12" width="1" height="2" />
          {kind === "heavy-rain" ? <rect className="wi-px wi-px-drop" x="12" y="14" width="1" height="2" /> : null}
        </g>
      ) : null}
      {preset === "snow" ? (
        <g className="wi-px-drops">
          <rect className="wi-px wi-px-flake" x="4" y="12" width="1" height="1" />
          <rect className="wi-px wi-px-flake" x="7" y="13" width="1" height="1" />
          <rect className="wi-px wi-px-flake" x="10" y="12" width="1" height="1" />
        </g>
      ) : null}
      {preset === "storm" ? (
        <g className="wi-px-bolt">
          <rect className="wi-px wi-px-bolt-fill" x="8" y="11" width="2" height="2" />
          <rect className="wi-px wi-px-bolt-fill" x="7" y="13" width="1" height="3" />
          <rect className="wi-px wi-px-bolt-fill" x="9" y="13" width="2" height="1" />
        </g>
      ) : null}
      {preset === "fog" ? (
        <g className="wi-px-fog">
          <rect className="wi-px wi-px-fog" x="3" y="12" width="10" height="1" />
          <rect className="wi-px wi-px-fog" x="5" y="14" width="7" height="1" />
        </g>
      ) : null}
    </svg>
  );
}

/* ------------------------------ bubble ----------------------------------- */
/* Everything is a circle: orbit dots around the sun, a cloud of merged
   bubbles, round rain. */

function BubbleIcon({ kind, isDay }: { kind: WeatherKind; isDay: boolean }) {
  const preset = scenePreset(kind);
  const raw = useId();
  const uid = `wb${raw.replace(/[^a-zA-Z0-9]/g, "")}`;
  const clear = preset === "clear";

  if (clear && isDay) {
    return (
      <svg viewBox="0 0 64 64" className="wi-svg" aria-hidden="true">
        <g className="wb-orbit">
          <circle className="wb-dot" cx="32" cy="30" r="2.4" transform="translate(0 -17)" />
          <circle className="wb-dot" cx="32" cy="30" r="1.8" transform="rotate(60 32 30) translate(0 -17)" />
          <circle className="wb-dot" cx="32" cy="30" r="2.2" transform="rotate(120 32 30) translate(0 -17)" />
          <circle className="wb-dot" cx="32" cy="30" r="1.8" transform="rotate(180 32 30) translate(0 -17)" />
          <circle className="wb-dot" cx="32" cy="30" r="2.4" transform="rotate(240 32 30) translate(0 -17)" />
          <circle className="wb-dot" cx="32" cy="30" r="1.8" transform="rotate(300 32 30) translate(0 -17)" />
        </g>
        <circle className="wb-sun" cx="32" cy="30" r="10" />
      </svg>
    );
  }

  if (clear) {
    return (
      <svg viewBox="0 0 64 64" className="wi-svg" aria-hidden="true">
        <g className="wb-moon">
          <defs>
            <mask id={uid}>
              <rect x="0" y="0" width="64" height="64" fill="white" />
              <circle cx="41" cy="22" r="11" fill="black" />
            </mask>
          </defs>
          <circle cx="31" cy="29" r="12" mask={`url(#${uid})`} />
        </g>
        <circle className="wb-dot" cx="47" cy="18" r="1.8" />
        <circle className="wb-dot" cx="50" cy="28" r="1.3" />
        <circle className="wb-dot" cx="17" cy="20" r="1.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" className="wi-svg" aria-hidden="true">
      {preset === "partly" && isDay ? (
        <g className="wb-sun wb-sun-small" transform="translate(-8 -8) scale(0.7)">
          <circle cx="32" cy="30" r="10" />
        </g>
      ) : null}
      {preset === "partly" && !isDay ? (
        <g transform="translate(-7 -7) scale(0.62)">
          <circle className="wb-moon" cx="31" cy="29" r="12" />
        </g>
      ) : null}
      {kind === "overcast" ? (
        <g className="wb-cloud wb-cloud-back" transform="translate(9 3) scale(0.68)">
          <circle cx="24" cy="40" r="9" />
          <circle cx="34" cy="35" r="11" />
          <circle cx="43" cy="41" r="8" />
        </g>
      ) : null}
      <g className="wb-cloud" transform={preset === "partly" ? "translate(4 8) scale(0.86)" : undefined}>
        <circle className="wb-bubble" cx="24" cy="40" r="9" />
        <circle className="wb-bubble wb-bubble-mid" cx="34" cy="35" r="11" />
        <circle className="wb-bubble" cx="43" cy="41" r="8" />
      </g>
      {preset === "fog" ? (
        <g className="wb-fog">
          <ellipse cx="32" cy="48" rx="14" ry="2.4" />
          <ellipse cx="30" cy="54" rx="11" ry="2.2" />
          <ellipse cx="34" cy="59" rx="8" ry="2" />
        </g>
      ) : null}
      {preset === "rain" ? (
        <g className="wb-rain">
          <circle className="wb-drop" cx="24" cy="49" r="2.2" />
          <circle className="wb-drop" cx="33" cy="51" r="2.2" />
          <circle className="wb-drop" cx="41" cy="49" r="2.2" />
          {kind === "heavy-rain" ? <circle className="wb-drop" cx="47" cy="52" r="2" /> : null}
        </g>
      ) : null}
      {preset === "snow" ? (
        <g className="wb-rain">
          <circle className="wb-flake" cx="24" cy="50" r="1.8" />
          <circle className="wb-flake" cx="33" cy="52" r="1.8" />
          <circle className="wb-flake" cx="41" cy="50" r="1.8" />
        </g>
      ) : null}
      {preset === "storm" ? (
        <g>
          {kind === "hail" ? (
            <g className="wb-rain">
              <circle className="wb-drop" cx="24" cy="50" r="1.9" />
              <circle className="wb-drop" cx="33" cy="52" r="1.9" />
              <circle className="wb-drop" cx="41" cy="50" r="1.9" />
            </g>
          ) : null}
          <path
            className="wb-bolt"
            d="M33 44 26 55h6l-3 7 11-12h-7l4-6Z"
          />
        </g>
      ) : null}
    </svg>
  );
}

/* ------------------------------ vivid ------------------------------------ */
/* The shared geometry painted with rich gradients and saturated glows. */

function VividIcon({ kind, isDay }: { kind: WeatherKind; isDay: boolean }) {
  const preset = scenePreset(kind);
  const raw = useId();
  const uid = `wv${raw.replace(/[^a-zA-Z0-9]/g, "")}`;
  const skyGrad = `${uid}-sky`;
  const sunGrad = `${uid}-sun`;
  const boltGrad = `${uid}-bolt`;
  const clear = preset === "clear";

  const defs = (
    <defs>
      <linearGradient id={skyGrad} x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0" stopColor="#93c5fd" />
        <stop offset="1" stopColor="#6366f1" />
      </linearGradient>
      <radialGradient id={sunGrad} cx="0.4" cy="0.35" r="0.85">
        <stop offset="0" stopColor="#fef08a" />
        <stop offset="0.55" stopColor="#fbbf24" />
        <stop offset="1" stopColor="#f97316" />
      </radialGradient>
      <linearGradient id={boltGrad} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fde047" />
        <stop offset="1" stopColor="#f97316" />
      </linearGradient>
    </defs>
  );

  if (clear && isDay) {
    return (
      <svg viewBox="0 0 64 64" className="wi-svg" aria-hidden="true">
        {defs}
        <g className="wv-sun">
          <circle cx="32" cy="30" r="11" fill={`url(#${sunGrad})`} />
          <circle cx="32" cy="30" r="15" className="wv-corona" />
        </g>
        <g className="wi-rays wv-rays">
          {Array.from({ length: 8 }, (_, index) => (
            <line
              key={index}
              x1="32"
              y1="13"
              x2="32"
              y2="18"
              stroke={`url(#${sunGrad})`}
              transform={`rotate(${index * 45} 32 30)`}
            />
          ))}
        </g>
      </svg>
    );
  }

  if (clear) {
    return (
      <svg viewBox="0 0 64 64" className="wi-svg" aria-hidden="true">
        {defs}
        <g className="wv-moon">
          <defs>
            <mask id={`${uid}-mm`}>
              <rect x="0" y="0" width="64" height="64" fill="white" />
              <circle cx="41" cy="23" r="12" fill="black" />
            </mask>
          </defs>
          <circle cx="31" cy="30" r="13" fill={`url(#${skyGrad})`} mask={`url(#${uid}-mm)`} />
        </g>
        <circle className="wv-star" cx="47" cy="16" r="1.7" />
        <circle className="wv-star" cx="50" cy="26" r="1.2" />
        <circle className="wv-star" cx="16" cy="18" r="1.4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" className="wi-svg" aria-hidden="true">
      {defs}
      {preset === "partly" && isDay ? (
        <g className="wv-sun wv-sun-small" transform="translate(-9 -9) scale(0.72)">
          <circle cx="32" cy="30" r="9.5" fill={`url(#${sunGrad})`} />
        </g>
      ) : null}
      {preset === "partly" && !isDay ? (
        <g transform="translate(-8 -8) scale(0.66)">
          <circle className="wv-moon" cx="31" cy="30" r="13" fill={`url(#${skyGrad})`} />
        </g>
      ) : null}
      {kind === "overcast" ? (
        <path className="wv-cloud wv-cloud-back" d={CLOUD_PATH} transform="translate(8 4) scale(0.7)" fill={`url(#${skyGrad})`} opacity="0.55" />
      ) : null}
      <path
        className="wv-cloud"
        d={CLOUD_PATH}
        transform={preset === "partly" ? "translate(4 8) scale(0.86)" : undefined}
        fill={`url(#${skyGrad})`}
      />
      {preset === "fog" ? (
        <g className="wv-fog">
          <line x1="18" y1="48" x2="46" y2="48" />
          <line x1="22" y1="53" x2="42" y2="53" />
          <line x1="26" y1="58" x2="38" y2="58" />
        </g>
      ) : null}
      {preset === "rain" ? (
        <g className="wv-rain">
          {Array.from({ length: kind === "drizzle" ? 2 : kind === "heavy-rain" ? 5 : 3 }, (_, index) => (
            <path
              key={index}
              className="wv-drop"
              d="M0 0c1.8 2.6 2.6 3.8 2.6 5a2.6 2.6 0 1 1-5.2 0c0-1.2.8-2.4 2.6-5Z"
              transform={`translate(${23 + index * 8} 47)`}
              style={{ animationDelay: `${index * 0.26}s` }}
            />
          ))}
        </g>
      ) : null}
      {preset === "snow" ? (
        <g className="wv-rain">
          {Array.from({ length: kind === "sleet" ? 2 : 4 }, (_, index) => (
            <circle
              key={index}
              className="wv-flake"
              cx={[23, 33, 41, 29][index]}
              cy={[48, 50, 48, 55][index]}
              r="2.2"
              style={{ animationDelay: `${index * 0.5}s` }}
            />
          ))}
        </g>
      ) : null}
      {preset === "storm" ? (
        <g>
          {kind === "hail" ? (
            <g className="wv-rain">
              <circle className="wv-drop" cx="23" cy="51" r="2" />
              <circle className="wv-drop" cx="31" cy="56" r="2" />
              <circle className="wv-drop" cx="39" cy="51" r="2" />
            </g>
          ) : null}
          <path className="wv-bolt" d="M32 44 24 56h6l-3 8 12-13h-7l4-7Z" fill={`url(#${boltGrad})`} />
        </g>
      ) : null}
    </svg>
  );
}

/* ------------------------------ origami ---------------------------------- */
/* Faceted paper shapes: straight edges only, two tones per shape. */

function OrigamiIcon({ kind, isDay }: { kind: WeatherKind; isDay: boolean }) {
  const preset = scenePreset(kind);
  const raw = useId();
  const uid = `wo${raw.replace(/[^a-zA-Z0-9]/g, "")}`;
  const clear = preset === "clear";

  if (clear && isDay) {
    return (
      <svg viewBox="0 0 64 64" className="wi-svg" aria-hidden="true">
        <g className="wo-rays">
          {Array.from({ length: 8 }, (_, index) => (
            <polygon
              key={index}
              className="wo-ray"
              points="32,10 35,17 29,17"
              transform={`rotate(${index * 45} 32 30)`}
            />
          ))}
        </g>
        <g className="wo-sun">
          <polygon points="32,19 41,25.5 37.5,36 26.5,36 23,25.5" />
          <polygon className="wo-facet" points="32,19 41,25.5 32,30" />
        </g>
      </svg>
    );
  }

  if (clear) {
    return (
      <svg viewBox="0 0 64 64" className="wi-svg" aria-hidden="true">
        <g className="wo-moon">
          <defs>
            <mask id={uid}>
              <rect x="0" y="0" width="64" height="64" fill="white" />
              <circle cx="42" cy="22" r="12" fill="black" />
            </mask>
          </defs>
          <circle cx="31" cy="29" r="13" mask={`url(#${uid})`} />
        </g>
        <polygon className="wo-star" points="47,15 48.3,18.2 51.5,18.7 49,21 49.7,24.2 47,22.5 44.3,24.2 45,21 42.5,18.7 45.7,18.2" />
        <polygon className="wo-star" points="17,19 18,21.2 20.3,21.5 18.6,23.1 19,25.4 17,24.2 15,25.4 15.4,23.1 13.7,21.5 16,21.2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" className="wi-svg" aria-hidden="true">
      {preset === "partly" && isDay ? (
        <g className="wo-sun wo-sun-small" transform="translate(-9 -9) scale(0.7)">
          <polygon points="32,19 41,25.5 37.5,36 26.5,36 23,25.5" />
        </g>
      ) : null}
      {preset === "partly" && !isDay ? (
        <g transform="translate(-8 -8) scale(0.62)">
          <circle className="wo-moon" cx="31" cy="29" r="13" />
        </g>
      ) : null}
      {kind === "overcast" ? (
        <g className="wo-cloud wo-cloud-back" transform="translate(9 4) scale(0.66)" opacity="0.5">
          <polygon points="16,44 24,30 36,26 46,32 50,44" />
        </g>
      ) : null}
      <g className="wo-cloud" transform={preset === "partly" ? "translate(4 8) scale(0.86)" : undefined}>
        <polygon points="16,44 24,30 36,26 46,32 50,44" />
        <polygon className="wo-facet" points="24,30 36,26 30,37" />
        <polygon className="wo-facet" points="36,26 46,32 38,38" />
      </g>
      {preset === "fog" ? (
        <g className="wo-fog">
          <polygon points="18,47 46,47 44,50 16,50" />
          <polygon points="22,53 42,53 40,56 20,56" />
        </g>
      ) : null}
      {preset === "rain" ? (
        <g className="wo-rain">
          {(kind === "drizzle" ? [26, 38] : kind === "heavy-rain" ? [23, 31, 39, 46] : [25, 35, 44]).map((x, index) => (
            <polygon
              key={index}
              className="wo-drop"
              points={`${x},48 ${x + 3.4},48 ${x + 1.7},54`}
              style={{ animationDelay: `${index * 0.3}s` }}
            />
          ))}
        </g>
      ) : null}
      {preset === "snow" ? (
        <g className="wo-rain">
          {(kind === "sleet" ? [27, 39] : [24, 34, 43]).map((x, index) => (
            <rect
              key={index}
              className="wo-flake"
              x={x}
              y="49"
              width="3.4"
              height="3.4"
              transform={`rotate(45 ${x + 1.7} 50.7)`}
              style={{ animationDelay: `${index * 0.5}s` }}
            />
          ))}
        </g>
      ) : null}
      {preset === "storm" ? (
        <g>
          {kind === "hail" ? (
            <g className="wo-rain">
              <polygon className="wo-drop" points="24,49 27.4,49 25.7,55" />
              <polygon className="wo-drop" points="34,51 37.4,51 35.7,57" />
              <polygon className="wo-drop" points="43,49 46.4,49 44.7,55" />
            </g>
          ) : null}
          <polygon className="wo-bolt" points="33,44 25,56 30.5,56 27,64 38,51 32,51 36,44" />
        </g>
      ) : null}
    </svg>
  );
}

/* ----------------------------- blueprint --------------------------------- */
/* Technical drawing: dashed construction lines, dimension marks and cross
   targets, one cyan ink. */

function BlueprintIcon({ kind, isDay }: { kind: WeatherKind; isDay: boolean }) {
  const preset = scenePreset(kind);
  const raw = useId();
  const uid = `wbp${raw.replace(/[^a-zA-Z0-9]/g, "")}`;
  const clear = preset === "clear";

  if (clear && isDay) {
    return (
      <svg viewBox="0 0 64 64" className="wi-svg" aria-hidden="true">
        <circle className="wbp-line" cx="32" cy="30" r="13" />
        <circle className="wbp-line wbp-dash" cx="32" cy="30" r="18" />
        <g className="wbp-cross">
          <path d="M32 8v6M32 46v6M10 30h6M48 30h6" />
        </g>
        <circle className="wbp-dot" cx="32" cy="30" r="2" />
      </svg>
    );
  }

  if (clear) {
    return (
      <svg viewBox="0 0 64 64" className="wi-svg" aria-hidden="true">
        <g className="wbp-line">
          <defs>
            <mask id={uid}>
              <rect x="0" y="0" width="64" height="64" fill="white" />
              <circle cx="42" cy="22" r="12" fill="black" />
            </mask>
          </defs>
          <circle cx="31" cy="29" r="13" mask={`url(#${uid})`} />
        </g>
        <circle className="wbp-line wbp-dash" cx="31" cy="29" r="18" />
        <g className="wbp-cross">
          <path d="M47 14l4 4M51 14l-4 4" />
          <path d="M14 40l3 3M17 40l-3 3" />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" className="wi-svg" aria-hidden="true">
      {preset === "partly" && isDay ? (
        <g transform="translate(-9 -9) scale(0.72)">
          <circle className="wbp-line wbp-dash" cx="32" cy="30" r="10" />
        </g>
      ) : null}
      {preset === "partly" && !isDay ? (
        <g transform="translate(-8 -8) scale(0.64)">
          <circle className="wbp-line wbp-dash" cx="31" cy="29" r="12" />
        </g>
      ) : null}
      {kind === "overcast" ? (
        <path className="wbp-line wbp-dash wbp-back" d={CLOUD_PATH} transform="translate(8 4) scale(0.7)" opacity="0.4" />
      ) : null}
      <path
        className="wbp-line wbp-dash wbp-main"
        d={CLOUD_PATH}
        transform={preset === "partly" ? "translate(4 8) scale(0.86)" : undefined}
      />
      {preset === "fog" ? (
        <g className="wbp-line wbp-thin">
          <line x1="16" y1="48" x2="48" y2="48" />
          <line x1="20" y1="53" x2="44" y2="53" />
          <line x1="25" y1="58" x2="39" y2="58" />
        </g>
      ) : null}
      {preset === "rain" ? (
        <g className="wbp-line wbp-thin">
          {(kind === "drizzle" ? [26, 38] : kind === "heavy-rain" ? [23, 30, 37, 44, 50] : [25, 34, 43]).map((x, index) => (
            <line key={index} x1={x} y1="47" x2={x - 2} y2="53" style={{ animationDelay: `${index * 0.24}s` }} />
          ))}
        </g>
      ) : null}
      {preset === "snow" ? (
        <g className="wbp-cross wbp-thin">
          {(kind === "sleet" ? [27, 39] : [24, 34, 43]).map((x, index) => (
            <path key={index} d={`M${x} 49h4M${x + 2} 47v4`} style={{ animationDelay: `${index * 0.5}s` }} />
          ))}
        </g>
      ) : null}
      {preset === "storm" ? (
        <g>
          {kind === "hail" ? (
            <g className="wbp-cross wbp-thin">
              <path d="M23 50h4M25 48v4" />
              <path d="M31 55h4M33 53v4" />
              <path d="M39 50h4M41 48v4" />
            </g>
          ) : null}
          <path className="wbp-line wbp-bolt" d="M32 44 24 56h6l-3 8 12-13h-7l4-7Z" />
        </g>
      ) : null}
      <g className="wbp-frame">
        <path d="M4 10h6M4 10v6M60 10h-6M60 10v6M4 56h6M4 56v-6M60 56h-6M60 56v-6" />
      </g>
    </svg>
  );
}

/* ------------------------------ terminal --------------------------------- */
/* Phosphor terminal: the weather rendered as monospace ASCII, with a blinking
   cursor and stepped rain. */

const TERMINAL_ROWS: Record<string, string[]> = {
  sun: [" \\ | / ", " - O - ", " / | \\ "],
  moon: ["   *   ", "  ( )  ", " *   * "],
  cloud: ["  #### ", " #####", "#######"],
  rain: ["/ / / /"],
  snow: ["* * * *"],
  bolt: [" \\/\\/  "],
  fog: ["~ ~ ~ ~"],
};

function TerminalIcon({ kind, isDay }: { kind: WeatherKind; isDay: boolean }) {
  const preset = scenePreset(kind);
  const clear = preset === "clear";
  const rows: Array<{ text: string; className: string }> = [];

  if (clear) {
    for (const row of isDay ? TERMINAL_ROWS.sun : TERMINAL_ROWS.moon) {
      rows.push({ text: row, className: "wt-row wt-big" });
    }
  } else {
    for (const row of TERMINAL_ROWS.cloud) {
      rows.push({ text: row, className: "wt-row wt-cloud" });
    }
    if (kind === "overcast") rows.push({ text: " #####", className: "wt-row wt-cloud wt-dim" });
    if (preset === "rain") rows.push({ text: TERMINAL_ROWS.rain[0], className: "wt-row wt-rain" });
    if (preset === "snow") rows.push({ text: TERMINAL_ROWS.snow[0], className: "wt-row wt-snow" });
    if (preset === "storm") {
      rows.push({ text: TERMINAL_ROWS.bolt[0], className: "wt-row wt-bolt" });
    }
    if (preset === "fog") rows.push({ text: TERMINAL_ROWS.fog[0], className: "wt-row wt-fog" });
  }

  return (
    <svg viewBox="0 0 64 64" className="wi-svg" aria-hidden="true">
      {rows.map((row, index) => (
        <text
          key={index}
          className={row.className}
          x="32"
          y={20 + index * 11}
          textAnchor="middle"
          xmlSpace="preserve"
        >
          {row.text}
        </text>
      ))}
      <text className="wt-cursor" x="32" y={20 + rows.length * 11} textAnchor="middle" xmlSpace="preserve">
        _
      </text>
    </svg>
  );
}

/* ------------------------------ cutout ----------------------------------- */
/* Paper appliqué: stacked flat layers with hard offset shadows, each layer
   drifting with its own phase. */

function CutoutIcon({ kind, isDay }: { kind: WeatherKind; isDay: boolean }) {
  const preset = scenePreset(kind);
  const raw = useId();
  const uid = `wp${raw.replace(/[^a-zA-Z0-9]/g, "")}`;
  const clear = preset === "clear";

  if (clear && isDay) {
    return (
      <svg viewBox="0 0 64 64" className="wi-svg" aria-hidden="true">
        <g className="wp-rays">
          {Array.from({ length: 8 }, (_, index) => (
            <rect
              key={index}
              className="wp-ray"
              x="30.5"
              y="8"
              width="3"
              height="7"
              rx="1.5"
              transform={`rotate(${index * 45} 32 30)`}
            />
          ))}
        </g>
        <circle className="wp-layer wp-sun-back" cx="33.4" cy="31.4" r="11" />
        <circle className="wp-layer wp-sun" cx="32" cy="30" r="11" />
      </svg>
    );
  }

  if (clear) {
    return (
      <svg viewBox="0 0 64 64" className="wi-svg" aria-hidden="true">
        <g>
          <defs>
            <mask id={uid}>
              <rect x="0" y="0" width="64" height="64" fill="white" />
              <circle cx="42" cy="22" r="12" fill="black" />
            </mask>
          </defs>
          <g className="wp-layer wp-moon-back" transform="translate(1.4 1.4)">
            <circle cx="31" cy="29" r="13" mask={`url(#${uid})`} />
          </g>
          <g className="wp-layer wp-moon">
            <circle cx="31" cy="29" r="13" mask={`url(#${uid})`} />
          </g>
        </g>
        <rect className="wp-ray" x="46" y="14" width="4" height="4" rx="1" />
        <rect className="wp-ray" x="50" y="24" width="3" height="3" rx="1" />
        <rect className="wp-ray" x="14" y="16" width="3" height="3" rx="1" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" className="wi-svg" aria-hidden="true">
      {preset === "partly" && isDay ? (
        <g className="wp-layer wp-sun wp-sun-small" transform="translate(-9 -9) scale(0.7)">
          <circle cx="32" cy="30" r="10.5" />
        </g>
      ) : null}
      {preset === "partly" && !isDay ? (
        <g transform="translate(-8 -8) scale(0.62)">
          <circle className="wp-layer wp-moon" cx="31" cy="29" r="13" />
        </g>
      ) : null}
      {kind === "overcast" ? (
        <g className="wp-cloud wp-cloud-back" transform="translate(9 3) scale(0.66)">
          <path className="wp-layer wp-shade-3" d={CLOUD_PATH} />
        </g>
      ) : null}
      <g className="wp-cloud" transform={preset === "partly" ? "translate(4 8) scale(0.86)" : undefined}>
        <path className="wp-layer wp-shade-2" d={CLOUD_PATH} transform="translate(1.6 1.6)" />
        <path className="wp-layer wp-shade-1" d={CLOUD_PATH} />
      </g>
      {preset === "fog" ? (
        <g className="wp-fog">
          <rect className="wp-layer wp-shade-1" x="16" y="46" width="32" height="3.6" rx="1.8" />
          <rect className="wp-layer wp-shade-2" x="21" y="52" width="22" height="3.2" rx="1.6" />
          <rect className="wp-layer wp-shade-1" x="26" y="57" width="13" height="3" rx="1.5" />
        </g>
      ) : null}
      {preset === "rain" ? (
        <g className="wp-rain">
          {(kind === "drizzle" ? [25, 37] : kind === "heavy-rain" ? [22, 30, 38, 46] : [24, 34, 44]).map((x, index) => (
            <rect
              key={index}
              className="wp-layer wp-drop"
              x={x}
              y="48"
              width="3.4"
              height="8"
              rx="1.7"
              style={{ animationDelay: `${index * 0.28}s` }}
            />
          ))}
        </g>
      ) : null}
      {preset === "snow" ? (
        <g className="wp-rain">
          {(kind === "sleet" ? [26, 38] : [23, 33, 42]).map((x, index) => (
            <g key={index} className="wp-layer wp-flake" style={{ animationDelay: `${index * 0.5}s` }}>
              <circle cx={x + 2} cy="51" r="2.6" />
            </g>
          ))}
        </g>
      ) : null}
      {preset === "storm" ? (
        <g>
          {kind === "hail" ? (
            <g className="wp-rain">
              <circle className="wp-layer wp-drop" cx="24" cy="51" r="2.4" />
              <circle className="wp-layer wp-drop" cx="34" cy="53" r="2.4" />
              <circle className="wp-layer wp-drop" cx="43" cy="51" r="2.4" />
            </g>
          ) : null}
          <g className="wp-layer wp-bolt">
            <path d="M33 43 24.5 56h6l-3 8.5L40.5 51h-7l4-8Z" />
          </g>
        </g>
      ) : null}
    </svg>
  );
}

/* ------------------------------ etching ---------------------------------- */
/* Engraving: shapes cut into horizontal hatch lines, like an old print. The
   hatch slowly rolls through the silhouette. */

function EtchingIcon({ kind, isDay }: { kind: WeatherKind; isDay: boolean }) {
  const preset = scenePreset(kind);
  const raw = useId();
  const uid = `we${raw.replace(/[^a-zA-Z0-9]/g, "")}`;
  const clear = preset === "clear";

  const hatch = (id: string, children?: ReactNode) => (
    <g mask={`url(#${id})`} className="wg-hatch">
      {Array.from({ length: 14 }, (_, index) => (
        <line key={index} x1="4" y1={10 + index * 3.4} x2="60" y2={10 + index * 3.4} />
      ))}
      {children}
    </g>
  );

  if (clear && isDay) {
    return (
      <svg viewBox="0 0 64 64" className="wi-svg" aria-hidden="true">
        <defs>
          <mask id={uid}>
            <circle cx="32" cy="30" r="12" fill="white" />
          </mask>
        </defs>
        {hatch(uid)}
        <g className="wg-ring">
          {Array.from({ length: 8 }, (_, index) => (
            <line
              key={index}
              x1="32"
              y1="12"
              x2="32"
              y2="16"
              transform={`rotate(${index * 45} 32 30)`}
            />
          ))}
        </g>
      </svg>
    );
  }

  if (clear) {
    return (
      <svg viewBox="0 0 64 64" className="wi-svg" aria-hidden="true">
        <defs>
          <mask id={uid}>
            <rect x="0" y="0" width="64" height="64" fill="white" />
            <circle cx="42" cy="22" r="12" fill="black" />
            <circle cx="31" cy="29" r="13" fill="white" />
          </mask>
        </defs>
        {hatch(uid)}
        <g className="wg-star">
          <path d="M47 13l1.2 2.9 3 .4-2.2 2.1.5 3-2.5-1.5-2.5 1.5.5-3-2.2-2.1 3-.4Z" />
        </g>
        <g className="wg-star">
          <path d="M15 17l1 2.3 2.5.3-1.8 1.7.4 2.5-2.1-1.2-2.1 1.2.4-2.5-1.8-1.7 2.5-.3Z" />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" className="wi-svg" aria-hidden="true">
      <defs>
        <mask id={uid}>
          {preset === "partly" && isDay ? <circle cx="20" cy="17" r="8" fill="white" /> : null}
          {preset === "partly" && !isDay ? (
            <g>
              <rect x="0" y="0" width="30" height="26" fill="white" />
              <circle cx="19" cy="16" r="7" fill="black" />
              <circle cx="16" cy="19" r="9" fill="white" />
            </g>
          ) : null}
          <path
            d={CLOUD_PATH}
            transform={preset === "partly" ? "translate(4 8) scale(0.86)" : undefined}
            fill="white"
          />
        </mask>
      </defs>
      {hatch(uid)}
      {preset === "fog" ? (
        <g className="wg-thin">
          <line x1="17" y1="48" x2="47" y2="48" />
          <line x1="21" y1="53" x2="43" y2="53" />
          <line x1="26" y1="58" x2="38" y2="58" />
        </g>
      ) : null}
      {preset === "rain" ? (
        <g className="wg-rain">
          {(kind === "drizzle" ? [26, 38] : kind === "heavy-rain" ? [22, 29, 36, 43, 50] : [24, 33, 42]).map((x, index) => (
            <line key={index} x1={x} y1="47" x2={x - 1.6} y2="53" style={{ animationDelay: `${index * 0.26}s` }} />
          ))}
        </g>
      ) : null}
      {preset === "snow" ? (
        <g className="wg-rain">
          {(kind === "sleet" ? [27, 39] : [24, 34, 43]).map((x, index) => (
            <circle key={index} cx={x + 1.5} cy="50" r="1.5" style={{ animationDelay: `${index * 0.5}s` }} />
          ))}
        </g>
      ) : null}
      {preset === "storm" ? (
        <g>
          {kind === "hail" ? (
            <g className="wg-rain">
              <circle cx="24" cy="50" r="1.6" />
              <circle cx="34" cy="52" r="1.6" />
              <circle cx="43" cy="50" r="1.6" />
            </g>
          ) : null}
          <path className="wg-bolt" d="M32 44 24 56h6l-3 8 12-13h-7l4-7Z" />
        </g>
      ) : null}
    </svg>
  );
}

/* ------------------------------ hologram --------------------------------- */
/* Iridescent fill with a light band sweeping through the silhouette. */

const HOLO_STOPS = ["#22d3ee", "#a78bfa", "#f472b6", "#fbbf24"];

function HologramIcon({ kind, isDay }: { kind: WeatherKind; isDay: boolean }) {
  const preset = scenePreset(kind);
  const raw = useId();
  const uid = `wh${raw.replace(/[^a-zA-Z0-9]/g, "")}`;
  const grad = `${uid}-g`;
  const shine = `${uid}-s`;
  const clear = preset === "clear";

  const defs = (
    <defs>
      <linearGradient id={grad} x1="0" y1="0" x2="1" y2="1">
        {HOLO_STOPS.map((stop, index) => (
          <stop key={stop} offset={index / (HOLO_STOPS.length - 1)} stopColor={stop} />
        ))}
      </linearGradient>
      <linearGradient id={shine} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
        <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.75" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
    </defs>
  );

  if (clear && isDay) {
    return (
      <svg viewBox="0 0 64 64" className="wi-svg" aria-hidden="true">
        {defs}
        <circle cx="32" cy="30" r="11.5" fill={`url(#${grad})`} />
        <circle className="wh-shine" cx="32" cy="30" r="11.5" fill={`url(#${shine})`} />
        <g className="wh-rays">
          {Array.from({ length: 8 }, (_, index) => (
            <line
              key={index}
              x1="32"
              y1="12"
              x2="32"
              y2="16.5"
              transform={`rotate(${index * 45} 32 30)`}
            />
          ))}
        </g>
      </svg>
    );
  }

  if (clear) {
    return (
      <svg viewBox="0 0 64 64" className="wi-svg" aria-hidden="true">
        {defs}
        <defs>
          <mask id={`${uid}-m`}>
            <rect x="0" y="0" width="64" height="64" fill="white" />
            <circle cx="42" cy="22" r="12" fill="black" />
          </mask>
        </defs>
        <g mask={`url(#${uid}-m)`}>
          <circle cx="31" cy="29" r="13" fill={`url(#${grad})`} />
          <rect className="wh-shine" x="14" y="10" width="34" height="40" fill={`url(#${shine})`} />
        </g>
        <circle className="wh-dot" cx="47" cy="16" r="1.6" />
        <circle className="wh-dot" cx="50" cy="26" r="1.2" />
        <circle className="wh-dot" cx="16" cy="18" r="1.4" />
      </svg>
    );
  }

  const transform = preset === "partly" ? "translate(4 8) scale(0.86)" : undefined;

  return (
    <svg viewBox="0 0 64 64" className="wi-svg" aria-hidden="true">
      {defs}
      <defs>
        <mask id={`${uid}-m`}>
          {preset === "partly" && isDay ? <circle cx="20" cy="17" r="8.5" fill="white" /> : null}
          {preset === "partly" && !isDay ? <circle cx="13" cy="11" r="7.5" fill="white" /> : null}
          <path d={CLOUD_PATH} transform={transform} fill="white" />
        </mask>
      </defs>
      <g mask={`url(#${uid}-m)`}>
        <rect x="4" y="4" width="56" height="56" fill={`url(#${grad})`} />
        <rect className="wh-shine" x="4" y="4" width="56" height="56" fill={`url(#${shine})`} />
      </g>
      {preset === "fog" ? (
        <g className="wh-thin">
          <line x1="17" y1="48" x2="47" y2="48" />
          <line x1="21" y1="53" x2="43" y2="53" />
          <line x1="26" y1="58" x2="38" y2="58" />
        </g>
      ) : null}
      {preset === "rain" ? (
        <g className="wh-rain">
          {(kind === "drizzle" ? [26, 38] : kind === "heavy-rain" ? [22, 29, 36, 43, 50] : [24, 33, 42]).map((x, index) => (
            <path
              key={index}
              className="wh-drop"
              d="M0 0c1.6 2.3 2.4 3.5 2.4 4.6a2.4 2.4 0 1 1-4.8 0C-0.4 3.5.4 2.3 2 0Z"
              transform={`translate(${x + 1} 47)`}
              style={{ animationDelay: `${index * 0.26}s` }}
            />
          ))}
        </g>
      ) : null}
      {preset === "snow" ? (
        <g className="wh-rain">
          {(kind === "sleet" ? [27, 39] : [24, 34, 43]).map((x, index) => (
            <circle key={index} className="wh-drop" cx={x + 1.5} cy="50" r="1.7" style={{ animationDelay: `${index * 0.5}s` }} />
          ))}
        </g>
      ) : null}
      {preset === "storm" ? (
        <g>
          {kind === "hail" ? (
            <g className="wh-rain">
              <circle className="wh-drop" cx="24" cy="50" r="1.8" />
              <circle className="wh-drop" cx="34" cy="52" r="1.8" />
              <circle className="wh-drop" cx="43" cy="50" r="1.8" />
            </g>
          ) : null}
          <path className="wh-bolt" d="M32 44 24 56h6l-3 8 12-13h-7l4-7Z" fill="#fbbf24" />
        </g>
      ) : null}
    </svg>
  );
}

/* ------------------------------- badge ----------------------------------- */
/* Emblem: a solid disc with the weather cut out of it in white. */

function BadgeIcon({ kind, isDay }: { kind: WeatherKind; isDay: boolean }) {
  const preset = scenePreset(kind);
  const raw = useId();
  const uid = `wd${raw.replace(/[^a-zA-Z0-9]/g, "")}`;
  const disc = `${uid}-d`;
  const clear = preset === "clear";

  const defs = (
    <defs>
      <mask id={disc}>
        <rect x="0" y="0" width="64" height="64" fill="white" />
        {clear && isDay ? (
          <g fill="black">
            <circle cx="32" cy="29" r="8.5" />
            {Array.from({ length: 8 }, (_, index) => (
              <rect
                key={index}
                x="30.8"
                y="15"
                width="2.4"
                height="4.4"
                rx="1.2"
                transform={`rotate(${index * 45} 32 29)`}
              />
            ))}
          </g>
        ) : null}
        {clear && !isDay ? (
          <g fill="black">
            <circle cx="31" cy="29" r="10" />
            <circle cx="38.5" cy="24.5" r="8.5" fill="white" />
            <circle cx="46" cy="18" r="1.6" />
            <circle cx="48" cy="26" r="1.2" />
          </g>
        ) : null}
        {!clear ? (
          <path
            d={CLOUD_PATH}
            transform={preset === "partly" ? "translate(4 8) scale(0.86)" : undefined}
            fill="black"
          />
        ) : null}
        {!clear && (preset === "rain" || preset === "snow" || preset === "storm") ? (
          <g fill="black">
            {(preset === "rain"
              ? kind === "drizzle"
                ? [26, 38]
                : kind === "heavy-rain"
                  ? [22, 30, 38, 46]
                  : [24, 34, 44]
              : preset === "snow"
                ? kind === "sleet"
                  ? [26, 38]
                  : [23, 33, 42]
                : kind === "hail"
                  ? [24, 34, 44]
                  : []
            ).map((x, index) => (
              <circle key={index} cx={x + 1.5} cy="50.5" r={preset === "snow" ? 1.4 : 1.8} />
            ))}
          </g>
        ) : null}
        {!clear && preset === "storm" && kind !== "hail" ? (
          <path d="M32 42 25 53h5l-2.5 7 10-11h-6l3.5-7Z" fill="black" />
        ) : null}
        {!clear && preset === "fog" ? (
          <g fill="black">
            <rect x="18" y="47" width="28" height="3" rx="1.5" />
            <rect x="22" y="52" width="20" height="3" rx="1.5" />
            <rect x="27" y="57" width="12" height="3" rx="1.5" />
          </g>
        ) : null}
      </mask>
    </defs>
  );

  return (
    <svg viewBox="0 0 64 64" className="wi-svg" aria-hidden="true">
      {defs}
      <g className="wd-disc">
        <circle cx="32" cy="32" r="26" mask={`url(#${disc})`} />
        <circle className="wd-rim" cx="32" cy="32" r="26" />
      </g>
    </svg>
  );
}

/* ------------------------------- glitch ---------------------------------- */
/* RGB-split print: cyan and magenta ghosts behind a white main shape, both
   jittering on a stepped timer. */

function GlitchIcon({ kind, isDay }: { kind: WeatherKind; isDay: boolean }) {
  const preset = scenePreset(kind);
  const raw = useId();
  const uid = `wq${raw.replace(/[^a-zA-Z0-9]/g, "")}`;
  const clear = preset === "clear";

  const main = (
    <g>
      {clear && isDay ? (
        <g className="wq-main">
          <circle cx="32" cy="30" r="10" />
          <g className="wq-main-thin">
            {Array.from({ length: 8 }, (_, index) => (
              <line key={index} x1="32" y1="13" x2="32" y2="17" transform={`rotate(${index * 45} 32 30)`} />
            ))}
          </g>
        </g>
      ) : null}
      {clear && !isDay ? (
        <g className="wq-main">
          <g>
            <circle cx="31" cy="29" r="13" mask={`url(#${uid})`} />
          </g>
          <circle className="wq-main-thin" cx="48" cy="16" r="1.6" />
          <circle className="wq-main-thin" cx="51" cy="26" r="1.2" />
        </g>
      ) : null}
      {!clear ? (
        <g className="wq-main">
          {preset === "partly" && isDay ? <circle cx="20" cy="17" r="7.5" /> : null}
          {preset === "partly" && !isDay ? (
            <g>
              <circle cx="13" cy="11" r="7" />
              <circle cx="16" cy="14" r="6" fill="var(--bg)" opacity="0" />
            </g>
          ) : null}
          {kind === "overcast" ? (
            <path d={CLOUD_PATH} transform="translate(8 4) scale(0.7)" className="wq-main-thin" />
          ) : null}
          <path d={CLOUD_PATH} transform={preset === "partly" ? "translate(4 8) scale(0.86)" : undefined} />
          {preset === "fog" ? (
            <g className="wq-main-thin">
              <line x1="17" y1="48" x2="47" y2="48" />
              <line x1="21" y1="53" x2="43" y2="53" />
              <line x1="26" y1="58" x2="38" y2="58" />
            </g>
          ) : null}
          {preset === "rain" ? (
            <g className="wq-main-thin">
              {(kind === "drizzle" ? [26, 38] : kind === "heavy-rain" ? [22, 30, 38, 46] : [24, 34, 44]).map((x, index) => (
                <line key={index} x1={x} y1="47" x2={x - 1.6} y2="53" style={{ animationDelay: `${index * 0.26}s` }} />
              ))}
            </g>
          ) : null}
          {preset === "snow" ? (
            <g className="wq-main-thin">
              {(kind === "sleet" ? [27, 39] : [24, 34, 43]).map((x, index) => (
                <circle key={index} cx={x + 1.5} cy="50" r="1.5" style={{ animationDelay: `${index * 0.5}s` }} />
              ))}
            </g>
          ) : null}
          {preset === "storm" ? (
            <g>
              {kind === "hail" ? (
                <g className="wq-main-thin">
                  <circle cx="24" cy="50" r="1.6" />
                  <circle cx="34" cy="52" r="1.6" />
                  <circle cx="43" cy="50" r="1.6" />
                </g>
              ) : null}
              <path d="M32 44 24 56h6l-3 8 12-13h-7l4-7Z" className="wq-bolt" />
            </g>
          ) : null}
        </g>
      ) : null}
    </g>
  );

  const ghost = (offset: number) => <g transform={`translate(${offset} 0)`}>{main}</g>;

  return (
    <svg viewBox="0 0 64 64" className="wi-svg" aria-hidden="true">
      <defs>
        <mask id={uid}>
          <rect x="0" y="0" width="64" height="64" fill="white" />
          <circle cx="42" cy="22" r="12" fill="black" />
        </mask>
      </defs>
      <g className="wq-ghost wq-ghost-r">{ghost(-1.6)}</g>
      <g className="wq-ghost wq-ghost-c">{ghost(1.6)}</g>
      {main}
    </svg>
  );
}
/* Dot-and-line star map: the cloud as connected stars, round raindrops. */

function ConstellationIcon({ kind, isDay }: { kind: WeatherKind; isDay: boolean }) {
  const preset = scenePreset(kind);
  const clear = preset === "clear";

  if (clear && isDay) {
    return (
      <svg viewBox="0 0 64 64" className="wi-svg" aria-hidden="true">
        <circle className="wc-dot wc-dot-big" cx="32" cy="30" r="5" />
        <g className="wc-ring">
          {Array.from({ length: 6 }, (_, index) => (
            <circle
              key={index}
              className="wc-dot"
              cx="32"
              cy="30"
              r="1.7"
              transform={`rotate(${index * 60} 32 30) translate(0 -16)`}
              style={{ animationDelay: `${index * 0.45}s` }}
            />
          ))}
        </g>
      </svg>
    );
  }

  if (clear) {
    return (
      <svg viewBox="0 0 64 64" className="wi-svg" aria-hidden="true">
        <g className="wc-line">
          <path d="M25 18 A13 13 0 1 0 39 41" />
        </g>
        <circle className="wc-dot wc-dot-big" cx="25" cy="18" r="2.6" />
        <circle className="wc-dot" cx="18" cy="30" r="1.8" />
        <circle className="wc-dot" cx="21" cy="40" r="2.1" />
        <circle className="wc-dot" cx="30" cy="45" r="1.8" />
        <circle className="wc-dot" cx="39" cy="41" r="2.4" />
        <circle className="wc-dot" cx="48" cy="15" r="1.5" style={{ animationDelay: "0.5s" }} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" className="wi-svg" aria-hidden="true">
      {preset === "partly" && isDay ? (
        <g transform="translate(-9 -9) scale(0.7)">
          <circle className="wc-dot wc-dot-big" cx="32" cy="30" r="4.6" />
        </g>
      ) : null}
      {preset === "partly" && !isDay ? (
        <g transform="translate(-8 -8) scale(0.62)">
          <path className="wc-line" d="M25 18 A13 13 0 1 0 39 41" />
          <circle className="wc-dot" cx="25" cy="18" r="2.2" />
        </g>
      ) : null}
      <g className="wc-line">
        <path d="M17 44a9 9 0 0 1 .6-17.9 13 13 0 0 1 24.6-1.6A9.5 9.5 0 0 1 47 44Z" />
      </g>
      {kind === "overcast" ? (
        <g className="wc-line" transform="translate(8 4) scale(0.7)" opacity="0.4">
          <path d="M17 44a9 9 0 0 1 .6-17.9 13 13 0 0 1 24.6-1.6A9.5 9.5 0 0 1 47 44Z" />
        </g>
      ) : null}
      <g className="wc-dots">
        <circle className="wc-dot" cx="17" cy="44" r="2.2" />
        <circle className="wc-dot" cx="17.6" cy="26.1" r="1.7" />
        <circle className="wc-dot" cx="30" cy="16" r="2.4" />
        <circle className="wc-dot" cx="42.2" cy="24.5" r="1.7" />
        <circle className="wc-dot" cx="47" cy="44" r="2.2" />
      </g>
      {preset === "fog" ? (
        <g className="wc-line wc-thin">
          <line x1="18" y1="48" x2="46" y2="48" />
          <line x1="22" y1="53" x2="42" y2="53" />
          <line x1="26" y1="58" x2="38" y2="58" />
        </g>
      ) : null}
      {preset === "rain" ? (
        <g className="wc-rain">
          {(kind === "drizzle" ? [26, 38] : kind === "heavy-rain" ? [22, 30, 38, 46] : [25, 34, 43]).map((x, index) => (
            <circle key={index} className="wc-dot wc-fall" cx={x} cy="49" r="1.9" style={{ animationDelay: `${index * 0.3}s` }} />
          ))}
        </g>
      ) : null}
      {preset === "snow" ? (
        <g className="wc-rain">
          {(kind === "sleet" ? [27, 39] : [24, 34, 43]).map((x, index) => (
            <circle key={index} className="wc-dot wc-fall wc-slow" cx={x} cy="50" r="1.4" style={{ animationDelay: `${index * 0.55}s` }} />
          ))}
        </g>
      ) : null}
      {preset === "storm" ? (
        <g>
          {kind === "hail" ? (
            <g className="wc-rain">
              <circle className="wc-dot wc-fall" cx="24" cy="50" r="1.7" />
              <circle className="wc-dot wc-fall" cx="34" cy="52" r="1.7" />
              <circle className="wc-dot wc-fall" cx="43" cy="50" r="1.7" />
            </g>
          ) : null}
          <path className="wc-bolt" d="M32 44 24 56h6l-3 8 12-13h-7l4-7Z" />
        </g>
      ) : null}
    </svg>
  );
}

export function WeatherIcon({
  kind,
  isDay = true,
  pack,
  motion = "full",
  size = 64,
  className = "",
  title,
}: WeatherIconProps) {
  if (isDay === null && (kind === "clear" || kind === "partly")) {
    // Solar phase is occasionally absent in station observations.
    return <span className={className} aria-hidden="true" />;
  }
  isDay ??= true; // Cloud/precipitation glyphs do not require a solar phase.
  if (kind === "unknown") return <span className={className} aria-label="Conditions unavailable">—</span>;
  const label = title ?? kind;
  const style = { width: size, height: size };

  if (pack === "emoji") {
    const [dayEmoji, nightEmoji] = EMOJI[kind];
    return (
      <span
        className={`wi wi-emoji ${className}`}
        data-motion={motion}
        data-kind={kind}
        style={{ ...style, fontSize: size * 0.78 }}
        role="img"
        aria-label={label}
      >
        <span className="wi-emoji-glyph">{isDay ? dayEmoji : nightEmoji}</span>
      </span>
    );
  }

  if (pack === "pixel") {
    return (
      <span
        className={`wi wi-pixel ${className}`}
        data-motion={motion}
        data-kind={kind}
        style={style}
        role="img"
        aria-label={label}
      >
        <PixelIcon kind={kind} isDay={isDay} />
      </span>
    );
  }

  if (pack === "bubble") {
    return (
      <span
        className={`wi wi-bubble ${className}`}
        data-motion={motion}
        data-kind={kind}
        style={style}
        role="img"
        aria-label={label}
      >
        <BubbleIcon kind={kind} isDay={isDay} />
      </span>
    );
  }

  if (pack === "vivid") {
    return (
      <span
        className={`wi wi-vivid ${className}`}
        data-motion={motion}
        data-kind={kind}
        style={style}
        role="img"
        aria-label={label}
      >
        <VividIcon kind={kind} isDay={isDay} />
      </span>
    );
  }

  if (pack === "origami") {
    return (
      <span
        className={`wi wi-origami ${className}`}
        data-motion={motion}
        data-kind={kind}
        style={style}
        role="img"
        aria-label={label}
      >
        <OrigamiIcon kind={kind} isDay={isDay} />
      </span>
    );
  }

  if (pack === "blueprint") {
    return (
      <span
        className={`wi wi-blueprint ${className}`}
        data-motion={motion}
        data-kind={kind}
        style={style}
        role="img"
        aria-label={label}
      >
        <BlueprintIcon kind={kind} isDay={isDay} />
      </span>
    );
  }

  if (pack === "terminal") {
    return (
      <span
        className={`wi wi-terminal ${className}`}
        data-motion={motion}
        data-kind={kind}
        style={style}
        role="img"
        aria-label={label}
      >
        <TerminalIcon kind={kind} isDay={isDay} />
      </span>
    );
  }

  if (pack === "constellation") {
    return (
      <span
        className={`wi wi-constellation ${className}`}
        data-motion={motion}
        data-kind={kind}
        style={style}
        role="img"
        aria-label={label}
      >
        <ConstellationIcon kind={kind} isDay={isDay} />
      </span>
    );
  }

  if (pack === "cutout") {
    return (
      <span
        className={`wi wi-cutout ${className}`}
        data-motion={motion}
        data-kind={kind}
        style={style}
        role="img"
        aria-label={label}
      >
        <CutoutIcon kind={kind} isDay={isDay} />
      </span>
    );
  }

  if (pack === "etching") {
    return (
      <span
        className={`wi wi-etching ${className}`}
        data-motion={motion}
        data-kind={kind}
        style={style}
        role="img"
        aria-label={label}
      >
        <EtchingIcon kind={kind} isDay={isDay} />
      </span>
    );
  }

  if (pack === "hologram") {
    return (
      <span
        className={`wi wi-hologram ${className}`}
        data-motion={motion}
        data-kind={kind}
        style={style}
        role="img"
        aria-label={label}
      >
        <HologramIcon kind={kind} isDay={isDay} />
      </span>
    );
  }

  if (pack === "badge") {
    return (
      <span
        className={`wi wi-badge ${className}`}
        data-motion={motion}
        data-kind={kind}
        style={style}
        role="img"
        aria-label={label}
      >
        <BadgeIcon kind={kind} isDay={isDay} />
      </span>
    );
  }

  if (pack === "glitch") {
    return (
      <span
        className={`wi wi-glitch ${className}`}
        data-motion={motion}
        data-kind={kind}
        style={style}
        role="img"
        aria-label={label}
      >
        <GlitchIcon kind={kind} isDay={isDay} />
      </span>
    );
  }

  return (
    <span
      className={`wi wi-svgpack ${className}`}
      data-pack={pack}
      data-motion={motion}
      data-kind={kind}
      style={style}
      role="img"
      aria-label={label}
    >
      <svg viewBox="0 0 64 64" className="wi-svg" aria-hidden="true">
        <SvgGlyph kind={kind} isDay={isDay} pack={pack} />
      </svg>
    </span>
  );
}
