import { notionConfigured } from "@/lib/notion";

export function NotConfigured() {
  if (notionConfigured()) return null;
  return (
    <p role="alert" className="mb-6 rounded-lg border border-alerte/40 bg-alerte-soft p-3 text-sm text-alerte">
      La variable NOTION_TOKEN n&apos;est pas définie : aucune donnée Notion ne peut être lue.
    </p>
  );
}
