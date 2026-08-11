interface AiPulseProps { label?: string; }
export default function AiPulse({ label = "L'assistant analyse vos besoins..." }: AiPulseProps) {
  return (
    <div className="flex items-center gap-3 py-4 px-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)]">
      <div className="flex gap-1" aria-hidden="true">
        <span className="ai-dot" /><span className="ai-dot ai-dot-delay-1" /><span className="ai-dot ai-dot-delay-2" />
      </div>
      <p className="text-sm text-[var(--ink-soft)]">{label}</p>
    </div>
  );
}
