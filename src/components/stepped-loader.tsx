"use client";
import * as React from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type Step = { label: string; durationMs?: number };

/**
 * StepLoader — hoạt ảnh "nhảy bước" tạo cảm giác hệ thống đang xử lý nhanh.
 * Mỗi bước có thời lượng riêng (mặc định 350-700ms).
 * Khi bước hoàn tất nhảy sang bước tiếp theo với tick xanh.
 */
export function SteppedLoader({
  steps,
  onDone,
  className,
}: {
  steps: Step[];
  onDone?: () => void;
  className?: string;
}) {
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    if (active >= steps.length) {
      onDone?.();
      return;
    }
    const t = setTimeout(() => setActive((a) => a + 1), steps[active].durationMs ?? 500);
    return () => clearTimeout(t);
  }, [active, steps, onDone]);

  return (
    <div className={cn("space-y-2.5", className)}>
      {steps.map((s, i) => {
        const done = i < active;
        const current = i === active;
        return (
          <div
            key={i}
            className={cn(
              "flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5 transition-all duration-300",
              done && "opacity-60",
              current && "border-violet-500/50 bg-violet-50/50 shadow-sm",
            )}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div
              className={cn(
                "grid h-7 w-7 place-items-center rounded-full text-xs font-semibold transition-all duration-300",
                done && "bg-emerald-500 text-white scale-100",
                current && "brand-gradient text-white scale-110 shadow-md",
                !done && !current && "bg-muted text-muted-foreground",
              )}
            >
              {done ? <Check className="h-4 w-4" /> : current ? <Loader2 className="h-4 w-4 animate-spin" /> : i + 1}
            </div>
            <span
              className={cn(
                "text-sm flex-1 transition-colors",
                current && "text-foreground font-medium",
                !current && !done && "text-muted-foreground",
              )}
            >
              {s.label}
            </span>
            {current && (
              <div className="flex items-center gap-0.5">
                <div className="step-dot" />
                <div className="step-dot" />
                <div className="step-dot" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-3 space-y-3">
      <div className="skeleton aspect-square w-full rounded-lg" />
      <div className="skeleton h-3 w-1/3" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-3/4" />
      <div className="flex justify-between items-center pt-1">
        <div className="skeleton h-5 w-1/3" />
        <div className="skeleton h-8 w-16 rounded-md" />
      </div>
    </div>
  );
}
