"use client";
import * as React from "react";
import { Send, X, Bot, MessageCircle, ArrowRightLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatVND } from "@/lib/utils";
import { type CatalogItem, getProductImage, findClosestByText } from "@/data/catalog";

type Msg = { role: "bot" | "user"; text: string; ts: string; cards?: CatalogItem[] };

/** Câu hỏi gợi ý cho dòng ĐÃ khớp mã */
const QUICK_REPLIES_MATCHED = [
  "Xem lịch sử giá",
  "Xem thông số kỹ thuật mã này",
  "Xem các mã tương tự",
  "Đổi mã khác",
];
/** Câu hỏi gợi ý cho dòng CHƯA khớp mã */
const QUICK_REPLIES_UNMATCHED = [
  "Xem các mã gợi ý",
  "Nhờ Mai tìm giúp",
  "Các danh mục liên quan",
];

export function MaiChatPanel({
  open,
  context,
  onClose,
  /** true = dòng đã khớp mã | false/undefined = chưa khớp → đổi bộ câu hỏi gợi ý + welcome */
  matched,
  /** Khi truyền vào, panel chuyển sang mode "tìm SKU": Mai hiện 3-5 cards gợi ý ngay welcome message. */
  initialSuggestions,
  onPickSuggestion,
}: {
  open: boolean;
  context?: string;
  onClose: () => void;
  matched?: boolean;
  initialSuggestions?: CatalogItem[];
  onPickSuggestion?: (item: CatalogItem) => void;
}) {
  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [input, setInput] = React.useState("");
  const [thinking, setThinking] = React.useState(false);

  // Reset welcome message when context changes
  React.useEffect(() => {
    if (open && context) {
      const ts = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
      if (initialSuggestions && initialSuggestions.length > 0) {
        setMessages([
          {
            role: "bot",
            ts,
            text: `Mai đã tìm ${initialSuggestions.length} mã gần nhất với mô tả "${context}". Bạn chọn 1 mã phù hợp:`,
            cards: initialSuggestions,
          },
        ]);
      } else {
        setMessages([
          {
            role: "bot",
            text: matched
              ? `Bạn muốn Mai hỗ trợ gì cho "${context}"?`
              : `Chưa khớp mã hệ thống cho từ khoá "${context}". Bạn có muốn mình hỗ trợ bên dưới:`,
            ts,
          },
        ]);
      }
    }
  }, [open, context, initialSuggestions, matched]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    const ts = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    setMessages((m) => [...m, { role: "user", text: t, ts }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      const reply = generateReply(t, context);
      setMessages((m) => [...m, { role: "bot", text: reply.text, ts, cards: reply.cards }]);
      setThinking(false);
    }, 900);
  };

  if (!open) return null;

  return (
    <aside className="fixed right-0 top-14 sm:top-16 bottom-0 w-full sm:w-[400px] z-30 bg-card border border-indigo-300 rounded-tl-2xl overflow-hidden shadow-[0_8px_40px_-8px_rgba(79,70,229,0.35)] flex flex-col animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-gradient-to-r from-violet-50 to-blue-50">
        <div className="relative">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-blue-600 text-white shadow">
            <Bot className="h-5 w-5" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-card" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold flex items-center gap-1">
            Mai – Trợ lý MRO
            <svg className="h-4 w-4 text-violet-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          {context && (
            <div className="text-xs text-muted-foreground truncate">
              Đang hỗ trợ: <span className="text-violet-700 font-medium">{context}</span>
            </div>
          )}
        </div>
        <button onClick={onClose} className="p-2 rounded-md hover:bg-muted min-w-[40px] min-h-[40px] grid place-items-center">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-3">
        <div className="text-center">
          <span className="text-[11px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">Hôm nay {messages[0]?.ts ?? "—"}</span>
        </div>
        {messages.map((m, i) => (
          <div key={i}>
            <div className={cn("flex gap-2 animate-fade-up", m.role === "user" && "flex-row-reverse")}>
              {m.role === "bot" && (
                <div className="grid h-7 w-7 place-items-center rounded-full bg-violet-100 shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5 text-violet-700" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-line",
                  m.role === "bot"
                    ? "bg-muted rounded-tl-sm"
                    : "brand-gradient text-white rounded-tr-sm",
                )}
              >
                {m.text}
              </div>
            </div>
            {/* SKU suggestion cards inside bot message */}
            {m.cards && m.cards.length > 0 && (
              <div className="pl-9 mt-2 space-y-1.5 animate-fade-up">
                {m.cards.map((c, j) => (
                  <button
                    key={c.sku}
                    onClick={() => onPickSuggestion?.(c)}
                    className="w-full text-left rounded-lg border bg-card hover:border-violet-400 hover:shadow-sm hover:bg-violet-50/40 transition-all p-2.5 group"
                    style={{ animationDelay: `${j * 60}ms` }}
                  >
                    <div className="flex items-start gap-2">
                      <div className="relative h-10 w-10 shrink-0 rounded-md border bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
                        <img src={getProductImage(c)} alt={c.name} className="w-full h-full object-contain p-0.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            {c.brand}
                          </span>
                          <span className="font-medium text-sm leading-snug truncate">{c.name}</span>
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                          SKU: {c.sku} · Giao {c.leadTimeDays}d
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold brand-gradient-text text-sm tabular-nums">{formatVND(c.unitPrice)}</div>
                        <div className="text-[10px] text-muted-foreground">/ {c.unit}</div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] inline-flex items-center gap-0.5 text-violet-600">
                        <Sparkles className="h-2.5 w-2.5" /> Mai gợi ý
                      </span>
                      <span className="text-[11px] inline-flex items-center gap-1 text-violet-700 font-semibold opacity-70 group-hover:opacity-100">
                        Chọn mã này <ArrowRightLeft className="h-3 w-3" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {thinking && (
          <div className="flex gap-2 animate-fade-up">
            <div className="grid h-7 w-7 place-items-center rounded-full bg-blue-100 shrink-0 mt-0.5">
              <Bot className="h-3.5 w-3.5 text-blue-700" />
            </div>
            <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2.5">
              <div className="flex gap-0.5">
                <span className="step-dot" />
                <span className="step-dot" />
                <span className="step-dot" />
              </div>
            </div>
          </div>
        )}

        {/* Quick replies — đổi theo case matched / chưa matched */}
        {messages.length <= 1 && !thinking && (
          <div className="flex flex-wrap gap-1.5 pl-9">
            {(matched ? QUICK_REPLIES_MATCHED : QUICK_REPLIES_UNMATCHED).map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="text-xs px-3 py-1.5 rounded-full border border-violet-200 bg-violet-50/50 text-violet-700 hover:bg-violet-100 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border-t p-3 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhắn tin cho Mai..."
          className="flex-1 h-10 rounded-full bg-muted px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <Button type="submit" size="icon" className="rounded-full brand-gradient text-white border-0 hover:opacity-90 h-10 w-10">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </aside>
  );
}

/** Floating button to reopen chat. */
export function MaiToggle({ onClick, count }: { onClick: () => void; count?: number }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-30 lg:hidden grid place-items-center h-14 w-14 rounded-full brand-gradient text-white shadow-xl hover:opacity-90"
    >
      <MessageCircle className="h-6 w-6" />
      {count != null && count > 0 && (
        <span className="absolute -top-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-amber-500 text-xs font-bold">{count}</span>
      )}
    </button>
  );
}

function generateReply(prompt: string, context?: string): { text: string; cards?: CatalogItem[] } {
  const p = prompt.toLowerCase();
  const q = context ?? "sản phẩm này";

  // === Case ĐÃ khớp mã ===
  // Xem lịch sử giá
  if (p.includes("lịch sử") || p.includes("history")) {
    return {
      text:
        `📈 Lịch sử giá "${q}" — 90 ngày gần nhất:\n` +
        `• 02/05/2026 — 30.000đ\n` +
        `• 14/04/2026 — 31.500đ\n` +
        `• 28/03/2026 — 29.000đ\n` +
        `• 10/03/2026 — 32.000đ\n` +
        `Giá trung bình: 30.600đ · Xu hướng: ổn định, biến động ±5%.`,
    };
  }
  // Xem thông số kỹ thuật
  if (p.includes("thông số") || p.includes("kỹ thuật")) {
    return {
      text:
        `🔧 Thông số kỹ thuật "${q}":\n` +
        `• Vật liệu: Thép gió HSS\n` +
        `• Tiêu chuẩn: DIN 338\n` +
        `• Độ cứng: 65–67 HRC\n` +
        `• Lớp phủ: Oxit đen chống gỉ\n` +
        `• Xuất xứ: Nhật Bản · Bảo hành 12 tháng`,
    };
  }
  // Xem các mã tương tự
  if (p.includes("tương tự")) {
    const cards = context ? findClosestByText(context, 3) : [];
    return cards.length > 0
      ? { text: `Mai tìm được ${cards.length} mã tương tự với "${q}". Bấm để xem chi tiết / chốt mã:`, cards }
      : { text: "Mai chưa tìm thấy mã tương tự phù hợp." };
  }
  // Đổi mã khác
  if (p.includes("đổi mã") || p.includes("thay")) {
    const cards = context ? findClosestByText(context, 3) : [];
    return cards.length > 0
      ? { text: `Chọn 1 mã thay thế bên dưới — bảng sẽ tự cập nhật ngay:`, cards }
      : { text: "Mai chưa tìm thấy mã thay thế phù hợp." };
  }

  // === Case CHƯA khớp mã ===
  // Xem các mã gợi ý
  if (p.includes("gợi ý") || p.includes("rẻ") || p.includes("đề xuất")) {
    const cards = context ? findClosestByText(context, 3) : [];
    return cards.length > 0
      ? { text: `Mai gợi ý ${cards.length} mã gần nhất với "${q}". Bấm vào 1 mã để chốt:`, cards }
      : { text: "Mai chưa có mã gợi ý — bạn thử mô tả rõ hơn nhé." };
  }
  // Nhờ Mai tìm giúp
  if (p.includes("tìm giúp") || p.includes("nhờ mai")) {
    const cards = context ? findClosestByText(context, 3) : [];
    return cards.length > 0
      ? { text: `Mai vừa quét catalog 500.000+ mã MRO. Đây là ${cards.length} mã khớp nhất với "${q}":`, cards }
      : { text: `Mai chưa khớp được "${q}". NV sourcing sẽ liên hệ bạn trong 15 phút để tư vấn.` };
  }
  // Các danh mục liên quan
  if (p.includes("danh mục")) {
    return {
      text:
        `📂 Danh mục liên quan tới "${q}":\n` +
        `• Dụng cụ cắt gọt — khoan, taro, phay\n` +
        `• Vật tư cơ khí — bu lông, vòng bi\n` +
        `• Thiết bị bảo trì MRO\n` +
        `• Phụ kiện & vật tư tiêu hao\n` +
        `Bạn muốn Mai lọc theo danh mục nào?`,
    };
  }

  // === Chung ===
  if (p.includes("ncc") || p.includes("so sánh")) {
    return {
      text:
        `So sánh 3 NCC tốt nhất cho "${q}":\n` +
        `• Nachi VN — 30.000đ • giao 1 ngày • tồn 200\n` +
        `• Smart V2 — 31.000đ • giao 2 ngày • tồn 80\n` +
        `• Total VN — 28.500đ • giao 1 ngày • tồn 150`,
    };
  }
  if (p.includes("giải thích") || p.includes("vì sao")) {
    return { text: `Mai khớp mã dựa trên: thương hiệu, loại sản phẩm, kích thước phổ biến. Độ tin cậy khớp: 95%.` };
  }
  return { text: `Mai đã ghi nhận: "${prompt}". NV phụ trách sẽ phản hồi trong 5 phút.` };
}
