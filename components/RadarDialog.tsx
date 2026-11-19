"use client";

import { useState } from "react";
import { usePrefs } from "@/lib/client/prefs";
import type { Place } from "@/lib/types";
import { Modal } from "./Modal";

function regionFor({lat, lon}: Place) {
  if (lat >= 50 && lat <= 72 && (lon <= -129 || lon >= 170)) return ["ALASKA", "Alaska"];
  if (lat >= 12 && lat <= 16 && lon >= 143 && lon <= 147) return ["GUAM", "Guam"];
  if (lat >= 18 && lat <= 23 && lon >= -161 && lon <= -154) return ["HAWAII", "Hawaii"];
  if (lat >= 16 && lat <= 20 && lon >= -69 && lon <= -64) return ["CARIB", "Puerto Rico and the US Virgin Islands"];
  if (lat >= 24 && lat <= 50 && lon >= -125 && lon <= -66) return ["CONUS-LARGE", "Contiguous United States"];
  return null;
}

export function RadarDialog({ open, onClose, place }: {open: boolean; onClose: () => void; place: Place}) {
  const { t } = usePrefs();
  const region = regionFor(place);
  return (
    <Modal open={open} onClose={onClose} title={t("radar.open")} closeLabel={t("common.close")} size="lg">
      {open && (region
        ? <RadarImage key={region[0]} product={region[0]} title={region[1]} />
        : <p>The US regional radar mosaics do not cover this location.</p>)}
    </Modal>
  );
}

function RadarImage({ product, title }: {product: string; title: string}) {
  const [failed, setFailed] = useState(false);
  return (
    <figure>
      {failed ? <p role="status">The radar image is unavailable.</p> : (
        <img src={`https://radar.weather.gov/ridge/standard/${product}_loop.gif`}
          referrerPolicy="no-referrer" alt={`Radar reflectivity for ${title}`}
          style={{ width: "100%", height: "auto" }} onError={() => setFailed(true)} />
      )}
      <figcaption>{title} · NOAA/NWS radar. Acquisition times appear on the frames.</figcaption>
    </figure>
  );
}
