"use client";
import * as React from "react";
import {
  X,
  SlidersHorizontal,
  Check,
  Sparkles,
  ArrowRightLeft,
  Eye,
  Search as SearchIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { findBySpecs, getProductImage, type CatalogItem } from "@/data/catalog";
import { cn, formatVND } from "@/lib/utils";
import { ImagePreviewDialog } from "@/components/image-preview-dialog";

/** Heuristic — đoán template specs theo từ khoá trong raw text. */
function guessTemplate(raw: string): { category: string; fields: string[] } {
  const t = raw.toLowerCase();
  if (t.includes("dây xích") || t.includes("xích"))
    return { category: "Dây xích", fields: ["Đường kính (phi)", "Bước xích", "Vật liệu", "Chiều dài"] };
  if (t.includes("dây cáp") || t.includes("cáp điện"))
    return { category: "Dây cáp điện", fields: ["Tiết diện (mm²)", "Số lõi", "Vỏ bọc", "Chiều dài"] };
  if (t.includes("ốc") || t.includes("bu lông") || t.includes("vít"))
    return { category: "Bu lông – ốc – vít", fields: ["Đường kính ren", "Chiều dài", "Vật liệu", "Cấp bền"] };
  if (t.includes("vòng bi") || t.includes("bạc đạn"))
    return { category: "Vòng bi", fields: ["Đường kính trong", "Đường kính ngoài", "Bề dày", "Loại bịt kín"] };
  return { category: "Vật tư khác", fields: ["Kích thước", "Vật liệu", "Tiêu chuẩn"] };
}

const CATEGORY_OPTIONS = [
  "Dây xích",
  "Dây cáp điện",
  "Bu lông – ốc – vít",
  "Vòng bi",
  "Phớt chặn",
  "Mỡ bôi trơn",
  "Mũi khoan",
  "Khớp nối",
  "Đá cắt / mài",
  "Vật tư khác",
];

export function SpecPickerPanel({
  open,
  context,
  onClose,
  onPick,
}: {
  open: boolean;
  context?: string;
  onClose: () => void;
  onPick: (item: CatalogItem) => void;
}) {
  const initial = React.useMemo(() => guessTemplate(context ?? ""), [context]);
  const [category, setCategory] = React.useState(initial.category);
  const [fields, setFields] = React.useState<string[]>(initial.fields);
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [previewItem, setPreviewItem] = React.useState<CatalogItem | null>(null);

  React.useEffect(() => {
    if (open && context) {
      const t = guessTemplate(context);
      setCategory(t.category);
      setFields(t.fields);
      setValues({});
    }
  }, [open, context]);

  const onChangeCategory = (cat: string) => {
    setCategory(cat);
    if (cat !== category) {
      const fake = guessTemplate(cat.toLowerCase());
      setFields(fake.fields.length > 1 ? fake.fields : ["Kích thước", "Vật liệu", "Tiêu chuẩn"]);
      setValues({});
    }
  };

  const filledCount = Object.values(values).filter((v) => v && v.trim()).length;
  const matches = filledCount > 0 ? findBySpecs(context ?? category, values) : [];

  if (!open) return null;

  return (
    <>
      {/* Backdrop — click để đóng trên mobile */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-20 lg:hidden"
        onClick={onClose}
      />

      {/* Panel — full-screen drawer 2 cột */}
      <aside
        className="fixed right-0 top-14 sm:top-16 bottom-0 w-full lg:w-[80vw] lg:max-w-[960px] z-30 bg-card border-l shadow-2xl flex flex-col animate-fade-up"
        role="dialog"
        aria-label="Bổ sung thông số kỹ thuật"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b bg-gradient-to-r from-amber-50 to-orange-50 shrink-0">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow shrink-0">
            <SlidersHorizontal className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold">Bổ sung thông số kỹ thuật</div>
            {context && (
              <div className="text-xs text-muted-foreground truncate">
                Đang xử lý: <span className="text-amber-700 font-medium">{context}</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="p-1.5 rounded-md hover:bg-white/60 shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body — split 2 panes (results left, filter right) */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_320px]">
          {/* LEFT — product list (red zone) */}
          <section className="min-w-0 border-r bg-gradient-to-b from-rose-50/40 via-white to-white flex flex-col">
            <div className="px-4 py-3 border-b bg-card/60 backdrop-blur sticky top-0 z-10 flex items-center gap-2 flex-wrap">
              <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700 inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {filledCount === 0
                  ? "Sản phẩm phù hợp"
                  : `${matches.length} sản phẩm khớp ${filledCount} thông số`}
              </div>
              {filledCount > 0 && (
                <span className="ml-auto text-[10px] text-muted-foreground">
                  Sắp xếp theo độ phù hợp
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4">
              {filledCount === 0 ? (
                <EmptyState />
              ) : matches.length === 0 ? (
                <div className="text-center py-12 text-sm text-muted-foreground">
                  Không có sản phẩm khớp. Thử bớt 1 thông số ở bên phải.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {matches.map((m, i) => (
                    <article
                      key={m.sku}
                      className="rounded-xl border bg-card hover:border-rose-300 hover:shadow-md transition-all overflow-hidden animate-fade-up flex flex-col"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <button
                        onClick={() => setPreviewItem(m)}
                        className="relative aspect-[16/10] bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden text-left group"
                        aria-label={`Xem chi tiết ${m.name}`}
                      >
                        <img
                          src={getProductImage(m)}
                          alt={m.name}
                          className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute top-1.5 left-1.5 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/90 backdrop-blur text-muted-foreground border">
                          {m.brand}
                        </span>
                        <span className="absolute bottom-1.5 right-1.5 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-violet-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="h-3 w-3" /> Xem chi tiết
                        </span>
                      </button>

                      <div className="p-2.5 flex-1 flex flex-col">
                        <h4 className="font-medium text-sm leading-snug line-clamp-2 min-h-[2.5em]">
                          {m.name}
                        </h4>
                        <div className="text-[10px] font-mono text-muted-foreground mt-1">
                          SKU: {m.sku} · Giao {m.leadTimeDays}d
                        </div>
                        <div className="mt-2 flex items-end justify-between gap-2">
                          <div>
                            <div className="font-bold brand-gradient-text text-base tabular-nums leading-none">
                              {formatVND(m.unitPrice)}
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              / {m.unit}
                            </div>
                          </div>
                          <span className="text-[10px] inline-flex items-center gap-0.5 text-emerald-700 font-semibold">
                            <Check className="h-2.5 w-2.5" /> Khớp {filledCount}
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-[11px] px-2"
                            onClick={() => setPreviewItem(m)}
                          >
                            <Eye className="h-3 w-3" /> Chi tiết
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 text-[11px] px-2 brand-gradient text-white border-0 hover:opacity-90"
                            onClick={() => onPick(m)}
                          >
                            <Check className="h-3 w-3" /> Chọn
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* RIGHT — filter sidebar (orange zone) */}
          <section className="min-w-0 bg-gradient-to-b from-amber-50/50 via-white to-white flex flex-col border-t md:border-t-0">
            <div className="px-4 py-3 border-b bg-card/60 backdrop-blur sticky top-0 z-10">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 inline-flex items-center gap-1">
                <SlidersHorizontal className="h-3 w-3" />
                Bộ lọc thông số
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-3">
              <div>
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Loại vật tư
                </Label>
                <select
                  value={category}
                  onChange={(e) => onChangeCategory(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              {fields.map((f) => (
                <div key={f}>
                  <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {f}
                  </Label>
                  <Input
                    value={values[f] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [f]: e.target.value }))}
                    placeholder="Nhập giá trị..."
                    className="mt-1 h-9 focus-visible:ring-amber-200"
                  />
                </div>
              ))}

              {filledCount > 0 && (
                <button
                  onClick={() => setValues({})}
                  className="text-xs text-amber-700 hover:underline inline-flex items-center gap-1"
                >
                  <X className="h-3 w-3" /> Xoá hết bộ lọc
                </button>
              )}

              <div className="pt-3 border-t">
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-[11px] text-amber-900">
                  <div className="font-semibold inline-flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Mai gợi ý
                  </div>
                  <p className="mt-0.5">
                    Nhập ít nhất 1 thông số để Mai tìm sản phẩm. Càng nhiều thông số, độ chính xác càng cao.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-3 flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" className="flex-1" onClick={onClose}>
                Đóng
              </Button>
              <Button
                size="sm"
                className="flex-1 brand-gradient text-white border-0 hover:opacity-90"
                disabled={matches.length === 0}
                onClick={() => matches[0] && onPick(matches[0])}
              >
                <Check className="h-3.5 w-3.5" />
                Chọn mã đầu tiên
              </Button>
            </div>
          </section>
        </div>
      </aside>

      {/* Detail dialog (nested) */}
      <ImagePreviewDialog
        open={!!previewItem}
        onOpenChange={(v) => !v && setPreviewItem(null)}
        item={previewItem}
        onPick={(item) => onPick(item)}
      />
    </>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-10 sm:py-16 px-4">
      <div className="grid h-16 w-16 mx-auto place-items-center rounded-full bg-rose-50 text-rose-400 mb-3">
        <SearchIcon className="h-8 w-8" />
      </div>
      <h3 className="font-semibold text-sm sm:text-base">Chưa có sản phẩm nào</h3>
      <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
        Bộ chọn thông số sẽ tự động lọc danh mục sản phẩm khi bạn nhập giá trị ở bộ lọc bên phải.
      </p>
      <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <ArrowRightLeft className="h-3 w-3" />
        Mẹo: nhập "phi 10" hoặc "1.5mm" để Mai tìm nhanh
      </div>
    </div>
  );
}
