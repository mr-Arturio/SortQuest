"use client";

type Props = {
  testMode: boolean;
  demoNoQr: boolean;
  sessionToken: string | null;
  binTagPresent: boolean;
};

export default function StatusChip({
  testMode,
  demoNoQr,
  sessionToken,
  binTagPresent,
}: Props) {
  const text = testMode
    ? "Test mode: tap Scan"
    : demoNoQr
    ? "Demo mode: QR optional"
    : sessionToken
    ? "Session active"
    : binTagPresent
    ? "Verifying QR…"
    : "Show your BinTag QR";

  return <span className="chip bg-white/90 text-neutral-800">{text}</span>;
}
