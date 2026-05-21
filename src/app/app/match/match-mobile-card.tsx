"use client";
import * as React from "react";
import {
  CheckCircle2,
  Pencil,
  Trash2,
  Zap,
  X,
  Loader2,
  Plus,
  Search,
  HelpCircle,
  AlertCircle,
  ChevronDown,
  Link2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RowActionsMenu } from "@/components/row-actions-menu";
import { getProductImage, getRelatedProducts, type CatalogItem } from "@/data/catalog";
import { cn, formatVND } from "@/lib/utils";
import { useRequest } from "@/components/request-provider";
import { toast } from "sonner";

type Line = ReturnType<typeof useRequest>["lines"][number];

/** Props passed from match/page.tsx — mirrors exactly the per-row data needed. */
export interface MatchMobileCardProps {
  line: Line;
  stt: number;
  isEditing: boolean;
  editingText: string;
  isRematching: boolean;
  activeChatLineId: string | null;
  isRelatedOpen: boolean;
  onEditStart: () => void;
  onEditChange: (v: string) => void;
  onEditCommit: () => void;
  onEditCancel: () => void;
  onChoose: () => void;
  onAskMaiUnclear: () => void;
  onFillSpecsMissing: () => void;
  onPreview: (item: CatalogItem) => void;
  onChat: () => void;
  onRemove: () => void;
  onToggleRelated: () => void;
  updateLine: (id: string, patch: Partial<Line>) => void;
  addCatalogLine: (item: CatalogItem, qty: number, afterId?: string) => void;
}

// ── Sub: inline edit widget ────────────────────────────────────────────────
function InlineEdit({
  value,
  onChange,
  onCommit,
  onCancel,
}: {
  value: string;
  onChange: (v: string) => void;
  onCommit: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex items-center gap-1 mt-0.5">
      <Input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onCommit();
          if (e.key === "Escape") onCancel();
        }}
        className="h-7 flex-1 text-xs"
        placeholder="Nhập mô tả vật tư rồi Enter để Mai match lại..."
      />
      <button
        onClick={onCommit}
        title="Lưu & match lại"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-emerald-600 hover:bg-emerald-50"
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={onCancel}
        title="Huỷ (Esc)"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ── Sub: matched product section ───────────────────────────────────────────
function MatchedProduct({
  line,
  onPreview,
  isRelatedOpen,
  onToggleRelated,
}: {
  line: Line;
  onPreview: (item: CatalogItem) => void;
  isRelatedOpen: boolean;
  onToggleRelated: () => void;
}) {
  const relatedItems = line.match ? getRelatedProducts(line.match.sku) : [];
  if (line.status === "matched" && line.match) {
    return (
      <div className="flex items-center gap-2 min-h-[40px]">
        {/* Product image — 44px */}
        <button
          onClick={() => onPreview(line.match!)}
          className="relative w-11 h-11 shrink-0 rounded border bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden hover:ring-2 hover:ring-violet-300 transition-all"
          title="Xem ảnh sản phẩm"
        >
          <img
            src={getProductImage(line.match)}
            alt={line.match.name}
            className="w-full h-full object-contain p-0.5"
          />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 leading-snug flex-wrap">
            <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
            <span className="font-semibold text-emerald-700 text-xs leading-snug">{line.match.name}</span>
          </div>
          <div className="text-[10px] font-mono text-muted-foreground">SKU: {line.match.sku}</div>
        </div>
        {relatedItems.length > 0 && (
          <button
            onClick={onToggleRelated}
            title={isRelatedOpen ? "Ẩn mã liên quan" : `Xem ${relatedItems.length} mã liên quan`}
            aria-expanded={isRelatedOpen}
            className={cn(
              "grid h-7 w-7 shrink-0 place-items-center rounded border transition-colors self-center",
              isRelatedOpen
                ? "bg-blue-600 border-blue-500 text-white"
                : "border-blue-200 text-blue-700 bg-blue-50/60 hover:bg-blue-100",
            )}
          >
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isRelatedOpen && "rotate-180")} />
          </button>
        )}
      </div>
    );
  }
  if (line.status === "choose") {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-amber-700 font-medium text-xs">
          Cần chọn 1 trong {line.suggestions?.length ?? 0} sản phẩm đề xuất
        </span>
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2 text-[11px] border-amber-300 text-amber-700 hover:bg-amber-50"
          onClick={() => {}}
        >
          <Search className="h-3 w-3" />
          Chọn mã
        </Button>
      </div>
    );
  }
  if (line.status === "unclear") {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <div className="text-amber-700 font-medium text-xs flex items-center gap-1">
          <HelpCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{line.reason ?? "Không rõ tên vật tư. Vui lòng chat để xác nhận."}</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2 text-[11px] border-amber-300 text-amber-700 hover:bg-amber-50"
          onClick={() => {}}
        >
          <Zap className="h-3 w-3" />
          Hỏi Mai ngay
        </Button>
      </div>
    );
  }
  // missing
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="text-amber-700 font-medium text-xs flex items-center gap-1">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
        <span>{line.reason ?? "Thiếu thông số kỹ thuật."}</span>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="h-7 px-2 text-[11px] border-amber-300 text-amber-700 hover:bg-amber-50"
        onClick={() => {}}
      >
        <Plus className="h-3 w-3" />
        Bổ sung thông số
      </Button>
    </div>
  );
}

// ── Sub: related thread (mobile-friendly) ─────────────────────────────────
function RelatedThreadMobile({
  parentName,
  items,
  onPick,
  onPreview,
  onClose,
}: {
  parentName: string;
  items: CatalogItem[];
  onPick: (item: CatalogItem) => void;
  onPreview: (item: CatalogItem) => void;
  onClose: () => void;
}) {
  return (
    <div className="mt-1.5 rounded-lg border border-violet-200 bg-violet-50/40 shadow-sm overflow-hidden animate-fade-up">
      <div className="flex items-center gap-1.5 px-2 py-1 bg-white/60 border-b border-violet-100">
        <Link2 className="h-3 w-3 text-violet-600 shrink-0" />
        <div className="min-w-0 flex-1 text-[10px] truncate">
          <span className="text-muted-foreground">Cùng nhóm với </span>
          <span className="font-semibold text-violet-900">{parentName}</span>
        </div>
        <span className="text-[9px] text-muted-foreground shrink-0 px-1 py-0.5 rounded-full bg-violet-100/70 font-semibold">
          {items.length} mã
        </span>
        <button
          onClick={onClose}
          aria-label="Đóng"
          className="grid h-5 w-5 place-items-center rounded text-muted-foreground hover:bg-muted shrink-0"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      <ul className="divide-y divide-violet-100/80">
        {items.map((item) => (
          <li key={item.sku} className="flex items-center gap-2 px-2 py-1.5">
            <button
              onClick={() => onPreview(item)}
              className="relative h-8 w-8 shrink-0 rounded border bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden hover:ring-1 hover:ring-violet-300"
              title={`Xem ${item.name}`}
            >
              <img src={getProductImage(item)} alt={item.name} className="w-full h-full object-contain p-0.5" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[9px] font-bold uppercase px-1 rounded bg-muted text-muted-foreground tracking-wider">
                  {item.brand}
                </span>
                <span className="font-medium text-xs truncate">{item.name}</span>
              </div>
              <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
                <span className="font-mono">SKU: {item.sku}</span>
                <span className="font-semibold brand-gradient-text tabular-nums">{formatVND(item.unitPrice)}</span>
                <span className="inline-flex items-center px-1 rounded bg-muted text-[9px] font-semibold">VAT {item.vatPct}%</span>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => onPick(item)}
              className="brand-gradient text-white border-0 hover:opacity-90 h-7 px-2 text-[10px] shrink-0 min-w-[44px]"
            >
              <Plus className="h-3 w-3" strokeWidth={2.5} />
              Thêm
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Main card ──────────────────────────────────────────────────────────────
export function MatchMobileCard({
  line: l,
  stt,
  isEditing,
  editingText,
  isRematching,
  activeChatLineId,
  isRelatedOpen,
  onEditStart,
  onEditChange,
  onEditCommit,
  onEditCancel,
  onChoose,
  onAskMaiUnclear,
  onFillSpecsMissing,
  onPreview,
  onChat,
  onRemove,
  onToggleRelated,
  updateLine,
  addCatalogLine,
}: MatchMobileCardProps) {
  const relatedItems = l.match ? getRelatedProducts(l.match.sku) : [];
  const isMatched = l.status === "matched";
  const isChatActive = activeChatLineId === l.id;
  const isChatDimmed = activeChatLineId !== null && activeChatLineId !== l.id;

  return (
    <div
      className={cn(
        "rounded-lg border bg-card shadow-sm overflow-hidden transition-all",
        // Colored left border matching table row status
        "border-l-4",
        isMatched ? "border-l-emerald-500" : "border-l-amber-400",
        // Chat highlight/dim
        isChatActive && "ring-2 ring-violet-400 ring-offset-1",
        isChatDimmed && "opacity-50",
      )}
    >
      {/* Card header: checkbox + STT + raw text + actions */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5">
        <input
          type="checkbox"
          className="h-4 w-4 shrink-0 accent-violet-600"
          checked={!!l.selected}
          onChange={(e) => updateLine(l.id, { selected: e.target.checked })}
        />
        <span className="text-[10px] font-mono text-muted-foreground shrink-0 w-4 text-center">{stt}</span>
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <InlineEdit
              value={editingText}
              onChange={onEditChange}
              onCommit={onEditCommit}
              onCancel={onEditCancel}
            />
          ) : (
            <button
              onClick={onEditStart}
              title="Nhấn để sửa, Enter để Mai match lại"
              className="group w-full text-left rounded hover:bg-violet-50/60 transition-colors"
            >
              <span className="font-medium text-xs leading-snug line-clamp-2">{l.raw}</span>
              <Pencil className="inline h-3 w-3 ml-1 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>
        {/* Thao tác: ⚡ chat + kebab menu */}
        <div className="flex items-center gap-0 shrink-0">
          <button
            onClick={onChat}
            className="grid h-7 w-7 place-items-center rounded-md text-violet-600 hover:bg-violet-100"
            title="Hỏi Mai về dòng này"
          >
            <Zap className="h-4 w-4" />
          </button>
          <RowActionsMenu
            items={[
              { icon: Pencil, label: "Sửa mô tả", onClick: onEditStart },
              { icon: Trash2, label: "Xoá dòng", destructive: true, onClick: onRemove },
            ]}
          />
        </div>
      </div>

      {/* Sản phẩm khớp section */}
      <div className="px-2.5 py-1.5 border-t border-border/50">
        <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
          Sản phẩm khớp
        </div>
        {isRematching ? (
          <div className="flex items-center gap-1.5 py-0.5 animate-fade-up">
            <Loader2 className="h-3.5 w-3.5 text-violet-600 animate-spin shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-violet-700">Mai đang match lại...</div>
              <div className="skeleton h-3 w-3/4 mt-0.5" />
            </div>
          </div>
        ) : (
          <div
            onClick={() => {
              if (l.status === "choose") onChoose();
              if (l.status === "unclear") onAskMaiUnclear();
              if (l.status === "missing") onFillSpecsMissing();
            }}
          >
            <MatchedProduct
              line={l}
              onPreview={onPreview}
              isRelatedOpen={isRelatedOpen}
              onToggleRelated={onToggleRelated}
            />
          </div>
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
            {l.match ? (
              <span className="inline-flex items-center px-1 rounded bg-muted text-[10px] font-semibold tabular-nums">
                {l.match.vatPct}%
              </span>
            ) : (
              <span className="text-[10px] text-muted-foreground">—</span>
            )}
          </div>
          {/* Số lượng stepper */}
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-[10px] text-muted-foreground">SL:</span>
            <div className="inline-flex items-center rounded border bg-white overflow-hidden h-7">
              <button
                onClick={() => updateLine(l.id, { qty: Math.max(1, l.qty - 1) })}
                className="grid h-7 w-7 place-items-center hover:bg-muted text-muted-foreground text-sm shrink-0"
                aria-label="Giảm số lượng"
                type="button"
              >
                −
              </button>
              <input
                value={l.qty}
                onChange={(e) => updateLine(l.id, { qty: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-8 min-w-0 text-center bg-transparent font-bold text-xs h-7 focus:outline-none tabular-nums"
              />
              <button
                onClick={() => updateLine(l.id, { qty: l.qty + 1 })}
                className="grid h-7 w-7 place-items-center hover:bg-muted text-muted-foreground text-sm shrink-0"
                aria-label="Tăng số lượng"
                type="button"
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
              {l.match ? formatVND(l.match.unitPrice) : <span className="text-muted-foreground">—</span>}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[10px] text-muted-foreground">Thành tiền:</span>
            <span className="text-sm font-bold tabular-nums">
              {l.match ? (
                <span className="brand-gradient-text">
                  {formatVND(Math.round(l.qty * l.match.unitPrice * (1 + l.match.vatPct / 100)))}
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Related thread — expandable below card */}
      {l.match && isRelatedOpen && relatedItems.length > 0 && (
        <div className="px-2.5 pb-2 border-t border-border/50">
          <RelatedThreadMobile
            parentName={l.match.name}
            items={relatedItems}
            onPick={(item) => {
              addCatalogLine(item, 1, l.id);
              toast.success("Đã thêm ngay dưới dòng này", { description: item.name });
            }}
            onPreview={onPreview}
            onClose={onToggleRelated}
          />
        </div>
      )}
    </div>
  );
}
