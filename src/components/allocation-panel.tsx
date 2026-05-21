"use client";
import * as React from "react";
import { Sparkles, Truck, Boxes, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { defaultAllocation, type RequestLine } from "@/data/sample-request";
import { cn, formatVND } from "@/lib/utils";

export { defaultAllocation };

/**
 * Bảng phân bổ tồn kho cho 1 dòng vật tư.
 * - Hiển thị mọi NCC khả dụng trong line.match.suppliers
 * - User nhập số lượng lấy từ mỗi NCC, tổng phải = line.qty
 * - Nút "Mai tự động chia" → greedy fill từ NCC rẻ nhất
 */
export function AllocationPanel({
  line,
  onChange,
}: {
  line: RequestLine;
  onChange: (allocations: Record<string, number>) => void;
}) {
  if (!line.match) return null;
  const suppliers = line.match.suppliers;
  const totalNeeded = line.qty;
  const cheapest = Math.min(...suppliers.map((s) => s.price));
  const fastest = Math.min(...suppliers.map((s) => s.eta));

  const allocations = line.allocations ?? defaultAllocation(line);
  const totalAllocated = Object.values(allocations).reduce((s, n) => s + n, 0);
  const fulfilled = totalAllocated >= totalNeeded;

  const updateOne = (name: string, value: number) => {
    const next = { ...allocations, [name]: Math.max(0, value || 0) };
    onChange(next);
  };

  /** Click card NCC: tự dồn toàn bộ qty cho NCC đó (khác về 0).
   *  Click lại NCC đang full → bỏ chọn (về 0). */
  const toggleExclusive = (name: string) => {
    const stock = suppliers.find((s) => s.name === name)?.stock ?? 0;
    const cap = Math.min(stock, totalNeeded);
    const taken = allocations[name] ?? 0;
    const othersZero = suppliers.every((s) => s.name === name || (allocations[s.name] ?? 0) === 0);
    // Đang ở trạng thái "exclusive selected" → click = bỏ chọn
    if (taken === cap && othersZero && cap > 0) {
      onChange({ ...allocations, [name]: 0 });
      return;
    }
    // Else: dồn toàn bộ qty cho NCC này, các NCC khác = 0
    const next: Record<string, number> = {};
    suppliers.forEach((s) => {
      next[s.name] = s.name === name ? cap : 0;
    });
    onChange(next);
  };

  const autoDistribute = () => {
    const next: Record<string, number> = {};
    let remaining = totalNeeded;
    const sorted = [...suppliers].sort((a, b) => a.price - b.price);
    for (const s of sorted) {
      if (remaining <= 0) {
        next[s.name] = 0;
        continue;
      }
      const take = Math.min(s.stock, remaining);
      next[s.name] = take;
      remaining -= take;
    }
    onChange(next);
  };

  return (
    <div className="ml-14 my-2 max-w-4xl border-l-4 border-amber-400 bg-amber-50/40 rounded-r-lg shadow-sm py-2.5">
      <div className="pl-3 pr-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Boxes className="h-4 w-4 text-amber-700" />
            <h4 className="text-xs font-bold uppercase tracking-wide text-amber-900">
              Phân bổ tồn kho{" "}
              <span className="text-muted-foreground font-medium normal-case ml-1">
                (Cần {totalNeeded} {line.unit})
              </span>
            </h4>
            <span className="text-[10px] text-muted-foreground italic">
              · Click card để chọn nhanh, hoặc nhập số lượng để gom nhiều NCC
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full transition-all", fulfilled ? "bg-emerald-500" : "bg-amber-500")}
                  style={{ width: `${Math.min(100, (totalAllocated / totalNeeded) * 100)}%` }}
                />
              </div>
              <span className={cn("text-xs font-semibold tabular-nums", fulfilled ? "text-emerald-700" : "text-amber-700")}>
                {totalAllocated}/{totalNeeded}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={autoDistribute}
              className="h-7 text-xs border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <Sparkles className="h-3 w-3" />
              Mai tự chia
            </Button>
          </div>
        </div>

        {/* Supplier cards (compact) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {suppliers.map((s) => {
          const isCheapest = s.price === cheapest;
          const isFastest = s.eta === fastest && !isCheapest;
          const taken = allocations[s.name] ?? 0;
          const overstock = taken > s.stock;
          const subtotal = taken * s.price;
          const cap = Math.min(s.stock, totalNeeded);
          const othersZero = suppliers.every((x) => x.name === s.name || (allocations[x.name] ?? 0) === 0);
          // "Exclusive": NCC này đang nhận đủ qty và các NCC khác đều 0
          const exclusive = taken === cap && taken > 0 && othersZero;
          return (
            <div
              key={s.name}
              role="button"
              tabIndex={0}
              onClick={() => toggleExclusive(s.name)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleExclusive(s.name);
                }
              }}
              aria-pressed={exclusive}
              title={exclusive ? "Click để bỏ chọn NCC này" : `Click để dồn ${cap} ${line.unit} cho ${s.name}`}
              className={cn(
                "relative rounded-md border bg-card p-2.5 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-200",
                exclusive
                  ? "border-blue-500 ring-2 ring-blue-300 shadow-md bg-blue-50/60"
                  : taken > 0
                    ? "border-blue-400 shadow-sm bg-blue-50/30"
                    : "border-border hover:border-blue-300 hover:bg-blue-50/20",
                overstock && "!border-red-400 !bg-red-50/40",
              )}
            >
              {exclusive && (
                <span className="absolute top-1.5 right-1.5 grid h-5 w-5 place-items-center rounded-full bg-blue-600 text-white shadow">
                  <Check className="h-3 w-3" />
                </span>
              )}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {isCheapest && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500 text-white">
                        Rẻ nhất
                      </span>
                    )}
                    {isFastest && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-600 text-white">
                        Giao nhanh
                      </span>
                    )}
                    <span className="font-semibold text-sm truncate">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                    <span className="inline-flex items-center gap-0.5"><Truck className="h-3 w-3" />{s.eta}d</span>
                    <span className="inline-flex items-center gap-0.5"><Boxes className="h-3 w-3" />Tồn {s.stock}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-blue-700 tabular-nums">{formatVND(s.price)}</div>
                </div>
              </div>

              <div
                className="mt-2 flex items-center justify-between gap-2 pt-1.5 border-t border-dashed"
                onClick={(e) => e.stopPropagation()}
              >
                <label className="text-[11px] text-muted-foreground">Lấy:</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={s.stock}
                    value={taken}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateOne(s.name, parseInt(e.target.value) || 0)}
                    className={cn(
                      "w-16 h-7 rounded border bg-background px-2 text-right text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-200",
                      taken > 0 && "border-blue-400 text-blue-700",
                      overstock && "border-red-400 text-red-700",
                    )}
                  />
                  {taken > 0 && (
                    <span className="text-[10px] text-muted-foreground tabular-nums whitespace-nowrap">
                      = {formatVND(subtotal)}
                    </span>
                  )}
                </div>
              </div>
              {overstock && (
                <div className="mt-1 text-[10px] text-red-600">⚠ Vượt tồn ({s.stock})</div>
              )}
            </div>
          );
        })}
        </div>

        {/* Status footer */}
        {!fulfilled && (
          <div className="mt-2 text-[11px] text-amber-700 inline-flex items-center gap-1">
            ⓘ Còn thiếu {totalNeeded - totalAllocated} {line.unit} chưa phân bổ.
          </div>
        )}
        {fulfilled && (
          <div className="mt-2 text-[11px] text-emerald-700 inline-flex items-center gap-1">
            <Check className="h-3 w-3" /> Đã đủ {totalNeeded} {line.unit} từ {Object.values(allocations).filter((v) => v > 0).length} NCC.
          </div>
        )}
      </div>
    </div>
  );
}

/** Tóm tắt chuỗi ngắn cho cell collapse: "Gom từ 2 NCC" / "MRO Smart V2" */
export function allocationSummary(line: RequestLine): string {
  const a = line.allocations ?? defaultAllocation(line);
  const used = Object.entries(a).filter(([, v]) => v > 0);
  if (used.length === 0) return "Chưa phân bổ";
  if (used.length === 1) return used[0][0];
  return `Gom từ ${used.length} NCC`;
}
