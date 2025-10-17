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
          onChange={(e) => onChange({ ...(block as H1Block), text: e.target.value })}
          placeholder="Rubrik…"
        />
      )}

      {block.type === "paragraph" && (
        <textarea
          className="textarea"
          value={(block as ParagraphBlock).text}
          onChange={(e) => onChange({ ...(block as ParagraphBlock), text: e.target.value })}
          placeholder="Skriv fritt…"
        />
      )}

      {block.type === "quote" && (
        <textarea
          className="textarea italic"
          value={(block as QuoteBlock).text}
          onChange={(e) => onChange({ ...(block as QuoteBlock), text: e.target.value })}
          placeholder="“Skriv ett citat…”"
        />
      )}

      {block.type === "checklist" && (
        <ChecklistEditor
          block={block as ChecklistBlock}
          onChange={onChange}
        />
      )}

      {block.type === "divider" && (
        <div className="divider my-2" />
      )}

      {block.type === "image" && (
        <ImageEditor block={block as ImageBlock} onChange={onChange} />
      )}

      {block.type === "sketch" && (
        <SketchEditor block={block as SketchBlock} onChange={onChange} />
      )}
    </div>
  );
}

function Menu({
  onAddBelow,
  onRemove,
}: {
  onAddBelow: (t: BlockType) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex gap-1">
      <button className="btn-outline" onClick={() => onAddBelow("paragraph")} title="Lägg till block under">
        + Block
      </button>
      <button className="btn-outline" onClick={onRemove} title="Ta bort">
        Ta bort
      </button>
    </div>
  );
}

/** -----------------------------
 *  ChecklistEditor
 *  ----------------------------- */
function ChecklistEditor({
  block,
  onChange,
}: {
  block: ChecklistBlock;
  onChange: (b: Block) => void;
}) {
  const toggle = (id: string) =>
    onChange({
      ...block,
      items: block.items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)),
    });

  const updateText = (id: string, text: string) =>
    onChange({
      ...block,
      items: block.items.map((i) => (i.id === id ? { ...i, text } : i)),
    });

  const add = () =>
    onChange({
      ...block,
      items: [...block.items, { id: uid(), text: "", done: false }],
    });

  const remove = (id: string) =>
    onChange({ ...block, items: block.items.filter((i) => i.id !== id) });

  return (
    <div className="grid gap-2">
      {block.items.map((i) => (
        <label key={i.id} className="flex items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={i.done}
            onChange={() => toggle(i.id)}
          />
          <input
            className="input"
            value={i.text}
            onChange={(e) => updateText(i.id, e.target.value)}
            placeholder="Att göra / att minnas…"
          />
          <button className="btn-outline" onClick={() => remove(i.id)} title="Ta bort rad">
            −
          </button>
        </label>
      ))}
      <div className="flex justify-end">
        <button className="btn-outline" onClick={add}>+ Rad</button>
      </div>
    </div>
  );
}

/** -----------------------------
 *  ImageEditor – enkel bildloader
 *  ----------------------------- */
function ImageEditor({
  block,
  onChange,
}: {
  block: ImageBlock;
  onChange: (b: Block) => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    onChange({ ...block, fileUrl: url });
  };

  return (
    <div className="grid gap-3">
      {!block.fileUrl ? (
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onPick}
            className="hidden"
          />
          <button className="btn-outline" onClick={() => fileRef.current?.click()}>
            Välj bild…
          </button>
          <span className="meta">Bilden lagras i minnet för nu (ej filsystem ännu).</span>
        </div>
      ) : (
        <div className="grid gap-2">
          <img
            src={block.fileUrl}
            alt={block.caption ?? "bild"}
            className="rounded-lg border border-stone-200 max-h-96 object-contain"
          />
          <input
            className="input"
            placeholder="Bildtext (valfri)"
            value={block.caption ?? ""}
            onChange={(e) => onChange({ ...block, caption: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}

/** -----------------------------
 *  SketchEditor – enkel frihandsritning
 *  ----------------------------- */
function SketchEditor({
  block,
  onChange,
}: {
  block: SketchBlock;
  onChange: (b: Block) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState<boolean>(false);
  const [color, setColor] = useState<string>("#1f2937"); // stone-800
  const [width, setWidth] = useState<number>(3);

  const currentStroke = useRef<Stroke | null>(null);

  const size = useMemo(() => ({ w: 800, h: 400 }), []);

  const redraw = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    // bakgrund
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
    // rutnät (lätt, papper)
    ctx.strokeStyle = "rgba(0,0,0,0.05)";
    ctx.lineWidth = 1;
    for (let x = 40; x < c.width; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, c.height); ctx.stroke();
    }
    for (let y = 40; y < c.height; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(c.width, y); ctx.stroke();
    }
    // strokes
    for (const s of block.strokes) {
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();
      s.points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    }
    // aktuell stroke
    if (currentStroke.current) {
      const s = currentStroke.current;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();
      s.points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    }
  };

  const toPoint = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setDrawing(true);
    const s: Stroke = { color, width, points: [toPoint(e)] };
    currentStroke.current = s;
    redraw();
  };

  const move = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !currentStroke.current) return;
    currentStroke.current.points.push(toPoint(e));
    redraw();
  };

  const end = () => {
    setDrawing(false);
    if (currentStroke.current) {
      onChange({ ...block, strokes: [...block.strokes, currentStroke.current] });
      currentStroke.current = null;
    }
    redraw();
  };

  // Redraw när block eller stil ändras
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => { setTimeout(redraw, 0); return null; }, [block.strokes, color, width]);

  const clear = () => onChange({ ...block, strokes: [] });

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="label">Färg</label>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        <label className="label">Pensel</label>
        <input
          type="range"
          min={1}
          max={16}
          value={width}
          onChange={(e) => setWidth(parseInt(e.target.value))}
          className="w-40 accent-[var(--accent)]"
        />
        <button className="btn-outline" onClick={clear}>Rensa</button>
        <span className="meta">Enkel frihands-skiss. (Sparas till state.)</span>
      </div>

      <div className="rounded-lg border border-stone-200 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={size.w}
          height={size.h}
          className="block w-full h-auto"
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
        />
      </div>
    </div>
  );
}