"use client";
import * as React from "react";
import { Link2, Repeat, Check, ArrowRightLeft, Plus, Truck, Boxes } from "lucide-react";
import { type CatalogItem, getProductImage } from "@/data/catalog";
import { cn, formatVND } from "@/lib/utils";

type Mode = "related" | "alternative";

/**
 * Panel sổ xuống dạng list compact.
 * - mode="related"     → Thêm sản phẩm vào đơn (line mới).
 * - mode="alternative" → Thay thế mã hiện tại.
 */
export function ProductListPanel({
  mode,
  currentSku,
  items,
  onPick,
}: {
  mode: Mode;
  currentSku: string;
  items: CatalogItem[];
  onPick: (item: CatalogItem) => void;
}) {
  const cfg =
    mode === "related"
      ? {
          icon: Link2,
          border: "border-blue-400",
          bg: "bg-blue-50/40",
          text: "text-blue-900",
          title: "Thêm sản phẩm nhanh",
          hint: "Cùng nhóm – click để thêm vào đơn hàng.",
          actionLabel: "Thêm",
          ActionIcon: Plus,
          actionClass: "border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100",
        }
      : {
          icon: Repeat,
          border: "border-violet-400",
          bg: "bg-violet-50/40",
          text: "text-violet-900",
          title: "Sản phẩm thay thế",
          hint: "Khác thương hiệu – có thể rẻ hơn 15-35%.",
          actionLabel: "Thay thế",
          ActionIcon: ArrowRightLeft,
          actionClass: "border-violet-300 text-violet-700 bg-violet-50 hover:bg-violet-100",
        };
  const HeadIcon = cfg.icon;

  return (
    <div className={cn("ml-14 my-2 max-w-3xl border-l-4 rounded-r-lg shadow-sm py-2.5", cfg.border, cfg.bg)}>
      <div className="pl-3 pr-3">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <HeadIcon className={cn("h-3.5 w-3.5 shrink-0", cfg.text)} />
            <h4 className={cn("text-[11px] font-bold uppercase tracking-wider truncate", cfg.text)}>
              {cfg.title}{" "}
              <span className="text-muted-foreground font-medium normal-case ml-0.5">({items.length})</span>
            </h4>
          </div>
          <span className="text-[10px] text-muted-foreground hidden sm:inline">{cfg.hint}</span>
        </div>

        <div className="space-y-1">
          {items.map((it) => {
            const isCurrent = mode === "alternative" && it.sku === currentSku;
            const cheapest = Math.min(...it.suppliers.map((s) => s.price));
            const fastest = Math.min(...it.suppliers.map((s) => s.eta));
            const totalStock = it.suppliers.reduce((s, x) => s + x.stock, 0);
            return (
              <div
                key={it.sku}
                className={cn(
                  "flex items-center gap-3 rounded-md border bg-card px-2.5 py-1.5 transition-colors",
                  isCurrent ? "opacity-50" : "hover:border-blue-400 hover:bg-white",
                )}
              >
                <div className="relative h-9 w-9 shrink-0 rounded-md border bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
                  <img src={getProductImage(it)} alt={it.name} className="w-full h-full object-contain p-0.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground tracking-wide">
                      {it.brand}
                    </span>
                    <span className="font-medium text-sm truncate">{it.name}</span>
                    {isCurrent && (
                      <span className="text-[9px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-semibold">
                        Đang dùng
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5 font-mono">
                    <span>{it.sku}</span>
                    <span className="inline-flex items-center gap-0.5"><Boxes className="h-2.5 w-2.5" />{totalStock}</span>
                    <span className="inline-flex items-center gap-0.5"><Truck className="h-2.5 w-2.5" />{fastest}d</span>
                  </div>
                </div>
                <div className="text-right shrink-0 leading-tight">
                  <div className="font-bold text-blue-700 tabular-nums text-sm">{formatVND(cheapest)}</div>
                  <div className="text-[9px] text-muted-foreground">/ {it.unit}</div>
                </div>
                <button
                  onClick={() => !isCurrent && onPick(it)}
                  disabled={isCurrent}
                  className={cn(
                    "shrink-0 inline-flex items-center gap-1 text-xs px-2.5 h-7 rounded-md border font-semibold transition-colors",
                    isCurrent
                      ? "border-emerald-300 text-emerald-700 bg-emerald-50 cursor-default"
                      : cfg.actionClass,
                  )}
                >
                  {isCurrent ? <Check className="h-3 w-3" /> : <cfg.ActionIcon className="h-3 w-3" />}
                  {isCurrent ? "Đang dùng" : cfg.actionLabel}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
