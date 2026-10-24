// Icônes dessinées au même trait (1,75 px, extrémités arrondies), décoratives : le texte voisin porte le sens.
type Props = { className?: string };

function Svg({ className = "h-4 w-4", children }: Props & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      {children}
    </svg>
  );
}

export function IconeExterne(p: Props) {
  return <Svg {...p}><path d="M14 4h6v6" /><path d="M20 4 11 13" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></Svg>;
}

export function IconeChevron(p: Props) {
  return <Svg {...p}><path d="m9 6 6 6-6 6" /></Svg>;
}

export function IconeRetour(p: Props) {
  return <Svg {...p}><path d="M19 12H5" /><path d="m11 6-6 6 6 6" /></Svg>;
}

export function IconeSuite(p: Props) {
  return <Svg {...p}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></Svg>;
}

export function IconeRafraichir(p: Props) {
  return <Svg {...p}><path d="M20 11a8 8 0 1 0-2.3 5.7" /><path d="M20 4v7h-7" /></Svg>;
}

export function IconeEtoile({ className = "h-4 w-4", plein = true }: Props & { plein?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={plein ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />
    </svg>
  );
}
