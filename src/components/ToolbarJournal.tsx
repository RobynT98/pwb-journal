import Button from "@/components/ui/Button";

type BlockType = "h1" | "paragraph" | "quote" | "checklist" | "divider" | "image" | "sketch";

export default function ToolbarJournal({ onAdd }: { onAdd: (t: BlockType) => void }) {
  return (
    <div className="sticky top-[68px] z-20">
      <div className="rounded-2xl border border-stone-200 bg-white/80 backdrop-blur p-2 md:p-3 flex flex-wrap gap-2">
        <Button variant="solid" rounded="full" onClick={() => onAdd("paragraph")}>+ Stycke</Button>
        <Button rounded="full" onClick={() => onAdd("h1")}>Rubrik</Button>
        <Button rounded="full" onClick={() => onAdd("quote")}>Citat</Button>
        <Button rounded="full" onClick={() => onAdd("checklist")}>Checklista</Button>
        <Button rounded="full" onClick={() => onAdd("divider")}>Avdelare</Button>
        <Button rounded="full" onClick={() => onAdd("image")}>Bild</Button>
        <Button rounded="full" onClick={() => onAdd("sketch")}>Skiss</Button>

        {/* “Mer”-meny utan lib */}
        <details className="ml-auto group">
          <summary className="list-none">
            <Button rounded="full" variant="ghost">Mer ▾</Button>
          </summary>
          <div className="absolute mt-2 right-2 min-w-[220px] rounded-xl border border-stone-200 bg-white shadow-lg p-2 grid gap-1">
            <button className="menu-item" onClick={() => onAdd("paragraph")}>Snabbt stycke</button>
            <button className="menu-item" onClick={() => onAdd("quote")}>Citatblock</button>
            <button className="menu-item" onClick={() => onAdd("checklist")}>Att-göra</button>
          </div>
        </details>
      </div>
    </div>
  );
}