"use client";
import * as React from "react";
import { MoreVertical, Pencil, Copy, Trash2, MessageCircle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  destructive?: boolean;
};

export function RowActionsMenu({ items }: { items: Item[] }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted"
        title="Hành động"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-30 min-w-[180px] rounded-lg border bg-card shadow-lg overflow-hidden animate-fade-up">
          {items.map((it, i) => (
            <button
              key={i}
              onClick={() => {
                setOpen(false);
                it.onClick();
              }}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-accent transition-colors",
                it.destructive && "text-red-600 hover:bg-red-50",
              )}
            >
              <it.icon className="h-4 w-4 shrink-0" />
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { Pencil, Copy, Trash2, MessageCircle };
