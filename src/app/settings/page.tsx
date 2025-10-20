export default function SettingsPage() {
  return (
    <section className="space-y-4">
      <div className="card p-4">
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-sm text-neutral-600 mt-1">
          Profile, language, and accessibility preferences (coming soon).
        </p>
      </div>
      <div className="card p-4">
        <h3 className="font-medium">Privacy</h3>
        <p className="text-sm text-neutral-600 mt-1">
          Export your data and manage permissions.
        </p>
      </div>
    </section>
  );
}
