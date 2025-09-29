type Props = { value: number; className?: string };

export function Progress({ value, className }: Props) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div className={`w-full h-2 rounded-full bg-muted ${className || ""}`}>
      <div
        className="h-2 rounded-full bg-eco-primary"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
