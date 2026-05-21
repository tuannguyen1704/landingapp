"use client";
import * as React from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Loader2,
  RefreshCcw,
  Repeat,
  Truck,
  X,
  Boxes,
  Sparkles,
} from "lucide-react";
import { getProductImage, getAlternativeProducts, type CatalogItem } from "@/data/catalog";
import { cn, formatVND } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { lineSubtotal, type RequestLine } from "@/data/sample-request";
import { toast } from "sonner";

/** Trả về NCC đang được chọn (selectedSupplier) hoặc NCC rẻ nhất */
function bestSupplier(l: RequestLine) {
  if (!l.match) return undefined;
  if (l.selectedSupplier) {
    const s = l.match.suppliers.find((x) => x.name === l.selectedSupplier);
    if (s) return s;
  }
  return [...l.match.suppliers].sort((a, b) => a.price - b.price)[0];
}

export interface QuoteMobileCardProps {
  line: RequestLine;
  stt: number;
  /** Whether the scan animation is still running */
  revealed: boolean;
  isOOS: boolean;
  isRescanning: boolean;
  isAllocOpen: boolean;
  isReplaceOpen: boolean;
  pendingItem: CatalogItem | undefined;
  stockStatus: "enough" | "partial" | "missing";
  totalStock: number;
  updateLine: (id: string, patch: Partial<RequestLine>) => void;
  onToggleAlloc: () => void;
  onToggleReplace: () => void;
  onPreview: (item: CatalogItem) => void;
  onPreSelectReplace: (item: CatalogItem) => void;
  onCancelPreSelect: () => void;
  onSelectOption: (supplierName: string) => void;
}

// ── Leadtime / status cell (mobile variant) ────────────────────────────────
function LeadtimeCell({
  line,
  isOOS,
  isRescanning,
  revealed,
  pendingItem,
  isAllocOpen,
  onToggleAlloc,
}: {
  line: RequestLine;
  isOOS: boolean;
  isRescanning: boolean;
  revealed: boolean;
  pendingItem: CatalogItem | undefined;
  isAllocOpen: boolean;
  onToggleAlloc: () => void;
}) {
  if (isRescanning) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-violet-50 border border-violet-200 animate-pulse">
        <Loader2 className="h-3.5 w-3.5 text-violet-600 animate-spin shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-violet-700">Đang ép giá lại...</div>
          <div className="text-[10px] text-violet-600">Quét 36 NCC cho mã mới</div>
        </div>
      </div>
    );
  }
  if (isOOS && pendingItem) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 border border-emerald-200">
        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-emerald-700">Sẵn sàng báo giá lại</div>
          <div className="text-[10px] text-emerald-600">Chờ batch ở thanh dưới</div>
        </div>
      </div>
    );
  }
  if (isOOS) {
    return (
      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 border border-amber-200">
        <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0" />
        <span className="text-xs font-semibold text-amber-800">Tạm hết</span>
      </div>
    );
  }
  if (!revealed) {
    return <div className="skeleton h-7 w-full rounded-md" />;
  }
  const sup = bestSupplier(line);
  const etaTextCls =
    sup?.eta === 1 ? "text-emerald-700" : sup?.eta === 2 ? "text-blue-700" : "text-amber-700";
  return (
    <button
      onClick={onToggleAlloc}
      className={cn(
        "w-full text-left px-2 py-1 rounded-md border transition-colors flex items-center justify-between gap-2",
        isAllocOpen
          ? "bg-violet-50/60 border-violet-300"
          : "bg-white border-border hover:bg-violet-50/40",
      )}
      title="Xem các option NCC khác"
    >
      <div className="flex items-center gap-1">
        <Truck className="h-3 w-3 text-muted-foreground shrink-0" />
        <span className={cn("font-bold text-xs tabular-nums", etaTextCls)}>{sup?.eta ?? "—"}</span>
        <span className="text-[10px] text-muted-foreground">ngày</span>
      </div>
      <ChevronDown
        className={cn(
          "h-3.5 w-3.5 text-muted-foreground/60 shrink-0 transition-transform",
          isAllocOpen && "rotate-180 text-violet-600",
        )}
      />
    </button>
  );
}

// ── ReplacePanel mobile (compact) ──────────────────────────────────────────
function ReplacePanelMobile({
  currentSku,
  currentPick,
  options,
  onPick,
  onClose,
}: {
  currentSku: string;
  currentPick: CatalogItem | null;
  options: CatalogItem[];
  onPick: (item: CatalogItem) => void;
  onClose: () => void;
}) {
  return (
    <div className="mt-1.5 border-l-4 border-rose-400 bg-rose-50/40 rounded-r-lg shadow-sm py-2 px-2 animate-fade-up">
      <div className="flex items-center justify-between mb-1.5 gap-2">
        <div className="flex items-center gap-1">
          <Repeat className="h-3 w-3 text-rose-700" />
          <span className="text-[11px] font-bold uppercase tracking-wide text-rose-900">
            Chọn mã thay thế
          </span>
          <span className="text-[10px] text-muted-foreground">({options.length} mã)</span>
        </div>
        <button onClick={onClose} className="text-[11px] text-muted-foreground hover:text-foreground">
          Đóng
        </button>
      </div>
      {options.length === 0 ? (
        <div className="text-xs text-muted-foreground text-center py-3">
          Không có mã thay thế tương đương.
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-rose-200/60 rounded-md border border-rose-200/60 bg-card overflow-hidden">
          {options.map((opt) => {
            const picked = currentPick?.sku === opt.sku;
            const totalStock = opt.suppliers.reduce((s, x) => s + x.stock, 0);
            return (
              <button
                key={opt.sku}
                onClick={() => onPick(opt)}
                className={cn(
                  "group text-left flex items-center gap-2 p-2 transition-colors",
                  picked ? "bg-violet-50" : "hover:bg-rose-50/50",
                )}
              >
                <div className="relative w-9 h-9 shrink-0 rounded border bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
                  <img src={getProductImage(opt)} alt={opt.name} className="w-full h-full object-contain p-0.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[9px] font-bold uppercase px-1 rounded bg-muted text-muted-foreground tracking-wider">
                      {opt.brand}
                    </span>
                    <span className="font-semibold text-xs leading-snug truncate">{opt.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground flex-wrap">
                    <span className="font-mono">SKU: {opt.sku}</span>
                    <span className="inline-flex items-center gap-0.5">
                      <Truck className="h-2.5 w-2.5" />
                      {opt.leadTimeDays}d
                    </span>
                    <span className="inline-flex items-center gap-0.5">
                      <Boxes className="h-2.5 w-2.5" />
                      {totalStock}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-bold text-xs brand-gradient-text tabular-nums">{formatVND(opt.unitPrice)}</div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 px-1.5 h-6 rounded text-[10px] font-bold border mt-0.5",
                      picked
                        ? "bg-violet-600 border-violet-600 text-white"
                        : "border-rose-300 text-rose-700 bg-rose-50 group-hover:bg-rose-600 group-hover:border-rose-600 group-hover:text-white",
                    )}
                  >
                    {picked ? <><Check className="h-2.5 w-2.5" /> Đã chọn</> : <><RefreshCcw className="h-2.5 w-2.5" /> Chọn</>}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── OptionThread mobile (NCC options) ─────────────────────────────────────
function OptionThreadMobile({
  line,
  onSelect,
  onClose,
}: {
  line: RequestLine;
  onSelect: (supplierName: string) => void;
  onClose: () => void;
}) {
  if (!line.match) return null;
  const sortedSuppliers = [...line.match.suppliers].sort((a, b) => a.price - b.price);
  const currentName = bestSupplier(line)?.name;

  return (
    <div className="mt-1.5 rounded-lg border border-violet-200 bg-white shadow-sm overflow-hidden animate-fade-up">
      <div className="flex items-center gap-1 px-2 py-1 bg-white/60 border-b border-violet-100">
        <Sparkles className="h-3 w-3 text-violet-600 shrink-0" />
        <span className="text-[10px] font-semibold text-violet-900">
          {sortedSuppliers.length} option khả dụng
        </span>
        <span className="text-[10px] text-muted-foreground ml-0.5">— chọn 1 để báo giá theo</span>
        <button
          onClick={onClose}
          aria-label="Đóng"
          className="ml-auto grid h-5 w-5 place-items-center rounded text-muted-foreground hover:bg-muted shrink-0"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      <ul className="divide-y divide-violet-100/80">
        {sortedSuppliers.map((s, idx) => {
          const isBest = idx === 0;
          const isCurrent = s.name === currentName;
          const enough = s.stock >= line.qty;
          return (
            <li
              key={s.name}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(s.name)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(s.name);
                }
              }}
              className={cn(
                "flex items-center gap-1.5 px-2 py-2 cursor-pointer transition-colors",
                isCurrent ? "bg-violet-50" : "hover:bg-violet-50/60",
              )}
            >
              {/* Option label */}
              <div className="flex-1 min-w-0">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1 py-0.5 rounded",
                    isBest ? "text-emerald-700 bg-emerald-100" : "text-violet-700 bg-violet-100",
                  )}
                >
                  {isBest && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                  {isBest ? "Option tốt nhất" : `Option ${idx + 1}`}
                </span>
                {isCurrent && !isBest && (
                  <div className="text-[9px] text-violet-600 font-semibold">Đang chọn</div>
                )}
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  {/* Stock */}
                  <span className="inline-flex items-center gap-0.5 text-xs">
                    <Boxes className="h-3 w-3 text-muted-foreground" />
                    {enough ? (
                      <span className="font-bold tabular-nums text-emerald-700">{s.stock}</span>
                    ) : (
                      <span className="font-bold tabular-nums text-amber-700">
                        {s.stock}<span className="text-muted-foreground/50">/{line.qty}</span>
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground">{line.unit}</span>
                  </span>
                  {/* Lead time */}
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 px-1 h-4 rounded border font-bold text-[10px] tabular-nums",
                      s.eta === 1
                        ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                        : s.eta === 2
                          ? "text-blue-700 bg-blue-50 border-blue-200"
                          : "text-amber-700 bg-amber-50 border-amber-200",
                    )}
                  >
                    <Truck className="h-2.5 w-2.5" />
                    {s.eta}d
                  </span>
                </div>
              </div>
              {/* Price */}
              <div className="text-right shrink-0">
                <div className={cn("font-bold tabular-nums text-xs", isBest ? "brand-gradient-text" : "text-foreground")}>
                  {formatVND(s.price)}
                </div>
                <div className="text-[10px] text-muted-foreground">/ {line.unit}</div>
              </div>
              {/* Select button */}
              <div className="shrink-0 ml-0.5">
                {isCurrent ? (
                  <span className="inline-flex items-center justify-center gap-0.5 px-1.5 h-6 rounded bg-violet-600 text-white text-[10px] font-bold min-w-[52px]">
                    <Check className="h-2.5 w-2.5" />
                    Đã chọn
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center gap-0.5 px-1.5 h-6 rounded border border-violet-300 text-violet-700 bg-white text-[10px] font-semibold hover:bg-violet-50 min-w-[52px]">
                    Chọn
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ── Main card ──────────────────────────────────────────────────────────────
export function QuoteMobileCard({
  line: l,
  stt,
  revealed,
  isOOS,
  isRescanning,
  isAllocOpen,
  isReplaceOpen,
  pendingItem,
  stockStatus,
  totalStock,
  updateLine,
  onToggleAlloc,
  onToggleReplace,
  onPreview,
  onPreSelectReplace,
  onCancelPreSelect,
  onSelectOption,
}: QuoteMobileCardProps) {
  if (!l.match) return null;

  const subtotal = lineSubtotal(l);
  const altOptions = getAlternativeProducts(l.match.sku).slice(0, 6);

  return (
    <div
      className={cn(
        "rounded-lg border bg-card shadow-sm overflow-hidden transition-all",
        "border-l-4",
        isOOS && !isRescanning ? "border-l-amber-400" : "border-l-emerald-500",
      )}
    >
      {/* Header: checkbox + STT + raw text + stock badge */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5">
        <input
          type="checkbox"
          checked={!!l.selected}
          onChange={(e) => updateLine(l.id, { selected: e.target.checked })}
          className="h-4 w-4 shrink-0 accent-violet-600"
          disabled={isRescanning}
        />
        <span className="text-[10px] font-mono text-muted-foreground w-4 text-center shrink-0">{stt}</span>
        <span className="font-medium text-xs leading-snug min-w-0 flex-1 line-clamp-2">{l.raw}</span>
        {/* Stock status badge */}
        <span
          className={cn(
            "shrink-0 grid h-5 w-5 place-items-center rounded-full shadow-sm ring-2 ring-white",
            stockStatus === "enough" && "bg-emerald-500 text-white",
            stockStatus === "partial" && "bg-amber-500 text-white",
            stockStatus === "missing" && "bg-amber-500 text-white",
          )}
          title={
            stockStatus === "enough"
              ? `Đủ hàng (${totalStock}/${l.qty})`
              : stockStatus === "partial"
                ? `Chỉ còn ${totalStock}/${l.qty}`
                : "NCC chưa báo giá"
          }
        >
          {stockStatus === "enough" ? (
            <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
          ) : stockStatus === "partial" ? (
            <AlertTriangle className="h-2.5 w-2.5" strokeWidth={3} />
          ) : (
            <X className="h-2.5 w-2.5" strokeWidth={3.5} />
          )}
        </span>
      </div>

      {/* Product section */}
      <div className="px-2.5 py-1.5 border-t border-border/50">
        <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
          Sản phẩm đã khớp
        </div>
        <div className="flex items-center gap-2">
          {/* Product image — 44px */}
          <button
            onClick={() => onPreview(l.match!)}
            className={cn(
              "relative h-11 w-11 shrink-0 rounded border bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden hover:ring-2 hover:ring-violet-300 transition-all",
              isRescanning && "ring-2 ring-violet-400 animate-pulse",
            )}
            title="Xem ảnh sản phẩm"
          >
            <img src={getProductImage(l.match)} alt={l.match.name} className="w-full h-full object-contain p-0.5" />
            {isRescanning && (
              <div className="absolute inset-0 grid place-items-center bg-violet-600/30">
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              </div>
            )}
          </button>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-xs leading-snug">{l.match.name}</div>
            <div className="text-[10px] font-mono text-muted-foreground">SKU: {l.match.sku}</div>
            {/* Pending pick pill */}
            {isOOS && !isRescanning && pendingItem && (
              <div className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 rounded px-1.5 py-0.5">
                <Check className="h-2.5 w-2.5 text-emerald-700 shrink-0" />
                <span className="truncate max-w-[120px]">Đã chọn: {pendingItem.name}</span>
                <button
                  onClick={onToggleReplace}
                  className="text-emerald-700 hover:underline text-[10px]"
                  title="Đổi mã khác"
                >
                  Đổi
                </button>
                <button
                  onClick={onCancelPreSelect}
                  className="text-slate-600 hover:underline text-[10px]"
                  title="Huỷ chọn"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
          {/* Replace chevron for OOS without pending */}
          {isOOS && !isRescanning && !pendingItem && (
            <button
              onClick={onToggleReplace}
              className="grid h-7 w-7 place-items-center rounded text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-300 self-center shrink-0 transition-colors"
              title="Chọn mã thay thế"
              aria-expanded={isReplaceOpen}
            >
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isReplaceOpen && "rotate-180")} />
            </button>
          )}
        </div>

        {/* Replace panel (OOS) */}
        {isOOS && isReplaceOpen && !isRescanning && (
          <ReplacePanelMobile
            currentSku={l.match.sku}
            currentPick={pendingItem ?? null}
            options={altOptions}
            onPick={onPreSelectReplace}
            onClose={onToggleReplace}
          />
        )}
      </div>

      {/* Ngày xuất kho */}
      <div className="px-2.5 py-1.5 border-t border-border/50">
        <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
          Ngày xuất kho
        </div>
        <LeadtimeCell
          line={l}
          isOOS={isOOS}
          isRescanning={isRescanning}
          revealed={revealed}
          pendingItem={pendingItem}
          isAllocOpen={isAllocOpen}
          onToggleAlloc={onToggleAlloc}
        />
        {/* Option thread (NCC) */}
        {isAllocOpen && !isOOS && !isRescanning && (
          <OptionThreadMobile
            line={l}
            onSelect={onSelectOption}
            onClose={onToggleAlloc}
          />
        )}
      </div>

      {/* Key/value dense row: Đơn vị + VAT inline, Số lượng stepper, Đơn giá + Thành tiền */}
      <div className="px-2.5 py-1.5 border-t border-border/50 space-y-1">
        {/* Row 1: Đơn vị chip + VAT chip + Số lượng stepper */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Đơn vị chip */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground">Đơn vị:</span>
            <span className="text-xs font-semibold">{l.unit}</span>
          </div>
          {/* VAT chip */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground">VAT:</span>
            {isOOS && !pendingItem ? (
              <span className="text-[10px] text-muted-foreground">—</span>
            ) : (
              <span className="inline-flex items-center px-1 rounded bg-muted text-[10px] font-semibold tabular-nums">
                {l.match.vatPct}%
              </span>
            )}
          </div>
          {/* Số lượng stepper */}
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-[10px] text-muted-foreground">SL:</span>
            <div className="inline-flex items-center rounded border bg-white overflow-hidden h-7">
              <button
                type="button"
                onClick={() => updateLine(l.id, { qty: Math.max(1, l.qty - 1) })}
                disabled={isRescanning}
                aria-label="Giảm"
                className="grid h-7 w-7 place-items-center text-muted-foreground hover:bg-muted disabled:opacity-40 text-sm"
              >
                −
              </button>
              <input
                value={l.qty}
                onChange={(e) => updateLine(l.id, { qty: Math.max(1, parseInt(e.target.value) || 1) })}
                disabled={isRescanning}
                className={cn(
                  "w-8 text-center bg-transparent font-bold text-xs h-7 focus:outline-none tabular-nums",
                  stockStatus === "enough" && "text-emerald-700",
                  (stockStatus === "partial" || stockStatus === "missing") && "text-amber-700",
                )}
              />
              <button
                type="button"
                onClick={() => updateLine(l.id, { qty: l.qty + 1 })}
                disabled={isRescanning}
                aria-label="Tăng"
                className="grid h-7 w-7 place-items-center text-muted-foreground hover:bg-muted disabled:opacity-40 text-sm"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Đơn giá + Thành tiền on one line */}
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[10px] text-muted-foreground">Đơn giá:</span>
            <span className="text-xs font-semibold tabular-nums">
              {isRescanning ? (
                <span className="skeleton h-3 w-16 inline-block" />
              ) : isOOS ? (
                <span className="text-rose-700">—</span>
              ) : revealed ? (
                formatVND(bestSupplier(l)?.price ?? l.match.unitPrice)
              ) : (
                <span className="skeleton h-3 w-16 inline-block" />
              )}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[10px] text-muted-foreground">Thành tiền:</span>
            <span className="text-sm font-bold tabular-nums">
              {isRescanning ? (
                <span className="skeleton h-4 w-20 inline-block" />
              ) : isOOS ? (
                <span className="text-rose-700">—</span>
              ) : revealed ? (
                <span className="brand-gradient-text">
                  {formatVND(Math.round(subtotal * (1 + l.match.vatPct / 100)))}
                </span>
              ) : (
                <span className="skeleton h-4 w-20 inline-block" />
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
