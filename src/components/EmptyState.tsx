export default function EmptyState({
  title = "Tomt här",
  hint = "Skapa något nytt för att fylla sidan.",
  actionLabel,
  onAction,
}: {
  title?: string;
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="grid place-items-center py-14 text-center">
      <div className="max-w-sm">
        <h2 className="text-lg font-semibold mb-1">{title}</h2>
        <p className="text-stone-600 mb-4">{hint}</p>
        {actionLabel && (
          <button
            onClick={onAction}
            className="btn-accent lift"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}