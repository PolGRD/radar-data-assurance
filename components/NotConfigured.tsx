import { notionConfigured } from "@/lib/notion";

export function NotConfigured() {
  if (notionConfigured()) return null;
  return (
    <p role="alert" className="mb-6 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
      La variable NOTION_TOKEN n&apos;est pas définie : aucune donnée Notion ne peut être lue.
    </p>
  );
}
