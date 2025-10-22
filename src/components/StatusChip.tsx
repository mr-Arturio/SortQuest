"use client";

import type { BinTag } from "../lib/scanner-types";

type Props = {
  testMode: boolean;
  demoNoQr: boolean;
  sessionToken: string | null;
  binTag: BinTag | null;
};

export default function StatusChip({
  testMode,
  demoNoQr,
  sessionToken,
  binTag,
}: Props) {
  const text = testMode
    ? "Test mode: tap Scan"
    : demoNoQr
    ? "Demo mode: QR optional"
    : sessionToken
    ? "Session active"
    : binTag
    ? "Verifying QR…"
    : "Show your BinTag QR";

  return <span className="chip bg-white/90 text-neutral-800">{text}</span>;
}
