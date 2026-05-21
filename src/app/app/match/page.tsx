"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Zap,
  FileText,
  Search,
  FileSpreadsheet,
  ChevronDown,
  Pencil,
  Trash2,
  X,
  Loader2,
  Link2,
  MoreVertical,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRequest } from "@/components/request-provider";
import { Button } from "@/components/ui/button";
import { MaiChatPanel } from "@/components/mai-chat-panel";
import { SuggestionPicker } from "@/components/suggestion-picker";
import { ProductListPanel } from "@/components/product-list-panel";
import { SpecPickerPanel } from "@/components/spec-picker-panel";
import { AddItemDialog } from "@/components/add-item-dialog";
import { RowActionsMenu } from "@/components/row-actions-menu";
import { ImagePreviewDialog } from "@/components/image-preview-dialog";
import { getProductImage } from "@/data/catalog";
import {
  getRelatedProducts,
  findClosestByText,
  type CatalogItem,
} from "@/data/catalog";
import { cn, formatVND } from "@/lib/utils";
import { toast } from "sonner";
import { MatchMobileCard } from "./match-mobile-card";

export default function MatchPage() {
  const router = useRouter();
  const { lines, hasRequest, sourceLabel, updateLine, loadSample, addCatalogLine, removeLine, duplicateLine } = useRequest();
  /** Filter state — 3 trạng thái gọn: all / matched / pending (non-matched) */
  const [statusFilter, setStatusFilter] = React.useState<"all" | "matched" | "pending">("all");
  /** Edit raw text inline */
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingText, setEditingText] = React.useState("");
  const [picker, setPicker] = React.useState<{ id: string; raw: string; suggestions: CatalogItem[] } | null>(null);
  /** Mai general chat (icon ⚡) — lineId link row, matched để chọn bộ câu hỏi gợi ý */
  const [chat, setChat] = React.useState<{ open: boolean; context?: string; lineId?: string; matched?: boolean }>({ open: false });
  /** Mai SKU finder (cho dòng unclear "Hỏi Mai ngay") */
  const [skuFinder, setSkuFinder] = React.useState<{ lineId: string; raw: string; items: CatalogItem[] } | null>(null);
  /** Spec picker (cho dòng missing "Bổ sung thông số") */
  const [specPicker, setSpecPicker] = React.useState<{ lineId: string; raw: string } | null>(null);
  /** Add item dialog */
  const [addOpen, setAddOpen] = React.useState(false);
  /** Image preview dialog */
  const [previewItem, setPreviewItem] = React.useState<CatalogItem | null>(null);
  /** Dòng đang được re-match (skeleton loading sau khi user sửa raw) */
  const [rematchingIds, setRematchingIds] = React.useState<Set<string>>(new Set());

  /** Đóng tất cả side panel/modal khác trước khi mở 1 panel mới (mutual exclusion). */
  const closeOtherPanels = () => {
    setChat({ open: false });
    setSkuFinder(null);
    setSpecPicker(null);
    setPicker(null);
    setAddOpen(false);
  };
  const openChat = (context: string, lineId?: string, matched?: boolean) => {
    closeOtherPanels();
    setChat({ open: true, context, lineId, matched });
  };
  const openSkuFinder = (lineId: string, raw: string) => {
    closeOtherPanels();
    setSkuFinder({ lineId, raw, items: findClosestByText(raw, 5) });
  };
  const openSpecPicker = (lineId: string, raw: string) => {
    closeOtherPanels();
    setSpecPicker({ lineId, raw });
  };
  const openPicker = (id: string, raw: string, suggestions: CatalogItem[]) => {
    closeOtherPanels();
    setPicker({ id, raw, suggestions });
  };
  const openAdd = () => {
    closeOtherPanels();
    setAddOpen(true);
  };
  const completeMatch = (lineId: string, item: CatalogItem) => {
    updateLine(lineId, {
      status: "matched",
      match: item,
      selectedSku: item.sku,
      selectedSupplier: item.suppliers[0]?.name,
      reason: undefined,
      suggestions: undefined,
      allocations: undefined,
    });
    toast.success("Đã chốt mã sản phẩm", { description: item.name });
    setSkuFinder(null);
    setSpecPicker(null);
  };

  /** Sau khi user sửa "Yêu cầu gốc" + Enter → giả lập AI re-match dòng đó.
   *  Skeleton 700ms, sau đó:
   *   - Top match có ≥2 token chung → status "matched"
   *   - Có 2-5 candidates → status "choose" với suggestions
   *   - Else → status "unclear" */
  const reMatchLine = (lineId: string, newRaw: string) => {
    const trimmed = newRaw.trim();
    if (!trimmed) return;
    updateLine(lineId, { raw: trimmed });
    setRematchingIds((prev) => new Set(prev).add(lineId));
    setTimeout(() => {
      const candidates = findClosestByText(trimmed, 5);
      const tokens = trimmed.toLowerCase().split(/\s+/).filter((t) => t.length > 1);
      const top = candidates[0];
      const topScore = top
        ? tokens.reduce(
            (s, t) =>
              s + (`${top.name} ${top.brand} ${top.category} ${top.sku}`.toLowerCase().includes(t) ? 1 : 0),
            0,
          )
        : 0;
      if (top && topScore >= 2) {
        updateLine(lineId, {
          status: "matched",
          match: top,
          selectedSku: top.sku,
          selectedSupplier: top.suppliers[0]?.name,
          suggestions: undefined,
          reason: undefined,
          allocations: undefined,
        });
        toast.success("Mai đã match mã mới", { description: top.name });
      } else if (candidates.length >= 2) {
        updateLine(lineId, {
          status: "choose",
          match: undefined,
          suggestions: candidates,
          selectedSku: undefined,
          selectedSupplier: undefined,
          reason: undefined,
          allocations: undefined,
        });
        toast.message(`Mai tìm được ${candidates.length} mã đề xuất`);
      } else {
        updateLine(lineId, {
          status: "unclear",
          match: undefined,
          suggestions: undefined,
          selectedSku: undefined,
          selectedSupplier: undefined,
          reason: "Không rõ tên vật tư. Vui lòng chat để xác nhận.",
          allocations: undefined,
        });
        toast.warning("Mai không tự match được — bạn nhờ Mai chat hỗ trợ nhé");
      }
      setRematchingIds((prev) => {
        const next = new Set(prev);
        next.delete(lineId);
        return next;
      });
    }, 700);
  };
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

  /** Mở rộng panel theo dòng — keys: "related:<id>" | "alt:<id>". Mutually exclusive per row. */
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const isOpen = (key: string) => expanded.has(key);
  const toggleExpand = (key: string) => {
    setExpanded((cur) => {
      const next = new Set(cur);
      if (next.has(key)) {
        next.delete(key);
        return next;
      }
      const lineId = key.split(":")[1];
      ["related", "alt"].forEach((t) => next.delete(`${t}:${lineId}`));
      next.add(key);
      return next;
    });
  };
  React.useEffect(() => {
    if (!hasRequest) loadSample("Upload_Image.png");
  }, [hasRequest, loadSample]);

  // Lọc lines theo filter (chỉ ảnh hưởng hiển thị, không ảnh hưởng selected/total)
  const visibleLines = lines.filter((l) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "matched") return l.status === "matched";
    return l.status !== "matched"; // pending
  });

  // Index lookup O(1) cho cột STT (tránh N² findIndex trong render row)
  const lineIndexMap = React.useMemo(() => {
    const m = new Map<string, number>();
    lines.forEach((l, i) => m.set(l.id, i));
    return m;
  }, [lines]);

  // Header checkbox state — phản ánh đúng những row đang nhìn thấy (tôn trọng filter)
  const allVisibleSelected = visibleLines.length > 0 && visibleLines.every((l) => l.selected);
  const toggleAllVisible = (checked: boolean) => {
    visibleLines.forEach((l) => updateLine(l.id, { selected: checked }));
  };

  // Đếm theo status: chỉ 3 nhóm (all / matched / pending)
  const matchedCount = lines.filter((l) => l.status === "matched").length;
  const countByStatus = {
    all: lines.length,
    matched: matchedCount,
    pending: lines.length - matchedCount,
  };

  // Chỉ tính các dòng đang được CHỌN (checkbox tick) — bỏ chọn = bỏ qua khỏi báo giá.
  const selected = lines.filter((l) => l.selected);
  const selectedIds = selected.map((l) => l.id);
  const isBulkMode = selected.length >= 2;
  const matched = selected.filter((l) => l.status === "matched").length;
  const pending = selected.filter((l) => l.status !== "matched").length;
  const total = selected.length;
  const allMatched = pending === 0 && total > 0;

  /** Xoá hàng loạt các dòng đang chọn — confirm qua toast. */
  const handleDeleteSelected = () => {
    const ids = selectedIds;
    if (ids.length === 0) return;
    toast(`Chắc chắn xoá ${ids.length} dòng đã chọn?`, {
      action: {
        label: "Xoá",
        onClick: () => {
          ids.forEach((id) => removeLine(id));
          toast.success(`Đã xoá ${ids.length} dòng`);
        },
      },
      cancel: { label: "Huỷ", onClick: () => {} },
    });
  };

  /** Có panel Mai bên phải đang mở (chat / sku-finder / spec-picker) */
  const panelOpen = chat.open || !!skuFinder || !!specPicker;
  /** Dòng đang được chat/tương tác — dùng để highlight row + làm mờ các dòng khác */
  const activeChatLineId = chat.lineId ?? skuFinder?.lineId ?? specPicker?.lineId ?? null;

  /** ESC để đóng mọi panel Mai, quay lại danh sách như ban đầu */
  React.useEffect(() => {
    if (!panelOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setChat({ open: false });
        setSkuFinder(null);
        setSpecPicker(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [panelOpen]);

  /** User chọn 1 mã Mai gợi ý trong khung chat → cập nhật ngay dòng trên bảng. */
  const pickFromChat = (item: CatalogItem) => {
    if (!chat.lineId) return;
    updateLine(chat.lineId, {
      status: "matched",
      match: item,
      selectedSku: item.sku,
      selectedSupplier: item.suppliers[0]?.name,
      reason: undefined,
      suggestions: undefined,
      allocations: undefined,
    });
    toast.success("Đã cập nhật mã trên bảng", { description: item.name });
  };

  const handleProceed = () => {
    if (total === 0) {
      toast.error("Hãy chọn ít nhất 1 dòng để báo giá.");
      return;
    }
    if (!allMatched) {
      toast.error(`Còn ${pending} dòng chưa chốt mã trong các dòng đã chọn. Vui lòng xử lý hoặc bỏ chọn.`);
      return;
    }
    router.push("/app/quote");
  };

  return (
    <div className={cn("px-3 sm:px-4 md:px-8 py-4 sm:py-6 max-w-[1600px] mx-auto", panelOpen && "lg:pr-[416px]")}>
      {/* Title row — title trái, bulk delete + filter segmented control bên phải */}
      <div className="flex items-start justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <h1 className="text-base sm:text-lg font-bold tracking-tight">
            Yêu cầu báo giá <span className="font-mono brand-gradient-text">#123</span>
          </h1>
          {sourceLabel && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md max-w-full truncate">
              <FileSpreadsheet className="h-3 w-3 shrink-0" />
              <span className="truncate">Từ file: <strong className="font-medium">{sourceLabel}</strong></span>
            </span>
          )}
        </div>

        {/* Right cluster: filter segmented control + bulk action kebab */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-200/80 border border-slate-300">
            {[
              { k: "all" as const, label: "Tất cả", count: countByStatus.all },
              { k: "matched" as const, label: "Đã tìm", count: countByStatus.matched },
              { k: "pending" as const, label: "Chưa tìm được", count: countByStatus.pending },
            ].map((f) => {
              const active = statusFilter === f.k;
              return (
                <button
                  key={f.k}
                  onClick={() => setStatusFilter(f.k)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 h-7 rounded-md text-xs font-semibold transition-all",
                    active
                      ? "bg-white text-violet-700 shadow-sm"
                      : "text-slate-700 hover:bg-white/70",
                  )}
                >
                  {f.label}
                  <span
                    className={cn(
                      "text-[10px] tabular-nums px-1.5 rounded font-bold",
                      active ? "bg-violet-100 text-violet-700" : "bg-white text-slate-700",
                    )}
                  >
                    {f.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bulk action kebab — chỉ hiện khi có dòng được chọn */}
          {selected.length > 0 && (
            <div ref={bulkMenuRef} className="relative">
              <button
                onClick={() => setBulkMenuOpen((v) => !v)}
                className="grid h-8 w-8 place-items-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                title={`Hành động với ${selected.length} dòng đã chọn`}
                aria-label="Mở menu hành động"
                aria-expanded={bulkMenuOpen}
              >
                <MoreVertical className="h-4 w-4" strokeWidth={2.25} />
              </button>
              {bulkMenuOpen && (
                <div className="absolute right-0 top-full mt-1 z-30 min-w-[200px] rounded-lg border bg-card shadow-lg overflow-hidden animate-fade-up">
                  <button
                    onClick={() => {
                      setBulkMenuOpen(false);
                      handleDeleteSelected();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 shrink-0" />
                    Xoá {selected.length} dòng đã chọn
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile card list — only on < md */}
      <div className="md:hidden space-y-3 mb-4">
        {visibleLines.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Chưa có dòng yêu cầu nào.{" "}
            <button onClick={() => loadSample()} className="text-blue-600 underline">
              Tải mẫu
            </button>
          </div>
        )}
        {visibleLines.map((l) => {
          const relKey = `related:${l.id}`;
          const isEditing = editingId === l.id;
          return (
            <MatchMobileCard
              key={l.id}
              line={l}
              stt={(lineIndexMap.get(l.id) ?? 0) + 1}
              isEditing={isEditing}
              editingText={isEditing ? editingText : l.raw}
              isRematching={rematchingIds.has(l.id)}
              activeChatLineId={activeChatLineId}
              isRelatedOpen={isOpen(relKey)}
              onEditStart={() => { setEditingId(l.id); setEditingText(l.raw); }}
              onEditChange={(v) => setEditingText(v)}
              onEditCommit={() => {
                const newRaw = editingText.trim() || l.raw;
                setEditingId(null);
                if (newRaw !== l.raw) reMatchLine(l.id, newRaw);
              }}
              onEditCancel={() => setEditingId(null)}
              onChoose={() => l.suggestions && openPicker(l.id, l.raw, l.suggestions)}
              onAskMaiUnclear={() => openSkuFinder(l.id, l.raw)}
              onFillSpecsMissing={() => openSpecPicker(l.id, l.raw)}
              onPreview={(item) => setPreviewItem(item)}
              onChat={() => openChat(l.raw, l.id, l.status === "matched")}
              onRemove={() => { removeLine(l.id); toast.success("Đã xoá dòng yêu cầu"); }}
              onToggleRelated={() => toggleExpand(relKey)}
              updateLine={updateLine}
              addCatalogLine={addCatalogLine}
            />
          );
        })}
        {visibleLines.length > 0 && (
          <button
            onClick={() => openAdd()}
            className="w-full flex items-center justify-center gap-2 py-3.5 text-base font-bold text-violet-700 bg-violet-50/60 hover:bg-violet-100 border-2 border-dashed border-violet-300 rounded-xl transition-colors tracking-wide"
          >
            <Plus className="h-5 w-5" strokeWidth={2.5} />
            Thêm vật tư
          </button>
        )}
      </div>

      {/* Excel grid — desktop only */}
      <div className={cn("hidden md:block excel-grid rounded-lg overflow-hidden shadow-sm border bg-card", panelOpen && "chat-open")}>
        <div className="overflow-x-auto">
          <table className={cn("text-sm table-fixed w-full", panelOpen ? "min-w-[990px]" : "min-w-[1080px]")}>
            <colgroup>
              <col style={{ width: "40px" }} />{/* checkbox */}
              <col style={{ width: "44px" }} />{/* STT */}
              {/* Yêu cầu gốc — px cố định, chat mở thì hẹp lại (text tự wrap) */}
              <col style={{ width: panelOpen ? "130px" : "168px" }} />
              <col />{/* Sản phẩm khớp — co giãn lấp phần còn lại */}
              <col style={{ width: "58px" }} />{/* Đơn vị */}
              {/* SL yêu cầu — chat mở thì nhỏ lại để lộ cột Thao tác */}
              <col style={{ width: panelOpen ? "100px" : "116px" }} />
              <col style={{ width: "104px" }} />{/* Đơn giá tham khảo */}
              <col style={{ width: "52px" }} />{/* VAT */}
              {/* Thành tiền — chat mở thì nhỏ lại */}
              <col style={{ width: panelOpen ? "116px" : "132px" }} />
              <col style={{ width: "76px" }} />{/* Thao tác */}
            </colgroup>
            <thead>
              <tr>
                <th className="text-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-blue-600"
                    aria-label="Chọn tất cả các dòng đang hiển thị"
                    checked={allVisibleSelected}
                    onChange={(e) => toggleAllVisible(e.target.checked)}
                  />
                </th>
                <th className="text-center">STT</th>
                <th className="text-left">Yêu cầu gốc</th>
                <th className="text-left">
                  <div className="whitespace-nowrap">Sản phẩm khớp</div>
                  <div className="text-[9px] font-normal text-muted-foreground normal-case tracking-normal mt-0.5">(hệ thống)</div>
                </th>
                <th className="text-center whitespace-nowrap">Đơn vị</th>
                <th className="text-center">
                  <div className="whitespace-nowrap">Số lượng</div>
                  <div className="text-[9px] font-normal text-muted-foreground normal-case tracking-normal mt-0.5">yêu cầu</div>
                </th>
                <th className="text-right">
                  <div className="whitespace-nowrap">Đơn giá</div>
                  <div className="text-[9px] font-normal text-muted-foreground normal-case tracking-normal mt-0.5">tham khảo</div>
                </th>
                <th className="text-center">VAT</th>
                <th className="text-right">
                  <div className="whitespace-nowrap">Thành tiền</div>
                  <div className="text-[9px] font-normal text-muted-foreground normal-case tracking-normal mt-0.5">(gồm VAT)</div>
                </th>
                <th className="text-center whitespace-nowrap thao-tac-col">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {visibleLines.map((l) => {
                const relKey = `related:${l.id}`;
                const relatedItems = l.match ? getRelatedProducts(l.match.sku) : [];
                const anyOpen = isOpen(relKey);
                const isEditing = editingId === l.id;
                return (
                  <React.Fragment key={l.id}>
                    <tr
                      className={cn(
                        "align-top transition-all",
                        // Border-left indicator: giữ pattern cũ (matched/choose/unclear/missing)
                        l.status === "matched" && "row-matched",
                        l.status === "choose" && "row-choose",
                        l.status === "unclear" && "row-unclear",
                        l.status === "missing" && "row-missing",
                        // Background 2-tone: matched = xanh lá nhạt, mọi non-matched = vàng nhạt
                        l.status === "matched" ? "row-bg-matched" : "row-bg-pending",
                        anyOpen && "expanded-row",
                        // Link bảng ↔ khung chat Mai: highlight dòng đang chat, làm mờ dòng khác
                        activeChatLineId === l.id && "row-chat-active",
                        activeChatLineId !== null && activeChatLineId !== l.id && "row-chat-dimmed",
                      )}
                    >
                      <td className="text-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-violet-600"
                          checked={!!l.selected}
                          onChange={(e) => updateLine(l.id, { selected: e.target.checked })}
                        />
                      </td>
                      <td className="text-center text-muted-foreground font-mono text-xs">
                        {(lineIndexMap.get(l.id) ?? 0) + 1}
                      </td>
                      <td>
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <Input
                              autoFocus
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const newRaw = editingText.trim() || l.raw;
                                  setEditingId(null);
                                  if (newRaw !== l.raw) {
                                    reMatchLine(l.id, newRaw);
                                  }
                                }
                                if (e.key === "Escape") setEditingId(null);
                              }}
                              className="h-8"
                              placeholder="Nhập mô tả vật tư rồi Enter để Mai match lại..."
                            />
                            <button
                              onClick={() => {
                                const newRaw = editingText.trim() || l.raw;
                                setEditingId(null);
                                if (newRaw !== l.raw) reMatchLine(l.id, newRaw);
                              }}
                              title="Lưu & match lại"
                              className="grid h-8 w-8 place-items-center rounded-md text-emerald-600 hover:bg-emerald-50"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              title="Huỷ (Esc)"
                              className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingId(l.id);
                              setEditingText(l.raw);
                            }}
                            title="Click để sửa, Enter để Mai match lại"
                            className="group w-full text-left -mx-1.5 -my-1 px-1.5 py-1 rounded hover:bg-violet-50/60 transition-colors"
                          >
                            <span className="font-medium leading-snug">{l.raw}</span>
                            <Pencil className="inline h-3 w-3 ml-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        )}
                      </td>
                      <td>
                        {rematchingIds.has(l.id) ? (
                          <div className="flex items-center gap-2 py-1 animate-fade-up">
                            <Loader2 className="h-4 w-4 text-violet-600 animate-spin shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-violet-700">
                                Mai đang match lại...
                              </div>
                              <div className="skeleton h-3 w-3/4 mt-1" />
                            </div>
                          </div>
                        ) : (
                          <RowMatch
                            line={l}
                            onChoose={() =>
                              l.suggestions && openPicker(l.id, l.raw, l.suggestions)
                            }
                            onAskMaiUnclear={() => openSkuFinder(l.id, l.raw)}
                            onFillSpecsMissing={() => openSpecPicker(l.id, l.raw)}
                            onPreview={(item) => setPreviewItem(item)}
                            rightSlot={
                              l.status === "matched" && l.match && relatedItems.length > 0 ? (
                                <RelatedToggle
                                  active={isOpen(relKey)}
                                  onClick={() => toggleExpand(relKey)}
                                  count={relatedItems.length}
                                />
                              ) : null
                            }
                          />
                        )}
                      </td>
                      {/* Đơn vị */}
                      <td className="text-center">
                        <span className="text-xs text-muted-foreground">{l.unit}</span>
                      </td>
                      {/* Số lượng yêu cầu — stepper */}
                      <td className="text-center">
                        <div className="inline-flex items-center rounded-md border bg-white overflow-hidden h-8 max-w-full">
                          <button
                            onClick={() => updateLine(l.id, { qty: Math.max(1, l.qty - 1) })}
                            className="grid h-8 w-6 place-items-center hover:bg-muted text-muted-foreground text-base shrink-0"
                            aria-label="Giảm số lượng"
                            type="button"
                          >
                            −
                          </button>
                          <input
                            value={l.qty}
                            onChange={(e) => updateLine(l.id, { qty: Math.max(1, parseInt(e.target.value) || 1) })}
                            className="w-10 min-w-0 text-center bg-transparent font-bold text-sm h-8 focus:outline-none tabular-nums"
                          />
                          <button
                            onClick={() => updateLine(l.id, { qty: l.qty + 1 })}
                            className="grid h-8 w-6 place-items-center hover:bg-muted text-muted-foreground text-base shrink-0"
                            aria-label="Tăng số lượng"
                            type="button"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      {/* Đơn giá tham khảo */}
                      <td className="text-right">
                        {l.match ? (
                          <span className="font-semibold tabular-nums text-foreground">{formatVND(l.match.unitPrice)}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      {/* VAT */}
                      <td className="text-center">
                        {l.match ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-muted text-[11px] font-semibold tabular-nums">
                            {l.match.vatPct}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      {/* Thành tiền (SL × Đơn giá × (1 + VAT)) */}
                      <td className="text-right">
                        {l.match ? (
                          <span className="font-bold brand-gradient-text tabular-nums">
                            {formatVND(Math.round(l.qty * l.match.unitPrice * (1 + l.match.vatPct / 100)))}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="text-center thao-tac-col">
                        <div className="flex items-center justify-center gap-0.5">
                          <button
                            onClick={() => openChat(l.raw, l.id, l.status === "matched")}
                            className="grid h-7 w-7 place-items-center rounded-md text-violet-600 hover:bg-violet-100"
                            title="Hỏi Mai về dòng này"
                          >
                            <Zap className="h-4 w-4" />
                          </button>
                          <RowActionsMenu
                            items={[
                              {
                                icon: Pencil,
                                label: "Sửa mô tả",
                                onClick: () => {
                                  setEditingId(l.id);
                                  setEditingText(l.raw);
                                },
                              },
                              {
                                icon: Trash2,
                                label: "Xoá dòng",
                                destructive: true,
                                onClick: () => {
                                  removeLine(l.id);
                                  toast.success("Đã xoá dòng yêu cầu");
                                },
                              },
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                    {l.match && isOpen(relKey) && (
                      <tr className="allocation-row">
                        <td colSpan={10} className="!p-0">
                          <RelatedThread
                            parentName={l.match.name}
                            items={relatedItems}
                            onPick={(item) => {
                              addCatalogLine(item, 1, l.id);
                              toast.success("Đã thêm ngay dưới dòng này", { description: item.name });
                            }}
                            onPreview={(item) => setPreviewItem(item)}
                            onClose={() => toggleExpand(relKey)}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {lines.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-16 text-muted-foreground">
                    Chưa có dòng yêu cầu nào.{" "}
                    <button onClick={() => loadSample()} className="text-blue-600 underline">
                      Tải mẫu
                    </button>
                  </td>
                </tr>
              )}
              {/* Row cuối: nút "+ Thêm vật tư" */}
              {lines.length > 0 && (
                <tr>
                  <td colSpan={10} className="!p-0">
                    <button
                      onClick={() => openAdd()}
                      className="w-full flex items-center justify-center gap-2 py-3.5 text-base font-bold text-violet-700 bg-violet-50/60 hover:bg-violet-100 border-t-2 border-dashed border-violet-300 transition-colors tracking-wide"
                    >
                      <Plus className="h-5 w-5" strokeWidth={2.5} />
                      Thêm vật tư
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="sticky bottom-2 sm:bottom-3 mt-4 bg-card/95 backdrop-blur border rounded-xl shadow-lg p-2.5 sm:p-3 flex items-stretch sm:items-center gap-2 sm:gap-3 flex-col sm:flex-row sm:flex-wrap">
        {total === 0 ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border text-muted-foreground text-sm font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="line-clamp-2">Hãy chọn ít nhất 1 dòng để báo giá</span>
          </div>
        ) : !allMatched ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Còn {pending} dòng chưa chốt mã <span className="hidden sm:inline">(trong số đã chọn)</span></span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Sẵn sàng! Đã chốt {matched}/{total} mã.
          </div>
        )}
        <div className="sm:ml-auto flex items-center gap-2 flex-wrap">
          <Button variant="outline" onClick={() => router.push("/app/quote")} className="flex-1 sm:flex-initial">
            <FileText className="h-4 w-4" />
            <span className="sm:hidden">Báo giá ({matched})</span>
            <span className="hidden sm:inline">Gửi báo giá {matched} dòng đã chốt</span>
          </Button>
          {pending > 0 && (
            <Button
              variant="outline"
              className="border-violet-300 text-violet-700 hover:bg-violet-50 flex-1 sm:flex-initial"
              onClick={() => openChat(`Xử lý ${pending} dòng chưa chốt`)}
            >
              <Zap className="h-4 w-4" />
              <span className="sm:hidden">Hỏi Mai ({pending})</span>
              <span className="hidden sm:inline">Hỏi Mai xử lý {pending} dòng</span>
            </Button>
          )}
          <Button onClick={handleProceed} className="brand-gradient text-white hover:opacity-90 border-0 flex-1 sm:flex-initial">
            Tiếp tục → Báo giá
          </Button>
        </div>
      </div>

      {/* Mai chat — generic (icon ⚡) — pick gợi ý sẽ cập nhật dòng trên bảng */}
      <MaiChatPanel
        open={chat.open && !skuFinder}
        context={chat.context}
        matched={chat.matched}
        onClose={() => setChat({ open: false })}
        onPickSuggestion={chat.lineId ? pickFromChat : undefined}
      />

      {/* Mai SKU finder — cho dòng "unclear", Mai gợi ý 3-5 mã */}
      {skuFinder && (
        <MaiChatPanel
          open
          context={skuFinder.raw}
          onClose={() => setSkuFinder(null)}
          initialSuggestions={skuFinder.items}
          onPickSuggestion={(item) => completeMatch(skuFinder.lineId, item)}
        />
      )}

      {/* Spec picker — cho dòng "missing thông số" */}
      {specPicker && (
        <SpecPickerPanel
          open
          context={specPicker.raw}
          onClose={() => setSpecPicker(null)}
          onPick={(item) => completeMatch(specPicker.lineId, item)}
        />
      )}

      {/* Add item dialog (Thêm vật tư – popup centered) */}
      <AddItemDialog open={addOpen} onOpenChange={setAddOpen} />

      {/* Image preview dialog */}
      <ImagePreviewDialog open={!!previewItem} onOpenChange={(v) => !v && setPreviewItem(null)} item={previewItem} />

      {/* Suggestion picker (Chọn mã – popup centered) */}
      {picker && (
        <SuggestionPicker
          open={!!picker}
          onOpenChange={(v) => !v && setPicker(null)}
          raw={picker.raw}
          suggestions={picker.suggestions}
          onPick={(item) => {
            updateLine(picker.id, {
              status: "matched",
              match: item,
              selectedSku: item.sku,
              selectedSupplier: item.suppliers[0]?.name,
            });
            toast.success("Đã chốt mã sản phẩm", { description: item.name });
          }}
        />
      )}
    </div>
  );
}

/** Nút icon-only để mở/đóng panel "mã liên quan" cho dòng matched. */
function RelatedToggle({
  active,
  onClick,
  count,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      title={active ? "Ẩn mã liên quan" : `Xem ${count} mã liên quan để thêm nhanh`}
      aria-label={active ? "Ẩn mã liên quan" : "Xem mã liên quan"}
      aria-expanded={active}
      className={cn(
        "grid h-7 w-7 place-items-center rounded-md border transition-colors",
        active
          ? "bg-blue-600 border-blue-500 text-white"
          : "border-blue-200 text-blue-700 bg-blue-50/60 hover:bg-blue-100",
      )}
    >
      <ChevronDown className={cn("h-4 w-4 transition-transform", active && "rotate-180")} />
    </button>
  );
}

/** Panel mã liên quan thread-style — visualize "reply chain" với dòng cha. */
function RelatedThread({
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
    // pl giữ như cũ; pr = sum width 6 cột phải (Đơn vị 70 + SL 130 + Đơn giá 120 + VAT 60 + Thành tiền 140 + Thao tác 80 = 600px)
    // → bubble chỉ rộng bằng cột "Sản phẩm khớp", biên phải sát ranh cột
    <div className="relative pl-[110px] pr-[600px] py-1 bg-violet-50/20">
      {/* L-shape connector ngắn — sát chevron của row cha */}
      <div
        aria-hidden
        className="absolute left-[64px] -top-1 bottom-1/2 w-10 border-l-2 border-b-2 border-violet-300 rounded-bl-xl"
      />
      {/* Thread bubble — compact, chỉ chiếm cột SP */}
      <div className="rounded-lg border border-violet-200 bg-violet-50/40 shadow-sm overflow-hidden animate-fade-up">
        {/* Header gọn */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/60 border-b border-violet-100">
          <Link2 className="h-3 w-3 text-violet-600 shrink-0" />
          <div className="min-w-0 flex-1 text-[11px] truncate">
            <span className="text-muted-foreground">Cùng nhóm với </span>
            <span className="font-semibold text-violet-900">{parentName}</span>
            <span className="text-muted-foreground"> — chọn để thêm:</span>
          </div>
          <span className="text-[9px] text-muted-foreground shrink-0 px-1.5 py-0.5 rounded-full bg-violet-100/70 font-semibold">
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

        {/* Items list — compact */}
        <ul className="divide-y divide-violet-100/80">
          {items.length === 0 && (
            <li className="px-4 py-4 text-center text-xs text-muted-foreground">
              Không có mã liên quan cho sản phẩm này.
            </li>
          )}
          {items.map((item) => (
            <li
              key={item.sku}
              role="button"
              tabIndex={0}
              onClick={() => onPreview(item)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onPreview(item);
                }
              }}
              title={`Xem chi tiết ${item.name}`}
              className="flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-violet-100/40 transition-colors cursor-pointer focus:outline-none focus:bg-violet-100/60"
            >
              <div className="relative h-9 w-9 shrink-0 rounded border bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
                <img
                  src={getProductImage(item)}
                  alt={item.name}
                  className="w-full h-full object-contain p-0.5"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] font-bold uppercase px-1 py-0 rounded bg-muted text-muted-foreground tracking-wider">
                    {item.brand}
                  </span>
                  <span className="font-medium text-xs truncate">{item.name}</span>
                </div>
                {/* Tên - mã - giá - đơn vị - VAT (bỏ leadtime) */}
                <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span className="font-mono">SKU: {item.sku}</span>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="font-semibold brand-gradient-text tabular-nums">
                    {formatVND(item.unitPrice)}
                  </span>
                  <span className="text-muted-foreground/60">/ {item.unit}</span>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="inline-flex items-center px-1 rounded bg-muted text-[9px] font-semibold tabular-nums">
                    VAT {item.vatPct}%
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onPick(item);
                }}
                className="brand-gradient text-white border-0 hover:opacity-90 h-7 px-2.5 text-[11px] shrink-0"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                Thêm
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function RowMatch({
  line,
  onChoose,
  onAskMaiUnclear,
  onFillSpecsMissing,
  onPreview,
  rightSlot,
}: {
  line: ReturnType<typeof useRequest>["lines"][number];
  onChoose: () => void;
  onAskMaiUnclear: () => void;
  onFillSpecsMissing: () => void;
  onPreview?: (item: CatalogItem) => void;
  rightSlot?: React.ReactNode;
}) {
  if (line.status === "matched" && line.match) {
    return (
      <div className="flex items-stretch gap-2.5 min-h-[60px]">
        <button
          onClick={() => onPreview?.(line.match!)}
          className="relative w-14 self-stretch shrink-0 rounded-md border bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden hover:ring-2 hover:ring-violet-300 transition-all group"
          title="Xem ảnh sản phẩm"
        >
          <img
            src={getProductImage(line.match)}
            alt={line.match.name}
            className="w-full h-full object-contain p-1.5"
          />
          <span className="absolute inset-0 bg-violet-600/0 group-hover:bg-violet-600/10 transition-colors" />
        </button>
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 leading-snug">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span className="font-semibold text-emerald-700 truncate">{line.match.name}</span>
          </div>
          <div className="text-[11px] font-mono text-muted-foreground mt-0.5">SKU: {line.match.sku}</div>
        </div>
        {rightSlot && (
          <div className="flex items-center gap-1 shrink-0 self-center">{rightSlot}</div>
        )}
      </div>
    );
  }
  if (line.status === "choose") {
    return (
      <div>
        <div className="text-amber-700 font-medium text-sm">
          Cần chọn 1 trong {line.suggestions?.length ?? 0} sản phẩm đề xuất
        </div>
        <Button
          size="sm"
          variant="outline"
          className="mt-1.5 h-7 border-amber-300 text-amber-700 hover:bg-amber-50"
          onClick={onChoose}
        >
          <Search className="h-3.5 w-3.5" />
          Chọn mã
        </Button>
      </div>
    );
  }
  if (line.status === "unclear") {
    return (
      <div>
        <div className="text-amber-700 font-medium text-sm flex items-start gap-1.5">
          <HelpCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{line.reason ?? "Không rõ tên vật tư. Vui lòng chat để xác nhận."}</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="mt-1.5 h-7 border-amber-300 text-amber-700 hover:bg-amber-50"
          onClick={onAskMaiUnclear}
        >
          <Zap className="h-3.5 w-3.5" />
          Hỏi Mai ngay
        </Button>
      </div>
    );
  }
  return (
    <div>
      <div className="text-amber-700 font-medium text-sm flex items-start gap-1.5">
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
        <span>{line.reason ?? "Thiếu thông số kỹ thuật."}</span>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="mt-1.5 h-7 border-amber-300 text-amber-700 hover:bg-amber-50"
        onClick={onFillSpecsMissing}
      >
        <Plus className="h-3.5 w-3.5" />
        Bổ sung thông số
      </Button>
    </div>
  );
}
