interface PageHeaderProps { eyebrow: string; title: string; action?: React.ReactNode; }
export default function PageHeader({ eyebrow, title, action }: PageHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--accent-secondary)' }}>{eyebrow}</p>
        <h1 className="font-display text-3xl">{title}</h1>
      </div>
      {action}
    </div>
  );
}
