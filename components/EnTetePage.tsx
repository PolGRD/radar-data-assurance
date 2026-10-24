export function EnTetePage({ titre, children }: { titre: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h1 className="text-[1.75rem] font-bold leading-tight tracking-[-0.02em] text-balance">{titre}</h1>
      {children && <p className="mt-2 max-w-[70ch] text-ink-2">{children}</p>}
    </div>
  );
}
