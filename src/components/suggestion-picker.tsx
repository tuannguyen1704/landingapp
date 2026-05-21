"use client";
import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Check, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type CatalogItem, getProductImage } from "@/data/catalog";
import { formatVND, cn } from "@/lib/utils";

export function SuggestionPicker({
  open,
  onOpenChange,
  raw,
  suggestions,
  onPick,
  title,
  subtitleHint,
  footerHint,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  raw: string;
  suggestions: CatalogItem[];
  onPick: (item: CatalogItem) => void;
  title?: string;
  subtitleHint?: string;
  footerHint?: string;
}) {
  const [q, setQ] = React.useState("");
  const filtered = suggestions.filter((s) =>
    `${s.name} ${s.brand} ${s.sku}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm data-[state=open]:animate-overlay-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[min(720px,92vw)] max-h-[85vh] flex flex-col bg-card rounded-2xl shadow-2xl border data-[state=open]:animate-dialog-in">
          <div className="px-5 pt-5 pb-3 border-b">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Dialog.Title className="text-lg font-semibold">{title ?? "Chọn sản phẩm phù hợp"}</Dialog.Title>
                <Dialog.Description className="text-sm text-muted-foreground">
                  {subtitleHint ?? "Yêu cầu gốc"}: <span className="font-medium text-foreground">"{raw}"</span> — {suggestions.length} kết quả
                </Dialog.Description>
              </div>
              <Dialog.Close className="p-1.5 rounded-md hover:bg-muted">
                <X className="h-4 w-4" />
              </Dialog.Close>
            </div>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Lọc theo tên, mã, thương hiệu..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="overflow-y-auto p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filtered.map((item, i) => (
              <button
                key={item.sku}
                onClick={() => {
                  onPick(item);
                  onOpenChange(false);
                }}
                className={cn(
                  "group text-left rounded-xl border p-3 hover:border-violet-500 hover:bg-violet-50/40 transition-all opacity-0 animate-fade-up",
                )}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="flex items-start gap-2.5">
                  <div className="relative h-12 w-12 shrink-0 rounded-md border bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
                    <img src={getProductImage(item)} alt={item.name} className="w-full h-full object-contain p-0.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold brand-gradient-text">{item.brand}</div>
                    <div className="font-medium text-sm leading-snug line-clamp-2">{item.name}</div>
                    <div className="text-[11px] font-mono text-muted-foreground mt-0.5">SKU: {item.sku}</div>
                  </div>
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full border opacity-0 group-hover:opacity-100 group-hover:brand-gradient group-hover:text-white group-hover:border-transparent transition-all">
                    <Check className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-base font-bold brand-gradient-text">{formatVND(item.unitPrice)}</div>
                  <div className="text-xs text-muted-foreground">/ {item.unit}</div>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-12 text-sm text-muted-foreground">
                Không có đề xuất khớp với từ khoá.
              </div>
            )}
          </div>

          <div className="border-t px-5 py-3 flex items-center justify-between text-xs text-muted-foreground gap-3">
            <span className="min-w-0 truncate">{footerHint ?? "💡 Mai gợi ý chọn theo size & thương hiệu phổ biến trong lịch sử mua của bạn."}</span>
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Đóng</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
