"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  ShoppingCart,
  Clock,
  ChevronDown,
  Sparkles,
  Boxes,
  Loader2,
  CheckCircle2,
  Server,
  Tag,
  FileDown,
  Printer,
  Truck,
  AlertTriangle,
  RefreshCcw,
  Repeat,
  Check,
  X,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { exportQuoteCSV, exportQuotePDF } from "@/lib/export-quote";
import { ImagePreviewDialog } from "@/components/image-preview-dialog";
import {
  getProductImage,
  getAlternativeProducts,
  type CatalogItem,
} from "@/data/catalog";
import { useRequest } from "@/components/request-provider";
import { Button } from "@/components/ui/button";
import { cn, formatVND } from "@/lib/utils";
import { toast } from "sonner";
import { lineSubtotal, type RequestLine } from "@/data/sample-request";
import { defaultAllocation } from "@/components/allocation-panel";
import { QuoteMobileCard } from "./quote-mobile-card";

/** Trả về NCC đang được chọn (selectedSupplier), hoặc NCC rẻ nhất nếu chưa chọn. */
function bestSupplier(l: RequestLine) {
  if (!l.match) return undefined;
  if (l.selectedSupplier) {
    const s = l.match.suppliers.find((x) => x.name === l.selectedSupplier);
    if (s) return s;
  }
  return [...l.match.suppliers].sort((a, b) => a.price - b.price)[0];
}

/** Index "Option N" theo thứ tự giá tăng dần (Option 1 = rẻ nhất). */
function optionRank(l: RequestLine, supplierName: string): number {
  if (!l.match) return 0;
  const sorted = [...l.match.suppliers].sort((a, b) => a.price - b.price);
  return sorted.findIndex((s) => s.name === supplierName) + 1;
}

export default function QuotePage() {
  const router = useRouter();
  const { lines, hasRequest, updateLine, loadSample, removeLine } = useRequest();
  /**
   * Scan có 3 phase:
   *  - "phase1": kết nối các NCC (4-5s, lấp đến ~45%)
   *  - "phase1-prompt": hỏi user có chờ thêm 30s để mở rộng phạm vi không
   *  - "phase2": mở rộng kết nối NCC (4-5s, lấp đến 95%)
   *  - "phase3": hoàn tất, có 2 NCC offline – cho user tiếp tục với báo giá hiện có
   *  - "done": đóng popup, hiển thị bảng
   */
  type Phase = "phase1" | "phase1-prompt" | "phase2" | "phase3" | "done";
  const [phase, setPhase] = React.useState<Phase>("phase1");
  const [scanProgress, setScanProgress] = React.useState(0);
  const scanning = phase !== "done";
  const NCC_TOTAL = 36;
  const NCC_OFFLINE = 2;
  const NCC_PHASE1 = 15;
  const NCC_PHASE2_TARGET = NCC_TOTAL - NCC_OFFLINE; // 34
  const [eventLog, setEventLog] = React.useState<Array<{ kind: "ncc-call" | "ncc-done" | "sku-locked" | "info"; text: string; sub?: string }>>([]);
  /** Expanded keys: "alloc:lineId" | "related:lineId" | "alt:lineId" */
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  /** Image preview */
  const [previewItem, setPreviewItem] = React.useState<CatalogItem | null>(null);
  /** Hạn báo giá 48H — compute client-side để tránh hydration mismatch */
  const [quoteExpiry, setQuoteExpiry] = React.useState("");
  React.useEffect(() => {
    const d = new Date(Date.now() + 48 * 3600_000);
    setQuoteExpiry(d.toLocaleDateString("vi-VN"));
  }, []);

  /** Demo: nhiều dòng bị "hết hàng toàn bộ NCC" để minh hoạ flow thay thế hàng loạt. */
  const [outOfStock, setOutOfStock] = React.useState<Set<string>>(new Set());
  /** Dropdown "thay thế mã" mở cho line nào */
  const [replaceOpenId, setReplaceOpenId] = React.useState<string | null>(null);
  /** Dòng đang re-scan (animate xoay 10s) */
  const [rescanningIds, setRescanningIds] = React.useState<Set<string>>(new Set());
  /** Mã thay thế user đã PRE-SELECT (chưa rescan, chờ batch) */
  const [pendingReplace, setPendingReplace] = React.useState<Map<string, CatalogItem>>(new Map());
  /** Bật filter chỉ hiển thị các dòng OOS (click pill "N mã hết hàng") */
  const [oosFilterOn, setOosFilterOn] = React.useState(false);
  /** Bật filter chỉ hiển thị các dòng "thiếu hàng" (partial) */
  const [partialFilterOn, setPartialFilterOn] = React.useState(false);
  /** Bulk action kebab menu state */
  const [bulkMenuOpen, setBulkMenuOpen] = React.useState(false);
  const bulkMenuRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!bulkMenuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (bulkMenuRef.current && !bulkMenuRef.current.contains(e.target as Node)) setBulkMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [bulkMenuOpen]);
  // Khi không còn OOS nào → tự tắt filter để bảng không trống
  React.useEffect(() => {
    if (oosFilterOn && outOfStock.size === 0) setOosFilterOn(false);
  }, [oosFilterOn, outOfStock]);

  /** Check 1 line có status "thiếu hàng" (partial) không */
  const isPartial = React.useCallback(
    (l: RequestLine) => {
      if (!l.match || outOfStock.has(l.id)) return false;
      const total = l.match.suppliers.reduce((s, x) => s + x.stock, 0);
      return total < l.qty;
    },
    [outOfStock],
  );
  const partialCount = lines.filter(isPartial).length;

  /** Đếm các dòng "có sẵn" (đủ hàng + có báo giá) — dùng cho quick-select */
  const enoughLineIds = React.useMemo(() => {
    const ids: string[] = [];
    lines.forEach((l) => {
      if (!l.match || outOfStock.has(l.id)) return;
      const totalStock = l.match.suppliers.reduce((s, x) => s + x.stock, 0);
      if (totalStock >= l.qty) ids.push(l.id);
    });
    return ids;
  }, [lines, outOfStock]);
  const enoughCount = enoughLineIds.length;

  /** Quick-select: chỉ giữ các dòng "có sẵn" — bỏ chọn OOS + thiếu hàng + reset filter. */
  const selectOnlyEnough = () => {
    setOosFilterOn(false);
    setPartialFilterOn(false);
    const enoughSet = new Set(enoughLineIds);
    lines.forEach((l) => updateLine(l.id, { selected: enoughSet.has(l.id) }));
    toast.success(`Đã chọn ${enoughLineIds.length} mã có sẵn`, {
      description: "Đã bỏ lọc, hiển thị toàn bộ bảng.",
    });
  };
  /** Quick-select: chọn tất cả dòng + reset filter. */
  const selectAllLines = () => {
    setOosFilterOn(false);
    setPartialFilterOn(false);
    lines.forEach((l) => updateLine(l.id, { selected: true }));
    toast.success(`Đã chọn tất cả ${lines.length} mã`, {
      description: "Đã bỏ lọc, hiển thị toàn bộ bảng.",
    });
  };
  React.useEffect(() => {
    if (partialFilterOn && partialCount === 0) setPartialFilterOn(false);
  }, [partialFilterOn, partialCount]);

  /** Toggle 2 filter mutually exclusive */
  const toggleOosFilter = () => {
    setOosFilterOn((v) => !v);
    setPartialFilterOn(false);
  };
  const togglePartialFilter = () => {
    setPartialFilterOn((v) => !v);
    setOosFilterOn(false);
  };

  /** Visible lines = áp dụng filter hiện tại */
  const visibleLines = oosFilterOn
    ? lines.filter((l) => outOfStock.has(l.id))
    : partialFilterOn
      ? lines.filter(isPartial)
      : lines;
  /** Visible lines đang được checked */
  const visibleSelectedIds = visibleLines.filter((l) => l.selected).map((l) => l.id);

  /** Xoá các dòng đang chọn (visible) với confirm popup */
  const handleDeleteVisibleSelected = () => {
    const ids = visibleSelectedIds;
    if (ids.length === 0) return;
    const label = oosFilterOn
      ? "dòng hết hàng"
      : partialFilterOn
        ? "dòng thiếu hàng"
        : "dòng";
    toast(`Chắc chắn xoá ${ids.length}/${visibleLines.length} ${label} đã chọn?`, {
      action: {
        label: "Xoá",
        onClick: () => {
          ids.forEach((id) => removeLine(id));
          toast.success(`Đã xoá ${ids.length} ${label}`);
        },
      },
      cancel: { label: "Huỷ", onClick: () => {} },
      duration: 8000,
    });
  };

  /** Khi vào "done" lần đầu, mark ~10 dòng demo là OOS (lấy theo index để cố định) */
  React.useEffect(() => {
    if (phase !== "done") return;
    const matchedIds = lines.filter((l) => l.status === "matched" && l.match).map((l) => l.id);
    // Mark 10 dòng cách đều để demo nhiều case
    const oosIndices = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29];
    const oosIds = oosIndices.map((idx) => matchedIds[idx]).filter(Boolean) as string[];
    setOutOfStock((prev) => {
      if (prev.size > 0) return prev; // chỉ init 1 lần
      return new Set(oosIds);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /** User pre-select 1 mã thay thế cho 1 dòng OOS — chưa rescan, chờ batch. */
  const preSelectReplace = (lineId: string, item: CatalogItem) => {
    setPendingReplace((prev) => {
      const next = new Map(prev);
      next.set(lineId, item);
      return next;
    });
    setReplaceOpenId(null);
    toast.success(`Đã chọn: ${item.name}`, {
      description: "Bấm 'Báo giá lại N mã' ở thanh dưới để Mai ép giá đồng loạt.",
    });
  };

  /** Huỷ pre-select cho 1 dòng */
  const cancelPreSelect = (lineId: string) => {
    setPendingReplace((prev) => {
      const next = new Map(prev);
      next.delete(lineId);
      return next;
    });
  };

  /** Batch rescan: commit toàn bộ pending replacements + rescan đồng loạt 10s. */
  const batchRescan = () => {
    if (pendingReplace.size === 0) return;
    const entries = Array.from(pendingReplace.entries());
    // Commit replacements
    entries.forEach(([lineId, item]) => {
      updateLine(lineId, {
        match: item,
        selectedSku: item.sku,
        selectedSupplier: item.suppliers[0]?.name,
        allocations: undefined,
      });
    });
    // Mark rescanning + clear pending
    setRescanningIds(new Set(entries.map(([id]) => id)));
    setPendingReplace(new Map());
    toast.message(`Mai đang ép giá lại ${entries.length} mã song song...`, {
      description: "Quét 10 NCC cho từng mã mới (~5s).",
    });
    setTimeout(() => {
      setOutOfStock((prev) => {
        const next = new Set(prev);
        entries.forEach(([id]) => next.delete(id));
        return next;
      });
      setRescanningIds(new Set());
      toast.success(`Đã có giá mới cho ${entries.length} mã`, {
        description: "Tất cả NCC sẵn hàng — bạn có thể tiếp tục đặt đơn.",
      });
    }, 10_000);
  };

  const isOpen = (key: string) => expanded.has(key);
  const toggle = (key: string) => {
    setExpanded((cur) => {
      const next = new Set(cur);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  React.useEffect(() => {
    if (!hasRequest) loadSample("Upload_Image.png");
  }, [hasRequest, loadSample]);

  const matched = lines.filter((l) => l.status === "matched" && l.match);
  const total = matched.length;

  // Phase 1 & 2 — mỗi phase 0→100% trong đúng 30s.
  // Dùng Date.now() để không bị throttle khi đổi tab/cửa sổ background.
  React.useEffect(() => {
    if (phase !== "phase1" && phase !== "phase2") return;
    setScanProgress(0); // reset mỗi phase
    const startTime = Date.now();
    const duration = 30000; // 30s tổng
    const tick = 150;
    const id = setInterval(() => {
      const elapsed = Date.now() - startTime;
      // 0→90% trong 28s, sau đó 90→100% trong 2s (thời gian "Chuẩn bị hoàn tất")
      let p: number;
      if (elapsed < duration * 0.93) {
        // 28s đầu: chạy mượt 0→90
        p = (elapsed / (duration * 0.93)) * 90;
      } else {
        // 2s cuối: 90→100
        const tailElapsed = elapsed - duration * 0.93;
        const tailDur = duration * 0.07;
        p = 90 + Math.min(10, (tailElapsed / tailDur) * 10);
      }
      setScanProgress(Math.min(100, p));
      if (elapsed >= duration) {
        clearInterval(id);
        setScanProgress(100);
        setTimeout(
          () => setPhase(phase === "phase1" ? "phase1-prompt" : "phase3"),
          200,
        );
      }
    }, tick);
    return () => clearInterval(id);
  }, [phase]);

  // Khi vào "done", init default allocations
  React.useEffect(() => {
    if (phase !== "done") return;
    matched.forEach((l) => {
      if (!l.allocations) updateLine(l.id, { allocations: defaultAllocation(l) });
    });
    // Cố ý: chỉ chạy 1 lần khi chuyển sang "done". Thêm `matched`/`updateLine` vào deps
    // sẽ gây loop vì updateLine chính nó thay đổi `lines` → `matched` mới.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Activity feed — generate ~50 events trải đều trong 30s mỗi phase
  React.useEffect(() => {
    if (phase !== "phase1" && phase !== "phase2") return;
    setEventLog([]); // reset khi vào phase mới
    const seq = phase === "phase1" ? generatePhase1Events(matched) : generatePhase2Events(matched);
    const timers = seq.map((ev) =>
      setTimeout(() => {
        setEventLog((prev) => [{ kind: ev.kind, text: ev.text, sub: ev.sub }, ...prev].slice(0, 7));
      }, ev.delay),
    );
    return () => timers.forEach(clearTimeout);
    // Cố ý: feed chỉ regenerate khi đổi phase, không khi `matched` thay đổi —
    // vì cập nhật allocation/supplier giữa scan sẽ reset toàn bộ feed gây nháy UI.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Số NCC đã kết nối tính theo phase. Mỗi phase scanProgress chạy 0→100%.
  const nccConnected =
    phase === "phase1"
      ? Math.floor((scanProgress / 100) * NCC_PHASE1)
      : phase === "phase1-prompt"
        ? NCC_PHASE1
        : phase === "phase2"
          ? NCC_PHASE1 + Math.floor((scanProgress / 100) * (NCC_PHASE2_TARGET - NCC_PHASE1))
          : NCC_PHASE2_TARGET;

  // Loại trừ dòng đang OOS hoặc đang rescanning khỏi tổng đơn
  const grandSubtotal = lines
    .filter((l) => l.selected && l.match && !outOfStock.has(l.id) && !rescanningIds.has(l.id))
    .reduce((s, l) => s + lineSubtotal(l), 0);
  const grandVat = Math.round(grandSubtotal * 0.08);
  const grand = grandSubtotal + grandVat;

  /** Tóm tắt lead time theo dòng đã chọn — eta = max ETA giữa các NCC được phân bổ. */
  const leadTimeBreakdown = React.useMemo(() => {
    const buckets = new Map<number, number>();
    lines
      .filter((l) => l.selected && l.match)
      .forEach((l) => {
        let eta: number;
        if (l.allocations && Object.keys(l.allocations).length > 0) {
          const usedEtas = Object.entries(l.allocations)
            .filter(([, qty]) => qty > 0)
            .map(([name]) => l.match!.suppliers.find((s) => s.name === name)?.eta ?? 99)
            .filter((x) => x !== 99);
          eta = usedEtas.length ? Math.max(...usedEtas) : l.match!.leadTimeDays;
        } else {
          const sup = l.match!.suppliers.find((s) => s.name === l.selectedSupplier) ?? l.match!.suppliers[0];
          eta = sup.eta;
        }
        buckets.set(eta, (buckets.get(eta) ?? 0) + 1);
      });
    return Array.from(buckets.entries()).sort((a, b) => a[0] - b[0]);
  }, [lines]);

  return (
    <div className="px-3 sm:px-4 md:px-8 py-4 sm:py-6 max-w-[1600px] mx-auto">
      {/* Title row — gộp pill OOS/delivery vào cùng hàng */}
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold tracking-tight">
              Yêu cầu báo giá <span className="font-mono brand-gradient-text">#123</span>
            </h1>
            <p className="text-[11px] text-muted-foreground">
              {matched.length} dòng
            </p>
          </div>

          {/* OOS filter pill — đơn điệu, chấm màu rose chỉ trạng thái */}
          {!scanning && outOfStock.size > 0 && rescanningIds.size === 0 && (
            <button
              onClick={toggleOosFilter}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 h-8 rounded-lg border text-xs font-medium transition-colors",
                oosFilterOn
                  ? "bg-slate-100 border-slate-400 text-slate-900 shadow-sm"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50",
              )}
              title={oosFilterOn ? "Đang lọc — click để bỏ lọc" : "Click để lọc chỉ những mã chưa báo giá"}
              aria-pressed={oosFilterOn}
            >
              <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" aria-hidden />
              <span>
                <strong className="font-bold">{outOfStock.size}</strong> mã chưa báo giá
                {pendingReplace.size > 0 && (
                  <span className="text-emerald-700"> · đã chọn {pendingReplace.size}</span>
                )}
              </span>
              {oosFilterOn && <X className="h-3 w-3 shrink-0 opacity-60" />}
            </button>
          )}

          {/* Partial filter pill — đơn điệu, chấm màu amber */}
          {!scanning && partialCount > 0 && rescanningIds.size === 0 && (
            <button
              onClick={togglePartialFilter}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 h-8 rounded-lg border text-xs font-medium transition-colors",
                partialFilterOn
                  ? "bg-slate-100 border-slate-400 text-slate-900 shadow-sm"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50",
              )}
              title={partialFilterOn ? "Đang lọc — click để bỏ lọc" : "Click để lọc chỉ những mã thiếu hàng"}
              aria-pressed={partialFilterOn}
            >
              <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" aria-hidden />
              <span>
                <strong className="font-bold">{partialCount}</strong> mã thiếu hàng
              </span>
              {partialFilterOn && <X className="h-3 w-3 shrink-0 opacity-60" />}
            </button>
          )}

          {/* Rescanning pill */}
          {!scanning && rescanningIds.size > 0 && (
            <div className="inline-flex items-center gap-1.5 px-2.5 h-8 rounded-lg bg-violet-50 border border-violet-300 text-violet-800 text-xs font-medium animate-pulse">
              <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
              <span>Đang ép giá lại <strong>{rescanningIds.size}</strong> mã...</span>
            </div>
          )}

          {/* Quick-select actions — chỉ hiện khi scan xong */}
          {!scanning && rescanningIds.size === 0 && lines.length > 0 && (
            <>
              <button
                onClick={selectOnlyEnough}
                className="inline-flex items-center gap-1.5 px-2.5 h-8 rounded-lg border border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-800 text-xs font-medium transition-colors"
                title="Bỏ chọn các mã chưa báo giá / thiếu hàng, chỉ giữ mã đủ hàng"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" aria-hidden />
                Chọn <strong className="font-bold">{enoughCount}</strong> mã có sẵn
              </button>
              <button
                onClick={selectAllLines}
                className="inline-flex items-center gap-1.5 px-2.5 h-8 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
                title="Chọn tất cả dòng (bao gồm chưa báo giá + thiếu hàng)"
              >
                Chọn tất cả <strong className="font-bold">{lines.length}</strong> mã
              </button>
            </>
          )}
        </div>

        {/* Right cluster: badge (đang chọn/đã chốt) + bulk action kebab canh lề phải */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <Boxes className="h-3.5 w-3.5" />
            {scanning
              ? "Đang chốt..."
              : visibleSelectedIds.length > 0
                ? `Đang chọn ${visibleSelectedIds.length} mã`
                : `${matched.length}/${matched.length} dòng đã chốt`}
          </div>
          {visibleSelectedIds.length > 0 && (
            <div ref={bulkMenuRef} className="relative">
              <button
                onClick={() => setBulkMenuOpen((v) => !v)}
                className="grid h-8 w-8 place-items-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                title={`Hành động với ${visibleSelectedIds.length} dòng đã chọn`}
                aria-label="Mở menu hành động"
                aria-expanded={bulkMenuOpen}
              >
                <MoreVertical className="h-4 w-4" strokeWidth={2.25} />
              </button>
              {bulkMenuOpen && (
                <div className="absolute right-0 top-full mt-1 z-30 min-w-[220px] rounded-lg border bg-card shadow-lg overflow-hidden animate-fade-up">
                  <button
                    onClick={() => {
                      setBulkMenuOpen(false);
                      handleDeleteVisibleSelected();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 shrink-0" />
                    Xoá {visibleSelectedIds.length} dòng đã chọn
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile card list — only on < md */}
      <div className="md:hidden space-y-3 mb-4">
        {scanning && (
          <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground text-sm">
            <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
            <span>Đang quét giá từ các NCC...</span>
          </div>
        )}
        {!scanning && visibleLines.map((l, i) => {
          if (!l.match) return null;
          const allocKey = `alloc:${l.id}`;
          const revealed = (scanProgress / 100) * total > i;
          const isOOS = outOfStock.has(l.id);
          const isRescanning = rescanningIds.has(l.id);
          const isAllocOpen = isOpen(allocKey);
          const isReplaceOpen = replaceOpenId === l.id;
          const pendingItem = pendingReplace.get(l.id);
          const totalStock = l.match.suppliers.reduce((s, x) => s + x.stock, 0);
          const stockStatus: "enough" | "partial" | "missing" = isOOS
            ? "missing"
            : totalStock >= l.qty
              ? "enough"
              : "partial";
          return (
            <QuoteMobileCard
              key={l.id}
              line={l}
              stt={i + 1}
              revealed={revealed}
              isOOS={isOOS}
              isRescanning={isRescanning}
              isAllocOpen={isAllocOpen}
              isReplaceOpen={isReplaceOpen}
              pendingItem={pendingItem}
              stockStatus={stockStatus}
              totalStock={totalStock}
              updateLine={updateLine}
              onToggleAlloc={() => toggle(allocKey)}
              onToggleReplace={() => setReplaceOpenId(isReplaceOpen ? null : l.id)}
              onPreview={(item) => setPreviewItem(item)}
              onPreSelectReplace={(item) => preSelectReplace(l.id, item)}
              onCancelPreSelect={() => cancelPreSelect(l.id)}
              onSelectOption={(supplierName) => {
                updateLine(l.id, { selectedSupplier: supplierName, allocations: undefined });
                toggle(allocKey);
              }}
            />
          );
        })}
      </div>

      {/* Excel grid — desktop only */}
      <div className="hidden md:block excel-grid rounded-lg overflow-hidden shadow-sm border bg-card relative">
        {scanning && <div className="absolute inset-0 scan-line pointer-events-none z-10" />}
        <div className="overflow-x-auto">
          <table className="text-sm min-w-[1200px]">
            <colgroup>
              <col style={{ width: "44px" }} />{/* checkbox */}
              <col style={{ width: "56px" }} />{/* STT */}
              <col style={{ width: "14%" }} />{/* Yêu cầu gốc — hẹp lại, cho text wrap */}
              <col />{/* Sản phẩm đã khớp — flex */}
              <col style={{ width: "70px" }} />{/* Đơn vị */}
              <col style={{ width: "100px" }} />{/* SL yêu cầu */}
              <col style={{ width: "104px" }} />{/* Ngày xuất kho — gọn 20% */}
              <col style={{ width: "120px" }} />{/* Đơn giá */}
              <col style={{ width: "60px" }} />{/* VAT */}
              <col style={{ width: "140px" }} />{/* Thành tiền */}
            </colgroup>
            <thead>
              <tr>
                <th className="text-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-blue-600"
                    aria-label="Chọn tất cả các dòng đang hiển thị"
                    checked={visibleLines.length > 0 && visibleLines.every((l) => l.selected)}
                    onChange={(e) => visibleLines.forEach((l) => updateLine(l.id, { selected: e.target.checked }))}
                  />
                </th>
                <th className="text-center">STT</th>
                <th className="text-left">Yêu cầu gốc</th>
                <th className="text-left">Sản phẩm đã khớp</th>
                <th className="text-center">Đơn vị</th>
                <th className="text-center">Số lượng yêu cầu</th>
                <th className="text-left col-highlight">Ngày xuất kho</th>
                <th className="text-right">Đơn giá</th>
                <th className="text-center">VAT</th>
                <th className="text-right col-highlight">
                  Thành tiền
                  <div className="text-[10px] font-normal text-muted-foreground normal-case">(Đã gồm VAT)</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleLines.map((l, i) => {
                if (!l.match) return null;
                const allocKey = `alloc:${l.id}`;
                const isAllocOpen = isOpen(allocKey);
                const revealed = !scanning || (scanProgress / 100) * total > i;
                const subtotal = lineSubtotal(l);
                const used = l.allocations
                  ? Object.entries(l.allocations).filter(([, v]) => v > 0).length
                  : 1;
                const totalAllocated = l.allocations
                  ? Object.values(l.allocations).reduce((s, n) => s + n, 0)
                  : l.qty;
                const fulfilled = totalAllocated >= l.qty;

                const isOOS = outOfStock.has(l.id);
                const isRescanning = rescanningIds.has(l.id);
                const isReplaceOpen = replaceOpenId === l.id;
                const pendingItem = pendingReplace.get(l.id);
                const altOptions = l.match ? getAlternativeProducts(l.match.sku).slice(0, 6) : [];
                // Tổng stock từ tất cả NCC (để check enough/partial)
                const totalStock = l.match
                  ? l.match.suppliers.reduce((s, x) => s + x.stock, 0)
                  : 0;
                // 3 trạng thái: enough (xanh) | partial (vàng) | missing (đỏ)
                const stockStatus: "enough" | "partial" | "missing" = isOOS
                  ? "missing"
                  : totalStock >= l.qty
                    ? "enough"
                    : "partial";

                return (
                  <React.Fragment key={l.id}>
                    <tr
                      className={cn(
                        // Border-left indicator (chỉ giữ cột màu trái, bỏ background)
                        isOOS && !isRescanning ? "row-unclear" : "row-matched",
                        isAllocOpen && "expanded-row",
                      )}
                    >
                      <td className="text-center">
                        <input
                          type="checkbox"
                          checked={!!l.selected}
                          onChange={(e) => updateLine(l.id, { selected: e.target.checked })}
                          className="h-4 w-4 accent-violet-600"
                          disabled={isRescanning}
                        />
                      </td>
                      <td className="text-center text-muted-foreground font-mono text-xs">{i + 1}</td>
                      <td className="text-sm">
                        <div className="font-medium leading-snug">{l.raw}</div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2.5 min-h-[60px]">
                          <button
                            onClick={() => setPreviewItem(l.match!)}
                            className={cn(
                              "relative h-14 w-14 shrink-0 rounded-md border bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden hover:ring-2 hover:ring-violet-300 transition-all",
                              isRescanning && "ring-2 ring-violet-400 animate-pulse",
                            )}
                            title="Xem ảnh sản phẩm"
                          >
                            <img src={getProductImage(l.match)} alt={l.match.name} className="w-full h-full object-contain p-1" />
                            {isRescanning && (
                              <div className="absolute inset-0 grid place-items-center bg-violet-600/30">
                                <Loader2 className="h-5 w-5 text-white animate-spin" />
                              </div>
                            )}
                          </button>
                          <div className="min-w-0 flex-1 flex flex-col justify-center">
                            <div className="font-medium leading-snug truncate">{l.match.name}</div>
                            <div className="text-[11px] font-mono text-muted-foreground mt-0.5">SKU: {l.match.sku}</div>
                            {isOOS && !isRescanning && pendingItem && (
                              <div className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 rounded-md px-2 py-0.5 self-start">
                                <Check className="h-3 w-3 text-emerald-700 shrink-0" />
                                <span className="truncate max-w-[160px]">Đã chọn: {pendingItem.name}</span>
                                <button
                                  onClick={() => setReplaceOpenId(isReplaceOpen ? null : l.id)}
                                  className="text-emerald-700 hover:underline text-[10px]"
                                  title="Đổi mã khác"
                                >
                                  Đổi
                                </button>
                                <button
                                  onClick={() => cancelPreSelect(l.id)}
                                  className="text-slate-600 hover:underline text-[10px]"
                                  title="Huỷ chọn"
                                >
                                  ✕
                                </button>
                              </div>
                            )}
                          </div>
                          {isOOS && !isRescanning && !pendingItem && (
                            <button
                              onClick={() => setReplaceOpenId(isReplaceOpen ? null : l.id)}
                              className="grid h-8 w-8 place-items-center rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-300 self-center shrink-0 transition-colors"
                              title="Chọn mã thay thế"
                              aria-label="Chọn mã thay thế"
                              aria-expanded={isReplaceOpen}
                            >
                              <ChevronDown className={cn("h-4 w-4 transition-transform", isReplaceOpen && "rotate-180")} />
                            </button>
                          )}
                        </div>
                      </td>
                      {/* Đơn vị */}
                      <td className="text-center">
                        <span className="text-xs text-muted-foreground">{l.unit}</span>
                      </td>
                      {/* Số lượng yêu cầu — stepper + status icon ở góc dưới-phải */}
                      <td className="text-center relative">
                        <div className="inline-flex items-center rounded-md border bg-white overflow-hidden h-7">
                          <button
                            type="button"
                            onClick={() => updateLine(l.id, { qty: Math.max(1, l.qty - 1) })}
                            disabled={isRescanning}
                            aria-label="Giảm"
                            className="grid h-7 w-6 place-items-center text-muted-foreground hover:bg-muted disabled:opacity-40"
                          >
                            −
                          </button>
                          <input
                            value={l.qty}
                            onChange={(e) =>
                              updateLine(l.id, { qty: Math.max(1, parseInt(e.target.value) || 1) })
                            }
                            disabled={isRescanning}
                            className={cn(
                              "w-10 text-center bg-transparent font-bold text-sm h-7 focus:outline-none tabular-nums",
                              stockStatus === "enough" && "text-emerald-700",
                              stockStatus === "partial" && "text-amber-700",
                              stockStatus === "missing" && "text-amber-700",
                            )}
                          />
                          <button
                            type="button"
                            onClick={() => updateLine(l.id, { qty: l.qty + 1 })}
                            disabled={isRescanning}
                            aria-label="Tăng"
                            className="grid h-7 w-6 place-items-center text-muted-foreground hover:bg-muted disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>
                        {/* Status icon — góc dưới-phải cell */}
                        <span
                          className={cn(
                            "absolute bottom-1 right-1 grid h-4 w-4 place-items-center rounded-full shadow-sm ring-2 ring-white",
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
                          aria-label={
                            stockStatus === "enough"
                              ? "Đủ hàng"
                              : stockStatus === "partial"
                                ? `Chỉ còn ${totalStock} trên ${l.qty}`
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
                      </td>
                      {/* Ngày xuất kho — click bất kỳ trong cell mở options */}
                      <td className="!p-0">
                        {isRescanning ? (
                          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-violet-50 border border-violet-200 animate-pulse">
                            <Loader2 className="h-4 w-4 text-violet-600 animate-spin shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-violet-700">Đang ép giá lại...</div>
                              <div className="text-[10px] text-violet-600">Quét 10 NCC cho mã mới</div>
                            </div>
                          </div>
                        ) : isOOS && pendingItem ? (
                          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-emerald-50 border border-emerald-200">
                            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-emerald-700">Sẵn sàng báo giá lại</div>
                              <div className="text-[10px] text-emerald-600">Chờ batch ở thanh dưới</div>
                            </div>
                          </div>
                        ) : isOOS ? (
                          <div
                            className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md bg-amber-50 border border-amber-200"
                            title="NCC chưa báo giá — chọn mã khác hoặc đợi NCC báo giá"
                          >
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                            <span className="text-xs font-semibold text-amber-800">Tạm hết</span>
                          </div>
                        ) : revealed ? null : (
                          <div className="skeleton h-9 w-full" />
                        )}
                        {!isRescanning && !isOOS && revealed && (() => {
                          const sup = bestSupplier(l);
                          const rank = sup ? optionRank(l, sup.name) : 0;
                          const isBest = rank === 1;
                          const etaTextCls =
                            sup?.eta === 1
                              ? "text-emerald-700"
                              : sup?.eta === 2
                                ? "text-blue-700"
                                : "text-amber-700";
                          return (
                            <button
                              onClick={() => toggle(allocKey)}
                              className={cn(
                                "w-full h-full text-left px-3 py-2 transition-colors group flex items-center justify-between gap-2",
                                isAllocOpen ? "bg-violet-50/60" : "hover:bg-violet-50/50",
                              )}
                              title="Click để xem các lựa chọn khác"
                            >
                              <div className="flex items-baseline gap-1">
                                <Truck className="h-3.5 w-3.5 text-muted-foreground shrink-0 self-center" />
                                <span className={cn("font-bold text-sm tabular-nums", etaTextCls)}>
                                  {sup?.eta ?? "—"}
                                </span>
                                <span className="text-xs text-muted-foreground font-medium">ngày</span>
                              </div>
                              <ChevronDown
                                className={cn(
                                  "h-4 w-4 text-muted-foreground/60 shrink-0 transition-all group-hover:text-violet-600",
                                  isAllocOpen && "rotate-180 text-violet-600",
                                )}
                              />
                            </button>
                          );
                        })()}
                      </td>
                      {/* Đơn giá */}
                      <td className="text-right">
                        {isRescanning ? (
                          <div className="skeleton h-5 w-20 ml-auto" />
                        ) : isOOS ? (
                          <span className="text-rose-700 font-semibold text-xs">—</span>
                        ) : revealed ? (
                          <span className="font-semibold tabular-nums">{formatVND(bestSupplier(l)?.price ?? l.match.unitPrice)}</span>
                        ) : (
                          <div className="skeleton h-5 w-20 ml-auto" />
                        )}
                      </td>
                      {/* VAT */}
                      <td className="text-center">
                        {isOOS && !pendingItem ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-muted text-[11px] font-semibold tabular-nums">
                            {l.match.vatPct}%
                          </span>
                        )}
                      </td>
                      {/* Thành tiền */}
                      <td className="text-right">
                        {isRescanning ? (
                          <div className="skeleton h-5 w-20 ml-auto" />
                        ) : isOOS ? (
                          <span className="text-rose-700 font-semibold text-xs">—</span>
                        ) : revealed ? (
                          <span className="font-bold brand-gradient-text tabular-nums animate-fade-up">
                            {formatVND(Math.round(subtotal * (1 + l.match.vatPct / 100)))}
                          </span>
                        ) : (
                          <div className="skeleton h-5 w-20 ml-auto" />
                        )}
                      </td>
                    </tr>

                    {/* Dropdown thay thế mã (chỉ khi OOS) */}
                    {isOOS && isReplaceOpen && !isRescanning && (
                      <tr className="allocation-row">
                        <td colSpan={10}>
                          <ReplacePanel
                            currentSku={l.match.sku}
                            currentPick={pendingItem ?? null}
                            options={altOptions}
                            onPick={(item) => preSelectReplace(l.id, item)}
                            onClose={() => setReplaceOpenId(null)}
                          />
                        </td>
                      </tr>
                    )}

                    {/* Options list (NCC) — anonymized "Option 1, Option 2..." */}
                    {isAllocOpen && !isOOS && !isRescanning && (
                      <tr className="allocation-row">
                        <td colSpan={10} className="!p-0">
                          <OptionThread
                            line={l}
                            onSelect={(supplierName) => {
                              updateLine(l.id, {
                                selectedSupplier: supplierName,
                                allocations: undefined, // bỏ allocations cũ, dùng exclusive supplier
                              });
                              toggle(allocKey);
                            }}
                            onClose={() => toggle(allocKey)}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* Scanning overlay 3-phase */}
      {scanning && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-md grid place-items-center z-50 animate-fade-up px-4">
          <div className="bg-card border rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <PhaseIndicator phase={phase} />

            {(phase === "phase1" || phase === "phase2") && (
              <div className="mt-5">
                <div className="flex items-center gap-4">
                  <ScanGauge percent={scanProgress} />
                  <div className="text-left flex-1 min-w-0">
                    <h3 className="text-lg font-bold">
                      {phase === "phase1" ? "Đang kết nối các NCC..." : "Mở rộng phạm vi tìm kiếm..."}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Đã kết nối <strong className="text-foreground">{nccConnected}/{NCC_TOTAL}</strong> NCC.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {phase === "phase1" ? "Mai gọi API từng kho MRO realtime." : "Quét NCC xa hơn để tối ưu giá."}
                    </p>
                  </div>
                </div>
                <ActivityFeed eventLog={eventLog} />
              </div>
            )}

            {phase === "phase1-prompt" && (
              <div className="mt-5 text-center animate-fade-up">
                <div className="grid h-14 w-14 mx-auto place-items-center rounded-full bg-violet-100 text-violet-700 mb-3">
                  <Sparkles className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold">
                  Đã kết nối {NCC_PHASE1}/{NCC_TOTAL} NCC công nghệ và tìm được hàng
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Các <strong className="text-violet-700">{NCC_TOTAL - NCC_PHASE1} NCC</strong> còn lại đang dùng app mobile để
                  kiểm tra hàng. Bạn có muốn Mai liên hệ thêm họ không?
                </p>
                <p className="text-xs text-muted-foreground mt-2 italic">
                  💡 Liên hệ NCC mobile mất thêm ~30s. Mai chạy ngầm – bạn có thể duyệt việc khác.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => setPhase("phase3")}>
                    Bỏ qua, dùng giá hiện có
                  </Button>
                  <Button className="brand-gradient text-white border-0 hover:opacity-90" onClick={() => setPhase("phase2")}>
                    <Loader2 className="h-4 w-4" />
                    Có, liên hệ NCC mobile
                  </Button>
                </div>
              </div>
            )}

            {phase === "phase3" && (
              <div className="mt-5 text-center animate-fade-up">
                <div className="grid h-14 w-14 mx-auto place-items-center rounded-full bg-amber-100 text-amber-700 mb-3">
                  <Clock className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold">Còn {NCC_OFFLINE} NCC đang offline</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Đã có báo giá từ <strong className="brand-gradient-text">{NCC_PHASE2_TARGET}/{NCC_TOTAL}</strong> NCC.
                </p>
                <div className="mt-3 rounded-lg border bg-amber-50/40 border-amber-200 px-3 py-2 text-left text-xs space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="font-medium">Vinasteel</span>
                    <span className="text-muted-foreground ml-auto text-[10px]">Bảo trì hệ thống</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="font-medium">Đức Tâm Industries</span>
                    <span className="text-muted-foreground ml-auto text-[10px]">Ngoài giờ làm việc</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Mai sẽ tự cập nhật báo giá trong <strong>~2 giờ</strong> khi 2 NCC online lại.
                  Bạn có thể tiếp tục đặt hàng với báo giá hiện tại.
                </p>
                <Button
                  className="mt-5 w-full brand-gradient text-white border-0 hover:opacity-90"
                  size="lg"
                  onClick={() => setPhase("done")}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Tiếp tục với báo giá hiện tại
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image preview */}
      <ImagePreviewDialog open={!!previewItem} onOpenChange={(v) => !v && setPreviewItem(null)} item={previewItem} />

      {/* Bottom action bar */}
      <div className="sticky bottom-2 sm:bottom-3 mt-4 bg-card/95 backdrop-blur border rounded-xl shadow-lg p-2.5 sm:p-3 flex items-stretch sm:items-center gap-2 sm:gap-3 flex-col sm:flex-row sm:flex-wrap">
        <div className="inline-flex items-center gap-2 px-3 h-10 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
          <Clock className="h-4 w-4 shrink-0" />
          <span>Thời hạn: <strong>48H</strong>{quoteExpiry && <> (Đến {quoteExpiry})</>}</span>
        </div>

        <div className="sm:ml-auto flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="text-right mr-auto sm:mr-0">
            <div className="text-[10px] sm:text-[11px] uppercase text-muted-foreground tracking-wider font-semibold">
              Tổng đơn (gồm VAT)
            </div>
            <div className="text-xl sm:text-2xl font-bold brand-gradient-text tabular-nums">
              {scanning ? "—" : formatVND(grand)}
            </div>
          </div>
          <Button
            variant="outline"
            disabled={scanning}
            onClick={() => exportQuoteCSV(lines)}
            size="default"
            className="sm:h-11 sm:px-5 sm:text-base"
            title="Tải xuống dạng CSV (Excel)"
          >
            <FileDown className="h-4 w-4" />
            CSV
          </Button>
          <Button
            variant="outline"
            disabled={scanning}
            onClick={() => exportQuotePDF(lines)}
            size="default"
            className="sm:h-11 sm:px-5 sm:text-base"
            title="In hoặc lưu PDF"
          >
            <Printer className="h-4 w-4" />
            PDF
          </Button>
          <Button
            variant="outline"
            disabled={scanning}
            onClick={() => toast.success("Đã lưu báo giá vào lịch sử")}
            size="default"
            className="sm:h-11 sm:px-5 sm:text-base"
          >
            <Save className="h-4 w-4" />
            Lưu
          </Button>

          {/* CTA "Báo giá lại N mã" — nổi bật khi user đã pre-select ≥1 alt */}
          {pendingReplace.size > 0 && rescanningIds.size === 0 && (
            <Button
              size="default"
              onClick={batchRescan}
              className={cn(
                "relative sm:h-11 sm:px-5 sm:text-base text-white border-0 font-bold shadow-lg flex-1 sm:flex-initial",
                "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:opacity-90",
                "ring-2 ring-orange-300 ring-offset-1 animate-[border-glow_2.5s_ease-in-out_infinite]",
              )}
              title="Mai sẽ ép giá song song cho các mã đã chọn (~10s)"
            >
              <RefreshCcw className="h-5 w-5" />
              <span>Báo giá lại {pendingReplace.size} mã</span>
              <span className="absolute -top-1.5 -right-1.5 grid h-5 min-w-[20px] place-items-center px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold tabular-nums shadow ring-2 ring-white">
                {pendingReplace.size}
              </span>
            </Button>
          )}

          {(() => {
            // Chỉ block khi OOS rows đang ĐƯỢC CHỌN mà chưa có thay thế.
            // Nếu user bỏ chọn OOS → cho đặt với phần còn lại.
            const selectedOOSUnresolved = lines.filter(
              (l) => l.selected && outOfStock.has(l.id) && !pendingReplace.has(l.id),
            ).length;
            const selectedCount = lines.filter((l) => l.selected).length;
            const blockedByOOS = selectedOOSUnresolved > 0;
            const blockedByEmpty = selectedCount === 0;
            return (
          <Button
            disabled={scanning || rescanningIds.size > 0 || blockedByOOS || blockedByEmpty}
            size="default"
            className="brand-gradient text-white shadow-md font-bold border-0 hover:opacity-90 sm:h-11 sm:px-5 sm:text-base flex-1 sm:flex-initial"
            onClick={() => router.push("/app/checkout")}
            title={
              blockedByEmpty
                ? "Hãy chọn ít nhất 1 dòng để đặt hàng"
                : blockedByOOS
                  ? `Còn ${selectedOOSUnresolved} mã chưa báo giá trong dòng đã chọn — bỏ chọn hoặc chọn mã thay thế`
                  : `Tạo đơn mua hàng (${selectedCount} dòng)`
            }
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="sm:hidden">Tạo đơn</span>
            <span className="hidden sm:inline">Tạo đơn mua hàng</span>
          </Button>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

/** Panel chọn mã thay thế cho dòng "Hết hàng toàn bộ NCC" */
/** Panel options dạng thread, ẩn tên NCC (chỉ hiển thị "Option 1", "Option 2"…). */
function OptionThread({
  line,
  onSelect,
  onClose,
}: {
  line: RequestLine;
  onSelect: (supplierName: string) => void;
  onClose: () => void;
}) {
  if (!line.match) return null;
  // Sort by price ascending — Option 1 = rẻ nhất
  const sortedSuppliers = [...line.match.suppliers].sort((a, b) => a.price - b.price);
  const currentName = bestSupplier(line)?.name;

  return (
    // align với cột "Số lượng tìm thấy"
    // Left pad ≈ checkbox(44) + STT(56) + 20% YC + flex SP + ĐV(70) + SL(100)
    // Right pad ≈ Đơn giá(120) + VAT(60) + Thành tiền(140) = 320px
    <div className="relative py-1 bg-violet-50/20" style={{ paddingLeft: "calc(20% + 270px)", paddingRight: "320px" }}>
      {/* Thread bubble */}
      <div className="rounded-lg border border-violet-200 bg-white shadow-sm overflow-hidden animate-fade-up">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/60 border-b border-violet-100">
          <Sparkles className="h-3 w-3 text-violet-600 shrink-0" />
          <span className="text-[11px] font-semibold text-violet-900">
            {sortedSuppliers.length} option khả dụng
          </span>
          <span className="text-[10px] text-muted-foreground ml-1">— chọn 1 để báo giá theo</span>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="ml-auto grid h-5 w-5 place-items-center rounded text-muted-foreground hover:bg-muted shrink-0"
          >
            <X className="h-3 w-3" />
          </button>
        </div>

        {/* Header columns — visual cue cho ý nghĩa từng cột */}
        <div className="grid grid-cols-[140px_140px_130px_1fr_84px] items-center px-3 py-1.5 bg-violet-50/40 border-b border-violet-100 text-[9px] font-bold uppercase tracking-wider text-violet-700/70">
          <div>Option</div>
          <div>Tồn kho</div>
          <div>Lead time</div>
          <div className="text-right pr-2">Đơn giá</div>
          <div className="text-center"></div>
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
                  "grid grid-cols-[140px_140px_130px_1fr_84px] items-center gap-2 px-3 py-2 cursor-pointer transition-colors",
                  isCurrent ? "bg-violet-50" : "hover:bg-violet-50/60",
                )}
              >
                {/* Cột 1: Option label */}
                <div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded",
                      isBest
                        ? "text-emerald-700 bg-emerald-100"
                        : "text-violet-700 bg-violet-100",
                    )}
                  >
                    {isBest && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                    {isBest ? "Option tốt nhất" : `Option ${idx + 1}`}
                  </span>
                  {isCurrent && !isBest && (
                    <div className="text-[9px] text-violet-600 font-semibold mt-0.5">Đang chọn</div>
                  )}
                </div>

                {/* Cột 2: Tồn kho — format X/qty khi partial */}
                <div className="inline-flex items-center gap-1 text-xs">
                  <Boxes className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  {enough ? (
                    <>
                      <span className="font-bold tabular-nums text-emerald-700">{s.stock}</span>
                      <span className="text-[10px] text-muted-foreground">{line.unit}</span>
                    </>
                  ) : (
                    <>
                      <span className="font-bold tabular-nums">
                        <span className="text-amber-700">{s.stock}</span>
                        <span className="text-muted-foreground/50">/{line.qty}</span>
                      </span>
                      <span className="inline-flex items-center text-[9px] uppercase font-bold text-amber-700 bg-amber-100 px-1 rounded ml-0.5">
                        Chỉ đủ {Math.round((s.stock / line.qty) * 100)}%
                      </span>
                    </>
                  )}
                </div>

                {/* Cột 3: Lead time — làm nổi bật */}
                <div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 h-6 rounded-md border font-bold text-xs tabular-nums",
                      s.eta === 1
                        ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                        : s.eta === 2
                          ? "text-blue-700 bg-blue-50 border-blue-200"
                          : "text-amber-700 bg-amber-50 border-amber-200",
                    )}
                  >
                    <Truck className="h-3 w-3 shrink-0" />
                    {s.eta} {s.eta === 1 ? "ngày" : "ngày"}
                  </span>
                </div>

                {/* Cột 4: Giá — làm nổi bật */}
                <div className="text-right pr-2">
                  <div
                    className={cn(
                      "font-bold tabular-nums leading-tight text-base",
                      isBest ? "brand-gradient-text" : "text-foreground",
                    )}
                  >
                    {formatVND(s.price)}
                  </div>
                  <div className="text-[10px] text-muted-foreground leading-tight">/ {line.unit}</div>
                </div>

                {/* Cột 5: Action */}
                <div className="text-center">
                  {isCurrent ? (
                    <span className="inline-flex items-center justify-center gap-1 px-2 h-7 rounded-md bg-violet-600 text-white text-[11px] font-bold w-full">
                      <Check className="h-3 w-3" />
                      Đã chọn
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center gap-1 px-2 h-7 rounded-md border border-violet-300 text-violet-700 bg-white text-[11px] font-semibold hover:bg-violet-50 w-full">
                      Chọn
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function ReplacePanel({
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
    <div className="ml-14 my-2 max-w-5xl border-l-4 border-rose-400 bg-rose-50/40 rounded-r-lg shadow-sm py-3 px-3 animate-fade-up">
      <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Repeat className="h-4 w-4 text-rose-700" />
          <h4 className="text-xs font-bold uppercase tracking-wide text-rose-900">
            Chọn mã thay thế{" "}
            <span className="text-muted-foreground font-medium normal-case ml-1">
              ({options.length} mã tương đương)
            </span>
          </h4>
          <span className="text-[10px] text-muted-foreground italic">
            · Chọn xong bấm <strong>"Báo giá lại N mã"</strong> ở thanh dưới để ép giá đồng loạt
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          Đóng
        </button>
      </div>

      {options.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-6">
          Không có mã thay thế tương đương trong catalog.
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
                  "group text-left flex items-center gap-3 p-3 transition-colors relative",
                  picked
                    ? "bg-violet-50 hover:bg-violet-100/60"
                    : "hover:bg-rose-50/50",
                )}
                title={picked ? "Đã chọn mã này" : `Chọn ${opt.name}`}
              >
                {picked && (
                  <span
                    className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500"
                    aria-hidden
                  />
                )}
                <div className="relative w-14 h-14 shrink-0 rounded-md border bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
                  <img src={getProductImage(opt)} alt={opt.name} className="w-full h-full object-contain p-1" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground tracking-wider">
                      {opt.brand}
                    </span>
                    <span className="font-semibold text-sm leading-snug truncate">{opt.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1 flex-wrap">
                    <span className="font-mono">SKU: {opt.sku}</span>
                    <span className="inline-flex items-center gap-0.5">
                      <Truck className="h-3 w-3" />
                      Giao {opt.leadTimeDays}d
                    </span>
                    <span className="inline-flex items-center gap-0.5">
                      <Boxes className="h-3 w-3" />
                      Tồn {totalStock}
                    </span>
                    <span className="text-[10px] italic">
                      Thay <span className="font-mono text-foreground/60">{currentSku}</span>
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-bold text-base brand-gradient-text tabular-nums leading-none">
                    {formatVND(opt.unitPrice)}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">/ {opt.unit}</div>
                </div>

                <div className="shrink-0">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-3 h-8 rounded-md text-xs font-bold border transition-all",
                      picked
                        ? "bg-violet-600 border-violet-600 text-white shadow"
                        : "border-rose-300 text-rose-700 bg-rose-50 group-hover:bg-rose-600 group-hover:border-rose-600 group-hover:text-white",
                    )}
                  >
                    {picked ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Đã chọn
                      </>
                    ) : (
                      <>
                        <RefreshCcw className="h-3.5 w-3.5" /> Chọn mã này
                      </>
                    )}
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

type FeedEvent = { kind: "ncc-call" | "ncc-done" | "sku-locked" | "info"; text: string; sub?: string; delay: number };

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function generatePhase1Events(matched: ReturnType<typeof useRequest>["lines"]): FeedEvent[] {
  const ncc = [
    "MRO Smart V2", "Bosch VN", "Stanley VN", "Makita VN", "Hải Dương Tools",
    "Kho SG 01", "Đông Á Tools", "Asaki VN", "Đại lý SKF", "Total VN",
  ];
  const seq: FeedEvent[] = [];
  seq.push({ delay: 0, kind: "info", text: "Khởi động engine ép giá realtime", sub: "Phiên #123" });
  seq.push({ delay: 500, kind: "info", text: "Quét 10 NCC trong mạng lưới MRO", sub: "Ưu tiên NCC kết nối API" });
  seq.push({ delay: 900, kind: "info", text: "Đang matching mã sản phẩm với catalog", sub: "AI semantic search" });

  let t = 1400;
  let nccCount = 0;
  let skuIdx = 0;
  const PHASE1_DURATION = 12000; // dành 12s cho 5 NCC
  const slot = (PHASE1_DURATION - 1400) / ncc.length;

  ncc.forEach((n, i) => {
    if (i >= 5) return;
    seq.push({ delay: t, kind: "ncc-call", text: `Kết nối API ${n}...`, sub: "Gửi request tồn kho" });
    t += slot * 0.25 + rand(50, 150);
    seq.push({ delay: t, kind: "ncc-done", text: `${n}: kết nối OK`, sub: `Latency ${Math.round(rand(40, 280))}ms` });
    t += slot * 0.18;
    const replyN = 4 + Math.floor(rand(2, 14));
    seq.push({ delay: t, kind: "ncc-done", text: `${n}: đã báo giá ${replyN} mã`, sub: `Trong ${rand(0.4, 1.2).toFixed(1)}s` });
    t += slot * 0.18;

    // chèn sku-locked event
    if (matched[skuIdx]?.match) {
      const m = matched[skuIdx].match!;
      seq.push({
        delay: t,
        kind: "sku-locked",
        text: `Matched: ${m.name}`,
        sub: `→ ${n} · ${formatVND(m.suppliers[0].price)}`,
      });
      skuIdx++;
      t += slot * 0.15;
    }

    nccCount++;
    if (nccCount % 3 === 0 || nccCount === 5) {
      seq.push({
        delay: t,
        kind: "info",
        text: `${nccCount}/10 NCC đã báo giá`,
        sub: nccCount === 5 ? "Hoàn tất giai đoạn 1" : "Đang tiếp tục quét...",
      });
      t += slot * 0.2;
    }
    t += slot * 0.04;
  });

  // 2 events cuối: chuẩn bị hoàn tất + tổng kết
  seq.push({ delay: 11000, kind: "info", text: "Chuẩn bị hoàn tất giai đoạn 1...", sub: "Đang tổng hợp báo giá" });
  seq.push({ delay: 12000, kind: "ncc-done", text: "✓ Hoàn tất giai đoạn 1", sub: "5/10 NCC đã báo giá thành công" });

  return seq;
}

function generatePhase2Events(matched: ReturnType<typeof useRequest>["lines"]): FeedEvent[] {
  const mobileNcc = [
    "Vinasteel Mobile", "An Phú Tools", "Đại lý Total HCM", "Kho HN 02", "Đại lý Bosch Đà Nẵng",
    "MRO Đà Nẵng", "Phú Yên Hardware", "TP Mining Tools", "Kho Long An", "Đại lý NSK",
  ];
  const seq: FeedEvent[] = [];
  seq.push({ delay: 0, kind: "info", text: "Push notification 5 NCC mobile", sub: "Đang chờ phản hồi qua app NCC..." });
  seq.push({ delay: 600, kind: "info", text: "Mai liên hệ realtime qua FCM", sub: "Kênh ưu tiên: Zalo OA + SMS" });

  let t = 1200;
  let nccCount = 5;
  let skuIdx = 4;
  const PHASE2_DURATION = 12000;
  const slot = (PHASE2_DURATION - 1200) / mobileNcc.length;

  mobileNcc.forEach((n, i) => {
    if (i >= 4) return; // 4 NCC reply (5 → 9, còn 1 offline)
    seq.push({ delay: t, kind: "ncc-call", text: `Push notify ${n}...`, sub: "Chờ NCC mở app" });
    t += slot * 0.3 + rand(50, 200);
    const replyN = 3 + Math.floor(rand(2, 10));
    seq.push({
      delay: t,
      kind: "ncc-done",
      text: `${n}: đã báo giá ${replyN} mã`,
      sub: `Mobile reply trong ${rand(0.5, 1.4).toFixed(1)}s`,
    });
    t += slot * 0.18;

    // sku locked với giá tốt hơn
    if (matched[skuIdx]?.match && i % 2 === 0) {
      const m = matched[skuIdx].match!;
      const discount = Math.floor(rand(5, 18));
      seq.push({
        delay: t,
        kind: "sku-locked",
        text: `Cập nhật giá tốt hơn: ${m.name}`,
        sub: `Giảm ${discount}% so với phase 1`,
      });
      skuIdx++;
      t += slot * 0.15;
    }

    // misc events
    if (i === 2) {
      seq.push({ delay: t, kind: "info", text: "Phát hiện 2 mã chưa có NCC tốt", sub: "Mở rộng tìm kiếm..." });
      t += slot * 0.2;
    }

    nccCount++;
    if (nccCount % 4 === 0 || nccCount === 9) {
      seq.push({
        delay: t,
        kind: "info",
        text: `${nccCount}/10 NCC đã báo giá`,
        sub: nccCount === 9 ? "Còn 1 NCC chưa phản hồi" : "",
      });
      t += slot * 0.18;
    }
    t += slot * 0.04;
  });

  // 2 events cuối: chuẩn bị hoàn tất + tổng kết
  seq.push({ delay: 11000, kind: "info", text: "Chuẩn bị hoàn tất giai đoạn 2...", sub: "So sánh giá tốt nhất từ tất cả NCC" });
  seq.push({ delay: 12000, kind: "ncc-done", text: "✓ Hoàn tất giai đoạn 2", sub: "9/10 NCC đã báo giá · 1 NCC offline" });

  return seq;
}

function PhaseIndicator({ phase }: { phase: "phase1" | "phase1-prompt" | "phase2" | "phase3" | "done" }) {
  const phases = [
    { key: "phase1", label: "Kết nối NCC" },
    { key: "phase2", label: "Mở rộng" },
    { key: "phase3", label: "Hoàn tất" },
  ] as const;
  const activeIdx =
    phase === "phase1" || phase === "phase1-prompt" ? 0 : phase === "phase2" ? 1 : 2;
  return (
    <div className="flex items-center gap-1">
      {phases.map((p, i) => {
        const done = i < activeIdx;
        const active = i === activeIdx;
        return (
          <React.Fragment key={p.key}>
            <div className="flex flex-col items-center gap-1 min-w-0">
              <div
                className={cn(
                  "grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold transition-all",
                  done && "bg-emerald-500 text-white",
                  active && "brand-gradient text-white scale-110 shadow",
                  !done && !active && "bg-muted text-muted-foreground",
                )}
              >
                {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={cn("text-[10px] font-medium whitespace-nowrap", active ? "text-foreground" : "text-muted-foreground")}>
                {p.label}
              </span>
            </div>
            {i < phases.length - 1 && (
              <div className={cn("flex-1 h-0.5 mb-4 transition-colors", i < activeIdx ? "bg-emerald-400" : "bg-border")} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function ActivityFeed({ eventLog }: { eventLog: Array<{ kind: "ncc-call" | "ncc-done" | "sku-locked" | "info"; text: string; sub?: string }> }) {
  return (
    <div className="mt-4 border-t pt-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        Hoạt động hệ thống
      </div>
      <ul className="space-y-1.5 min-h-[180px]">
        {eventLog.length === 0 && (
          <li className="text-xs text-muted-foreground italic flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" /> Khởi động...
          </li>
        )}
        {eventLog.map((ev, i) => (
          <li
            key={`${ev.text}-${i}`}
            className={cn(
              "flex items-start gap-2 text-xs animate-fade-up",
              i === 0 ? "opacity-100" : i === 1 ? "opacity-90" : "opacity-60",
            )}
          >
            <EventIcon kind={ev.kind} />
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate text-foreground">{ev.text}</div>
              {ev.sub && <div className="text-[11px] text-muted-foreground truncate">{ev.sub}</div>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EventIcon({ kind }: { kind: "ncc-call" | "ncc-done" | "sku-locked" | "info" }) {
  if (kind === "ncc-call")
    return (
      <div className="grid h-5 w-5 place-items-center rounded-md bg-blue-100 text-blue-700 shrink-0 mt-0.5">
        <Loader2 className="h-3 w-3 animate-spin" />
      </div>
    );
  if (kind === "ncc-done")
    return (
      <div className="grid h-5 w-5 place-items-center rounded-md bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
        <Server className="h-3 w-3" />
      </div>
    );
  if (kind === "sku-locked")
    return (
      <div className="grid h-5 w-5 place-items-center rounded-md bg-violet-100 text-violet-700 shrink-0 mt-0.5">
        <Tag className="h-3 w-3" />
      </div>
    );
  return (
    <div className="grid h-5 w-5 place-items-center rounded-md bg-muted text-muted-foreground shrink-0 mt-0.5">
      <CheckCircle2 className="h-3 w-3" />
    </div>
  );
}

function ScanGauge({ percent }: { percent: number }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const off = c - (percent / 100) * c;
  return (
    <div className="relative inline-grid place-items-center">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} stroke="hsl(220 13% 91%)" strokeWidth="8" fill="none" />
        <circle
          cx="48"
          cy="48"
          r={r}
          stroke="hsl(217 91% 60%)"
          strokeWidth="8"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
          className="transition-all duration-150"
        />
      </svg>
      <span className="absolute font-bold text-base text-blue-700 tabular-nums">{percent.toFixed(1)}%</span>
    </div>
  );
}
