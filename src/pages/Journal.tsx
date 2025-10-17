import { useMemo, useRef, useState } from "react";

/** -----------------------------
 *  Enkla blocktyper – lokalt state
 *  ----------------------------- */
type BlockType = "h1" | "paragraph" | "quote" | "checklist" | "divider" | "image" | "sketch";

type BaseBlock = {
  id: string;
  type: BlockType;
};

type ParagraphBlock = BaseBlock & { type: "paragraph"; text: string };
type H1Block = BaseBlock & { type: "h1"; text: string };
type QuoteBlock = BaseBlock & { type: "quote"; text: string };
type ChecklistItem = { id: string; text: string; done: boolean };
type ChecklistBlock = BaseBlock & { type: "checklist"; items: ChecklistItem[] };
type DividerBlock = BaseBlock & { type: "divider" };
type ImageBlock = BaseBlock & { type: "image"; fileUrl?: string; caption?: string };
type SketchBlock = BaseBlock & { type: "sketch"; strokes: Stroke[] };

type Stroke = { color: string; width: number; points: { x: number; y: number }[] };

type Block =
  | ParagraphBlock
  | H1Block
  | QuoteBlock
  | ChecklistBlock
  | DividerBlock
  | ImageBlock
  | SketchBlock;

/** -----------------------------
 *  Hjälpare
 *  ----------------------------- */
const uid = () => crypto.randomUUID();

function newBlock(t: BlockType): Block {
  switch (t) {
    case "h1":
      return { id: uid(), type: "h1", text: "Ny rubrik" };
    case "paragraph":
      return { id: uid(), type: "paragraph", text: "" };
    case "quote":
      return { id: uid(), type: "quote", text: "“Skriv ett citat…”" };
    case "checklist":
      return {
        id: uid(),
        type: "checklist",
        items: [{ id: uid(), text: "Första punkt", done: false }],
      };
    case "divider":
      return { id: uid(), type: "divider" };
    case "image":
      return { id: uid(), type: "image", caption: "" };
    case "sketch":
      return { id: uid(), type: "sketch", strokes: [] };
  }
}

/** =============================
 *  Journal – avancerad fri editor
 *  ============================= */
export default function Journal() {
  const [title, setTitle] = useState<string>("Ny sida");
  const [blocks, setBlocks] = useState<Block[]>([
    newBlock("paragraph") as ParagraphBlock,
  ]);

  const addBlock = (t: BlockType, afterId?: string) => {
    const b = newBlock(t);
    if (!afterId) return setBlocks((prev) => [...prev, b]);
    setBlocks((prev) => {
      const idx = prev.findIndex((x) => x.id === afterId);
      if (idx === -1) return [...prev, b];
      const next = prev.slice();
      next.splice(idx + 1, 0, b);
      return next;
    });
  };

  const removeBlock = (id: string) =>
    setBlocks((prev) => prev.filter((b) => b.id !== id));

  const moveBlock = (id: string, dir: "up" | "down") =>
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const swapWith = dir === "up" ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= prev.length) return prev;
      const arr = prev.slice();
      [arr[idx], arr[swapWith]] = [arr[swapWith], arr[idx]];
      return arr;
    });

  const exportMarkdown = () => {
    const lines: string[] = [`# ${title}`, ""];
    for (const b of blocks) {
      switch (b.type) {
        case "h1":
          lines.push(`# ${(b as H1Block).text}`, "");
          break;
        case "paragraph":
          lines.push((b as ParagraphBlock).text, "");
          break;
        case "quote":
          lines.push("> " + (b as QuoteBlock).text, "");
          break;
        case "checklist":
          lines.push(
            ...(b as ChecklistBlock).items.map(
              (i) => `- [${i.done ? "x" : " "}] ${i.text}`
            ),
            ""
          );
          break;
        case "divider":
          lines.push("---", "");
          break;
        case "image":
          lines.push(`![${(b as ImageBlock).caption ?? ""}](#)`, "");
          break;
        case "sketch":
          lines.push("![skiss](#)", "");
          break;
      }
    }
    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = `${title.replace(/\s+/g, "_").toLowerCase() || "journal"}.md`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Avancerad dagbok</h2>
          <p className="meta">Fri layout med block + enkel skiss. Allt lokalt i state just nu.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline" onClick={() => exportMarkdown()}>
            Exportera som Markdown
          </button>
          <button
            className="btn-accent"
            onClick={() => addBlock("paragraph")}
          >
            Nytt block
          </button>
        </div>
      </header>

      {/* Titel */}
      <section className="card-paper p-4 lift">
        <input
          className="w-full text-2xl font-semibold bg-transparent outline-none focus-ring p-1 rounded-md"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </section>

      {/* Editor */}
      <section className="card-paper p-2 md:p-4 lift">
        <Toolbar onAdd={(t) => addBlock(t)} />
        <div className="divider my-4" />

        <div className="space-y-4">
          {blocks.map((b) => (
            <BlockView
              key={b.id}
              block={b}
              onChange={(updated) =>
                setBlocks((prev) => prev.map((x) => (x.id === b.id ? updated : x)))
              }
              onAddBelow={(t) => addBlock(t, b.id)}
              onRemove={() => removeBlock(b.id)}
              onMoveUp={() => moveBlock(b.id, "up")}
              onMoveDown={() => moveBlock(b.id, "down")}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

/** -----------------------------
 *  Toolbar – lägg till block
 *  ----------------------------- */
function Toolbar({ onAdd }: { onAdd: (t: BlockType) => void }) {
  const Btn = (p: { label: string; onClick: () => void }) => (
    <button className="btn-outline" onClick={p.onClick}>
      {p.label}
    </button>
  );
  return (
    <div className="flex flex-wrap gap-2">
      <Btn label="Rubrik" onClick={() => onAdd("h1")} />
      <Btn label="Stycke" onClick={() => onAdd("paragraph")} />
      <Btn label="Citat" onClick={() => onAdd("quote")} />
      <Btn label="Checklista" onClick={() => onAdd("checklist")} />
      <Btn label="Avdelare" onClick={() => onAdd("divider")} />
      <Btn label="Bild" onClick={() => onAdd("image")} />
      <Btn label="Skiss" onClick={() => onAdd("sketch")} />
    </div>
  );
}

/** -----------------------------
 *  BlockView – rendera/reda varje block
 *  ----------------------------- */
function BlockView({
  block,
  onChange,
  onAddBelow,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  block: Block;
  onChange: (b: Block) => void;
  onAddBelow: (t: BlockType) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-3 md:p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="badge">{block.type}</span>
        <div className="ml-auto flex gap-1">
          <button className="btn-outline" onClick={onMoveUp} title="Flytta upp">↑</button>
          <button className="btn-outline" onClick={onMoveDown} title="Flytta ned">↓</button>
          <Menu onAddBelow={onAddBelow} onRemove={onRemove} />
        </div>
      </div>

      {/* Innehåll */}
      {block.type === "h1" && (
        <input
          className="w-full text-xl font-semibold bg-transparent outline-none focus-ring p-1 rounded-md"
          value={(block as H1Block).text}
          onChange={(e) =>