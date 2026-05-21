"use client";
import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  Package,
  ChevronLeft,
  ChevronRight,
  Truck,
  ShieldCheck,
  Clock,
  Boxes,
} from "lucide-react";
import { getProductImage, type CatalogItem } from "@/data/catalog";
import { cn, formatVND } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item: CatalogItem | null;
  /** Optional: giữ prop để backward-compat với call site dùng dialog làm bước chọn mã */
  onPick?: (item: CatalogItem) => void;
};

export function ImagePreviewDialog({ open, onOpenChange, item }: Props) {
  const [qty, setQty] = React.useState(1);
  const [imgIdx, setImgIdx] = React.useState(0);

  React.useEffect(() => {
    if (open && item) {
      setQty(1);
      setImgIdx(0);
    }
  }, [open, item]);

  if (!item) return null;

  const totalStock = item.suppliers.reduce((s, x) => s + x.stock, 0);
  const cheapest = Math.min(...item.suppliers.map((s) => s.price));
  const fastest = Math.min(...item.suppliers.map((s) => s.eta));
  const subtotal = qty * cheapest;

  // Demo: 4 ảnh "phái sinh" (cùng SVG để mock carousel)
  const images = [item, item, item, item];

  const specs = inferSpecs(item);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm data-[state=open]:animate-overlay-in" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[min(960px,95vw)] max-h-[92vh] flex flex-col bg-card rounded-2xl shadow-2xl border data-[state=open]:animate-dialog-in overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b bg-gradient-to-r from-violet-50 to-blue-50">
            <Dialog.Title className="font-semibold inline-flex items-center gap-2 min-w-0">
              <Package className="h-4 w-4 text-violet-600 shrink-0" />
              <span className="truncate">Chi tiết sản phẩm</span>
            </Dialog.Title>
            <Dialog.Close className="p-1.5 rounded-md hover:bg-white/60 shrink-0">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {/* Body — scrollable */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {/* Top: image + main info */}
            <div className="p-4 sm:p-6 grid lg:grid-cols-[340px_1fr_240px] gap-4 sm:gap-5">
              {/* Image carousel */}
              <div className="space-y-2">
                <div className="relative aspect-square rounded-xl border bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
                  <img
                    src={getProductImage(images[imgIdx])}
                    alt={item.name}
                    className="w-full h-full object-contain p-6"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        aria-label="Ảnh trước"
                        onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow border hover:bg-white"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        aria-label="Ảnh sau"
                        onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow border hover:bg-white"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-medium">
                        {imgIdx + 1}/{images.length}
                      </div>
                    </>
                  )}
                </div>
                {/* Thumbnails */}
                <div className="flex items-center gap-1.5">
                  {images.map((it, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={cn(
                        "h-12 w-12 rounded-md border bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden shrink-0 transition-all",
                        imgIdx === i ? "ring-2 ring-violet-500 border-violet-300" : "hover:border-violet-300",
                      )}
                    >
                      <img src={getProductImage(it)} alt="" className="w-full h-full object-contain p-1" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Main info — left column (info + price + qty) */}
              <div className="min-w-0">
                <div className="text-xs font-bold uppercase tracking-wider text-violet-700">{item.brand}</div>
                <h3 className="text-lg sm:text-xl font-bold mt-1 leading-snug brand-gradient-text">
                  {item.name}
                </h3>

                {/* Sản phẩm — meta */}
                <dl className="mt-4 grid grid-cols-[110px_1fr] gap-y-2 text-sm">
                  <dt className="text-muted-foreground">MPN:</dt>
                  <dd className="font-mono font-semibold">{item.sku}</dd>

                  <dt className="text-muted-foreground">Mã đặt hàng:</dt>
                  <dd className="font-mono">{deriveOrderCode(item.sku)}</dd>

                  <dt className="text-muted-foreground">Danh mục:</dt>
                  <dd>{item.category}</dd>

                  <dt className="text-muted-foreground">VAT:</dt>
                  <dd>{item.vatPct}%</dd>

                  <dt className="text-muted-foreground">Đơn giá:</dt>
                  <dd className="font-bold text-red-600 tabular-nums">
                    {formatVND(cheapest)} <span className="text-xs text-muted-foreground font-normal">/ {item.unit}</span>
                  </dd>

                  <dt className="text-muted-foreground self-center">Số lượng:</dt>
                  <dd>
                    <div className="inline-flex items-center rounded-md border overflow-hidden">
                      <button
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        className="h-8 w-8 grid place-items-center hover:bg-muted text-muted-foreground"
                        aria-label="Giảm"
                      >−</button>
                      <input
                        type="number"
                        min={1}
                        value={qty}
                        onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                        className="h-8 w-16 text-center bg-transparent text-sm tabular-nums focus:outline-none"
                      />
                      <button
                        onClick={() => setQty((q) => q + 1)}
                        className="h-8 w-8 grid place-items-center hover:bg-muted text-muted-foreground"
                        aria-label="Tăng"
                      >+</button>
                    </div>
                  </dd>

                  <dt className="text-muted-foreground self-center">Tạm tính:</dt>
                  <dd className="text-lg font-bold brand-gradient-text tabular-nums">
                    {formatVND(subtotal)}
                    <span className="text-[11px] text-muted-foreground font-normal ml-1">(chưa VAT)</span>
                  </dd>
                </dl>
              </div>

              {/* Right column — Thông số kỹ thuật */}
              <div className="rounded-xl border bg-violet-50/30 p-3 sm:p-4 lg:max-w-none">
                <div className="text-[11px] font-bold uppercase tracking-wider text-violet-700 mb-2">
                  Thông số kỹ thuật
                </div>
                <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5 text-xs">
                  {specs.map(([k, v]) => (
                    <React.Fragment key={k}>
                      <dt className="text-muted-foreground">{k}:</dt>
                      <dd className="font-medium text-right">{v}</dd>
                    </React.Fragment>
                  ))}
                </dl>
                <button className="mt-3 text-[11px] text-violet-700 font-semibold hover:underline inline-flex items-center gap-1">
                  Xem thêm
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Stock & lead time table */}
            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="rounded-xl border overflow-hidden overflow-x-auto">
                <table className="w-full text-sm min-w-[400px]">
                  <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-2 font-semibold">Số lượng</th>
                      <th className="text-left px-4 py-2 font-semibold">Trạng thái tồn kho</th>
                      <th className="text-left px-4 py-2 font-semibold">Thời gian giao hàng dự kiến</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {item.suppliers.map((s, i) => (
                      <tr key={s.name} className={i === 0 ? "bg-emerald-50/40" : ""}>
                        <td className="px-4 py-2 font-bold text-emerald-700 tabular-nums">{s.stock}</td>
                        <td className="px-4 py-2">
                          <div className="font-medium">{s.name}</div>
                          {i === 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] mt-0.5 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">
                              <ShieldCheck className="h-2.5 w-2.5" />
                              Giá tốt nhất
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold",
                              s.eta === 1
                                ? "bg-emerald-100 text-emerald-700"
                                : s.eta === 2
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-amber-100 text-amber-700",
                            )}
                          >
                            <Clock className="h-3 w-3" />
                            Giao trong {s.eta} ngày
                          </span>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td className="px-4 py-2 text-amber-700 font-semibold">Nhiều hơn</td>
                      <td className="px-4 py-2 text-muted-foreground">Nhập hàng từ NCC</td>
                      <td className="px-4 py-2 text-amber-700 font-medium">Từ 30 ngày làm việc</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                <Stat icon={Boxes} label="Tổng tồn" value={`${totalStock} ${item.unit}`} />
                <Stat icon={Truck} label="Giao nhanh" value={`${fastest} ngày`} />
                <Stat icon={ShieldCheck} label="NCC" value={`${item.suppliers.length} kho`} />
                <Stat icon={Package} label="Danh mục" value={item.category} truncate />
              </div>
            </div>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  truncate,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  truncate?: boolean;
}) {
  return (
    <div className="rounded-md border p-2">
      <div className="text-[10px] uppercase text-muted-foreground inline-flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className={cn("font-bold text-sm mt-0.5", truncate && "truncate")}>{value}</div>
    </div>
  );
}

/** Suy luận thông số demo từ item.category + sku để hiển thị trong tab specs.
 * Production sẽ thay bằng item.specs từ catalog. */
function inferSpecs(item: CatalogItem): Array<[string, string]> {
  const cat = item.category.toLowerCase();
  const base: Array<[string, string]> = [
    ["Xuất xứ", item.brand === "Bosch" || item.brand === "Stanley" || item.brand === "Makita" ? "Nhập khẩu" : "Việt Nam"],
    ["Tiêu chuẩn", "DIN / ISO"],
    ["Hệ kích thước", "Met"],
  ];
  if (cat.includes("mũi khoan")) {
    return [
      ["Đường kính", item.name.match(/\d+(\.\d+)?\s*mm/i)?.[0] ?? "—"],
      ["Vật liệu", "HSS (Thép gió)"],
      ["Loại chuôi", "Chuôi tròn"],
      ...base,
    ];
  }
  if (cat.includes("đá")) {
    return [
      ["Đường kính", item.name.match(/\d+\s*mm/i)?.[0] ?? "—"],
      ["Vật liệu", "Hợp kim mài mòn"],
      ["Tốc độ tối đa", "13.300 RPM"],
      ...base,
    ];
  }
  if (cat.includes("kìm") || cat.includes("mỏ lết")) {
    return [
      ["Chiều dài", item.name.match(/\d+\s*mm/i)?.[0] ?? "—"],
      ["Vật liệu", "Thép Cr-V"],
      ["Bọc tay cầm", "Cao su chống trượt"],
      ...base,
    ];
  }
  return [
    ["Vật liệu", "Thép Carbon"],
    ["Hình dạng", "Theo tiêu chuẩn"],
    ...base,
  ];
}

/** Sinh "mã đặt hàng" demo theo SKU. */
function deriveOrderCode(sku: string): string {
  let h = 0;
  for (const c of sku) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return String(1000000 + (h % 9000000)).slice(0, 7);
}
