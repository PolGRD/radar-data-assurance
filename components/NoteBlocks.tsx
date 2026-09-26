import type { NoteBlock, RichText } from "@/lib/types";

function Rich({ parts }: { parts: RichText[] }) {
  return (
    <>
      {parts.map((p, i) => {
        let node: React.ReactNode = p.text;
        if (p.code) node = <code className="rounded bg-zinc-100 px-1 text-[0.9em] dark:bg-zinc-800">{node}</code>;
        if (p.bold) node = <strong>{node}</strong>;
        if (p.italic) node = <em>{node}</em>;
        if (p.strikethrough) node = <s>{node}</s>;
        if (p.href) node = <a href={p.href} target="_blank" rel="noopener noreferrer" className="underline">{node}</a>;
        return <span key={i}>{node}</span>;
      })}
    </>
  );
}

function Children({ blocks }: { blocks: NoteBlock[] }) {
  return blocks.length ? <div className="ml-5 mt-1"><NoteBlocks blocks={blocks} /></div> : null;
}

function Block({ block }: { block: NoteBlock }) {
  const content = <Rich parts={block.text} />;
  switch (block.type) {
    case "heading_1":
      return <h2 className="mt-4 text-xl font-semibold">{content}</h2>;
    case "heading_2":
      return <h3 className="mt-4 text-lg font-semibold">{content}</h3>;
    case "heading_3":
      return <h4 className="mt-3 font-semibold">{content}</h4>;
    case "quote":
      return <blockquote className="border-l-4 border-zinc-300 pl-3 italic dark:border-zinc-600">{content}<Children blocks={block.children} /></blockquote>;
    case "callout":
      return <div className="rounded bg-zinc-100 p-3 dark:bg-zinc-800">{content}<Children blocks={block.children} /></div>;
    case "code":
      return <pre className="overflow-x-auto rounded bg-zinc-100 p-3 text-sm dark:bg-zinc-800"><code>{block.text.map((t) => t.text).join("")}</code></pre>;
    case "divider":
      return <hr className="border-zinc-200 dark:border-zinc-700" />;
    case "to_do":
      return (
        <div>
          <label className="flex gap-2">
            <input type="checkbox" checked={block.checked} readOnly disabled className="mt-1" />
            <span className={block.checked ? "line-through opacity-70" : ""}>{content}</span>
          </label>
          <Children blocks={block.children} />
        </div>
      );
    case "bookmark":
    case "embed":
    case "link_preview":
      return block.url ? <p><a href={block.url} target="_blank" rel="noopener noreferrer" className="break-all underline">{block.url}</a></p> : null;
    case "image":
      // eslint-disable-next-line @next/next/no-img-element
      return block.url ? <img src={block.url} alt="" className="max-w-full rounded" /> : null;
    case "paragraph":
    case "toggle":
    case "child_page":
      return block.text.length || block.children.length ? <div><p>{content}</p><Children blocks={block.children} /></div> : null;
    default:
      return block.text.length ? <p>{content}</p> : null;
  }
}

// Regroupe les éléments de liste consécutifs dans un <ul> ou un <ol>.
export function NoteBlocks({ blocks }: { blocks: NoteBlock[] }) {
  const out: React.ReactNode[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const kind = blocks[i].type;
    if (kind === "bulleted_list_item" || kind === "numbered_list_item") {
      const items: NoteBlock[] = [];
      while (i < blocks.length && blocks[i].type === kind) items.push(blocks[i++]);
      i--;
      const List = kind === "bulleted_list_item" ? "ul" : "ol";
      out.push(
        <List key={items[0].id} className={`${List === "ul" ? "list-disc" : "list-decimal"} ml-5 space-y-1`}>
          {items.map((it) => <li key={it.id}><Rich parts={it.text} /><Children blocks={it.children} /></li>)}
        </List>,
      );
    } else {
      out.push(<Block key={blocks[i].id} block={blocks[i]} />);
    }
  }
  return <div className="space-y-3 leading-relaxed">{out}</div>;
}
