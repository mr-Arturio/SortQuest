"use client";

import { RefObject } from "react";
import type { Box } from "../lib/scanner-types";

type Props = {
  box: Box;
  viewRef: RefObject<HTMLDivElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
};

export default function DetectionOutline({ box, viewRef, videoRef }: Props) {
  if (!box || !viewRef.current || !videoRef.current) return null;

  const containerW = viewRef.current.clientWidth;
  const containerH = viewRef.current.clientHeight;
  const vW = videoRef.current.videoWidth || 640;
  const vH = videoRef.current.videoHeight || 480;
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

  const left = vx + box!.x * vw;
  const top = vy + box!.y * vh;
  const width = box!.w * vw;
  const height = box!.h * vh;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute border-2 rounded-md"
        style={{
          left,
          top,
          width,
          height,
          borderColor: "rgb(16,185,129)",
          boxShadow:
            "0 0 0 2px rgba(16,185,129,0.45) inset, 0 0 8px rgba(16,185,129,0.35)",
        }}
      />
      {box!.label && (
        <div
          className="absolute px-2 py-0.5 text-xs font-medium rounded-md"
          style={{
            left,
            top: Math.max(0, top - 22),
            background: "rgba(16,185,129,0.9)",
            color: "white",
          }}
        >
          {box!.label}
          {typeof box!.score === "number"
            ? ` · ${(box!.score * 100) | 0}%`
            : ""}
        </div>
      )}
    </div>
  );
}
