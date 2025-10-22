"use client";

import { useMemo } from "react";
import type { Box } from "../lib/scanner-types";

type Props = {
  box: Box;
  viewEl: HTMLDivElement | null;
  videoEl: HTMLVideoElement | null;
};

export default function DetectionOutline({ box, viewEl, videoEl }: Props) {
  const style = useMemo(() => {
    if (!box || !viewEl || !videoEl) return null;

    const containerW = viewEl.clientWidth;
    const containerH = viewEl.clientHeight;
    const vW = videoEl.videoWidth || 640;
    const vH = videoEl.videoHeight || 480;
    const videoAR = vW / vH;
    const containerAR = containerW / containerH;

    let vw: number, vh: number, vx: number, vy: number;
    if (videoAR > containerAR) {
      vw = containerW;
      vh = containerW / videoAR;
      vx = 0;
      vy = (containerH - vh) / 2;
    } else {
      vh = containerH;
      vw = containerH * videoAR;
      vy = 0;
      vx = (containerW - vw) / 2;
    }

    const left = vx + box.x * vw;
    const top = vy + box.y * vh;
    const width = box.w * vw;
    const height = box.h * vh;

    return { left, top, width, height };
  }, [box, viewEl, videoEl]);

  if (!box || !style) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute border-2 rounded-md"
        style={{
          left: style.left,
          top: style.top,
          width: style.width,
          height: style.height,
          borderColor: "rgb(16,185,129)",
          boxShadow:
            "0 0 0 2px rgba(16,185,129,0.45) inset, 0 0 8px rgba(16,185,129,0.35)",
        }}
      />
      {box.label && (
        <div
          className="absolute px-2 py-0.5 text-xs font-medium rounded-md"
          style={{
            left: style.left,
            top: Math.max(0, style.top - 22),
            background: "rgba(16,185,129,0.9)",
            color: "white",
          }}
        >
          {box.label}
          {typeof box.score === "number" ? ` · ${(box.score * 100) | 0}%` : ""}
        </div>
      )}
    </div>
  );
}
