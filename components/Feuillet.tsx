import { feuillet } from "@/lib/format";

const TAILLES = {
  sm: { boite: "w-11", bande: "py-px text-[10px]", chiffre: "text-[1.375rem] leading-7", annee: "" },
  md: { boite: "w-14", bande: "py-0.5 text-[11px]", chiffre: "text-[2rem] leading-9", annee: "pb-1 text-[11px]" },
  lg: { boite: "w-36", bande: "py-1 text-sm", chiffre: "text-[5.5rem] leading-[5.5rem]", annee: "pb-2 text-sm" },
};

const TONS = {
  avenir: "bg-vermillon text-vermillon-ink",
  passe: "bg-rule-2 text-ink",
  calme: "bg-prusse text-prusse-ink",
};

// Une date posée comme une page d'éphéméride : bandeau du mois, grand quantième.
export function Feuillet({ date, taille = "md", ton = "avenir", className = "" }: {
  date: string | null; taille?: keyof typeof TAILLES; ton?: keyof typeof TONS; className?: string;
}) {
  const f = feuillet(date);
  if (!f || !date) return null;
  const t = TAILLES[taille];
  const complet = `${f.jourSemaine} ${f.quantieme} ${f.moisLong} ${f.annee}`;
  return (
    <time
      dateTime={date.slice(0, 10)}
      aria-label={complet}
      title={complet}
      className={`inline-flex shrink-0 flex-col self-start overflow-hidden rounded-[5px] border border-rule-2 bg-sheet text-center shadow-[0_1px_3px_-1px_rgb(20_32_58/0.25)] ${t.boite} ${ton === "passe" ? "opacity-75" : ""} ${className}`}
    >
      <span aria-hidden="true" className={`font-chiffres font-semibold uppercase tracking-wide ${t.bande} ${TONS[ton]}`}>
        {taille === "lg" ? `${f.moisLong} ${f.annee}` : f.mois.replace(".", "")}
      </span>
      {taille === "lg" && <span aria-hidden="true" className="pt-2 text-sm font-medium capitalize text-ink-2">{f.jourSemaine}</span>}
      <span aria-hidden="true" className={`font-chiffres font-bold text-ink ${t.chiffre}`}>{f.quantieme}</span>
      {taille === "md" && <span aria-hidden="true" className={`font-chiffres font-semibold text-ink-3 ${t.annee}`}>{f.annee}</span>}
    </time>
  );
}
