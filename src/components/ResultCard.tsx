"use client";

type Result = {
  label: string;
  material: string;
  bin: string;
  years: number;
  points: number;
  ahash: string;
  confidence: number;
  tip: string;
  _mode?: "heuristic" | "server";
  _model?: string;
  risk_score?: number;
};

type Props = { result: Result };

export default function ResultCard({ result }: Props) {
  return (
    <div className="card p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-500">Prediction</div>
        <div className="flex gap-2">
          {result._mode === "server" ? (
            <span className="chip">AI: {result._model || "Bedrock Nova"}</span>
          ) : (
            <span className="chip bg-amber-100 text-amber-700">
              Offline rules
            </span>
          )}
        </div>
      </div>

      <div className="text-lg font-semibold">
        {result.label} <span className="text-neutral-400">→</span>{" "}
        <span className="uppercase font-mono">{result.material}</span>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <span className="chip">
          Bin: <b className="ml-1">{result.bin}</b>
        </span>
        <span className="chip">
          Saved:{" "}
          <b className="ml-1">
            {Math.round(result.years).toLocaleString()} yrs
          </b>
        </span>
        <span className="chip">
          Points: <b className="ml-1">{result.points}</b>
        </span>
        {typeof result.risk_score === "number" && result.risk_score > 0.6 && (
          <span className="chip bg-amber-100 text-amber-700">High risk</span>
        )}
      </div>

      <p className="text-neutral-600 text-sm">
        Tip:{" "}
        {result.tip ?? "Rinse/flatten when possible to reduce contamination."}
      </p>
      <p className="text-xs text-neutral-500">
        Privacy: on-device vision; only a perceptual hash + label is stored.
      </p>
    </div>
  );
}
