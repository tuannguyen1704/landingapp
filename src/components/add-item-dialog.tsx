"use client";
import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Search, Plus, Package, Pencil, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATALOG, getProductImage, type CatalogItem } from "@/data/catalog";
import { useRequest } from "@/components/request-provider";
import { cn, formatVND } from "@/lib/utils";
import { toast } from "sonner";

type Tab = "catalog" | "manual";

export function AddItemDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { addCatalogLine, setLines, lines } = useRequest();
  const [tab, setTab] = React.useState<Tab>("catalog");
  const [q, setQ] = React.useState("");
  const [recentlyAdded, setRecentlyAdded] = React.useState<string[]>([]);

  // Manual form
  const [m, setM] = React.useState({ raw: "", qty: 1, unit: "cái" });

  React.useEffect(() => {
    if (open) {
      setQ("");
      setM({ raw: "", qty: 1, unit: "cái" });
      setRecentlyAdded([]);
      setTab("catalog");
    }
  }, [open]);

  const filtered = CATALOG.filter((c) => {
    if (!q.trim()) return true;
    const hay = `${c.name} ${c.brand} ${c.sku} ${c.category}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  const handleAddCatalog = (item: CatalogItem, qty: number) => {
    addCatalogLine(item, qty);
    setRecentlyAdded((cur) => [item.sku, ...cur]);
    toast.success(`Đã thêm ${qty} ${item.unit}`, { description: item.name });
  };

  const handleAddManual = () => {
    if (!m.raw.trim()) {
      toast.error("Nhập tên/mô tả vật tư");
      return;
    }
    const id = `add-${Date.now().toString(36)}`;
    setLines([
      ...lines,
      {
        id,
        raw: m.raw.trim(),
        qty: Math.max(1, m.qty),
        unit: m.unit || "cái",
        status: "missing",
        reason: "Cần Mai bóc tách & gán mã",
        selected: true,
      },
    ]);
    setRecentlyAdded((cur) => [id, ...cur]);
    toast.success("Đã thêm dòng yêu cầu", { description: m.raw });
    setM({ raw: "", qty: 1, unit: "cái" });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm data-[state=open]:animate-overlay-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[min(720px,92vw)] max-h-[85vh] flex flex-col bg-card rounded-2xl shadow-2xl border data-[state=open]:animate-dialog-in">
          {/* Header */}
          <div className="px-5 pt-5 pb-3 border-b">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Dialog.Title className="text-lg font-semibold flex items-center gap-2">
                  <Plus className="h-5 w-5 text-violet-600" />
                  Thêm vật tư vào yêu cầu báo giá
                </Dialog.Title>
                <Dialog.Description className="text-sm text-muted-foreground">
                  Tìm trong catalog hoặc nhập thủ công — Mai sẽ tự bóc tách.
                </Dialog.Description>
              </div>
              <Dialog.Close className="p-1.5 rounded-md hover:bg-muted">
                <X className="h-4 w-4" />
              </Dialog.Close>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mt-3 bg-muted/60 p-1 rounded-lg">
              <button
                onClick={() => setTab("catalog")}
                className={cn(
                  "flex-1 inline-flex items-center justify-center gap-1.5 h-8 rounded-md text-sm font-medium transition-all",
                  tab === "catalog" ? "bg-card shadow-sm text-violet-700" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Package className="h-4 w-4" />
                Tìm trong catalog
              </button>
              <button
                onClick={() => setTab("manual")}
                className={cn(
                  "flex-1 inline-flex items-center justify-center gap-1.5 h-8 rounded-md text-sm font-medium transition-all",
                  tab === "manual" ? "bg-card shadow-sm text-violet-700" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Pencil className="h-4 w-4" />
                Nhập thủ công
              </button>
            </div>
          </div>

          {/* Body */}
          {tab === "catalog" ? (
            <>
              <div className="px-5 pt-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    autoFocus
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Lọc theo tên, SKU, thương hiệu..."
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="overflow-y-auto p-3 space-y-1.5">
                {filtered.length === 0 && (
                  <div className="text-center py-12 text-sm text-muted-foreground">
                    <Package className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    Không tìm thấy. Thử <button onClick={() => setTab("manual")} className="text-violet-600 underline">nhập thủ công</button>.
                  </div>
                )}
                {filtered.map((c, i) => {
                  const added = recentlyAdded.includes(c.sku);
                  return (
                    <CatalogRow
                      key={c.sku}
                      item={c}
                      index={i}
                      added={added}
                      onAdd={(qty) => handleAddCatalog(c, qty)}
                    />
                  );
                })}
              </div>
            </>
          ) : (
            <div className="overflow-y-auto p-5 space-y-4">
              <div className="rounded-xl border bg-violet-50/40 border-violet-200 p-3 text-xs text-violet-800 flex items-start gap-2">
                <Sparkles className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>
                  Sau khi thêm, dòng này sẽ ở trạng thái <strong>"Cần xử lý"</strong>. Nhấn nút <strong>"Hỏi Mai ngay"</strong> để Mai tự gán mã sản phẩm phù hợp.
                </span>
              </div>

              <div>
                <Label>Tên / mô tả vật tư *</Label>
                <Input
                  autoFocus
                  value={m.raw}
                  onChange={(e) => setM({ ...m, raw: e.target.value })}
                  placeholder="VD: Băng keo điện 3M màu đen 18mm"
                  className="mt-1.5"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAddManual();
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Số lượng *</Label>
                  <Input
                    type="number"
                    min={1}
                    value={m.qty}
                    onChange={(e) => setM({ ...m, qty: parseInt(e.target.value) || 1 })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Đơn vị</Label>
                  <select
                    value={m.unit}
                    onChange={(e) => setM({ ...m, unit: e.target.value })}
                    className="mt-1.5 h-10 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    {["cái", "bộ", "chiếc", "thùng", "cuộn", "mét", "kg", "lít", "tuýp", "hộp"].map((u) => (
                      <option key={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                onClick={handleAddManual}
                size="lg"
                className="w-full brand-gradient text-white border-0 hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                Thêm dòng yêu cầu
              </Button>
            </div>
          )}

          {/* Footer */}
          <div className="border-t px-5 py-3 flex items-center justify-between text-xs text-muted-foreground gap-3">
            <span>
              {recentlyAdded.length > 0 ? (
                <span className="inline-flex items-center gap-1 text-emerald-700">
                  <Check className="h-3.5 w-3.5" />
                  Đã thêm {recentlyAdded.length} dòng vào yêu cầu
                </span>
              ) : (
                "💡 Có thể thêm nhiều dòng – đóng cửa sổ khi xong."
              )}
            </span>
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              {recentlyAdded.length > 0 ? "Xong" : "Đóng"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CatalogRow({
  item,
  index,
  added,
  onAdd,
}: {
  item: CatalogItem;
  index: number;
  added: boolean;
  onAdd: (qty: number) => void;
}) {
  const [qty, setQty] = React.useState(1);
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md border bg-card px-3 py-2 transition-colors animate-fade-up",
        added ? "border-emerald-300 bg-emerald-50/30" : "hover:border-violet-400 hover:bg-violet-50/40",
      )}
      style={{ animationDelay: `${Math.min(index, 10) * 25}ms` }}
    >
      <div className="relative h-9 w-9 shrink-0 rounded-md border bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
        <img src={getProductImage(item)} alt={item.name} className="w-full h-full object-contain p-0.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            {item.brand}
          </span>
          <span className="font-medium text-sm truncate">{item.name}</span>
        </div>
        <div className="text-[11px] font-mono text-muted-foreground mt-0.5 flex items-center gap-1 flex-wrap">
          <span>SKU: {item.sku}</span>
          <span className="sm:hidden font-bold brand-gradient-text not-italic">{formatVND(item.unitPrice)}/{item.unit}</span>
        </div>
      </div>
      <div className="text-right shrink-0 mr-1 hidden sm:block">
        <div className="font-bold brand-gradient-text text-sm tabular-nums">{formatVND(item.unitPrice)}</div>
        <div className="text-[10px] text-muted-foreground">/ {item.unit}</div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-14 h-8 text-right rounded border bg-background px-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-violet-200"
        />
        <Button
          size="sm"
          variant={added ? "outline" : "default"}
          className={cn(
            "h-8 px-2.5",
            added
              ? "border-emerald-300 text-emerald-700 bg-emerald-50"
              : "brand-gradient text-white border-0 hover:opacity-90",
          )}
          onClick={() => onAdd(qty)}
        >
          {added ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {added ? "Đã thêm" : "Thêm"}
        </Button>
      </div>
    </div>
  );
}
