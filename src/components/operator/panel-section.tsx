import type { LucideIcon } from "lucide-react";

interface PanelSectionProps {
  title: string;
  icon: LucideIcon;
  count?: number;
  children: React.ReactNode;
}

export function PanelSection({ title, icon: Icon, count, children }: PanelSectionProps) {
  return (
    <section className="border-b border-border px-4 py-3 last:border-b-0">
      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted">
        <Icon className="size-3.5" aria-hidden />
        {title}
        {count !== undefined && count > 0 && (
          <span className="ml-auto font-mono">{count}</span>
        )}
      </h3>
      {children}
    </section>
  );
}

export function EmptyHint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-muted">{children}</p>;
}
