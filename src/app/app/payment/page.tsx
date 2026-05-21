"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CreditCard,
  Calendar,
  Wallet,
  AlertCircle,
  ChevronLeft,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import { useRequest } from "@/components/request-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderSummary } from "@/components/order-summary";
import { FakeQR } from "@/components/qr-code";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SteppedLoader } from "@/components/stepped-loader";

type PaymentMethodKey = "qr" | "credit" | "card" | "bnpl";
type PaymentMethodCfg = {
  k: PaymentMethodKey;
  label: string;
  icon: typeof Building2;
  sub?: string;
  badge?: string;
  badgeColor?: string;
  comingSoon?: boolean;
};

const METHODS: PaymentMethodCfg[] = [
  { k: "qr", label: "Chuyển khoản QR (VietQR)", icon: Building2, badge: "Khuyên dùng", badgeColor: "bg-emerald-100 text-emerald-700" },
  { k: "credit", label: "Thanh toán công nợ 30 ngày", icon: Calendar, sub: "Hạn mức khả dụng: 50.000.000 đ", badge: "VIP", badgeColor: "bg-violet-100 text-violet-700" },
  { k: "card", label: "Thẻ tín dụng / Thẻ ghi nợ", icon: CreditCard, sub: "Visa, Mastercard, JCB, Amex.", comingSoon: true },
  { k: "bnpl", label: "Mua trước trả sau (BNPL)", icon: Wallet, sub: "Chia nhỏ thanh toán thành 3 kỳ miễn lãi.", badge: "Fundiin", badgeColor: "bg-slate-900 text-white", comingSoon: true },
];

export default function PaymentPage() {
  const router = useRouter();
  const { lines, hasRequest, loadSample, paymentMethod, setPaymentMethod, setOrderId, saveOrder } = useRequest();
  const [copied, setCopied] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!hasRequest) loadSample("Upload_Image.png");
  }, [hasRequest, loadSample]);

  const subtotal = lines
    .filter((l) => l.selected && l.match)
    .reduce((s, l) => s + (l.allocations
      ? Object.entries(l.allocations).reduce((a, [n, q]) => {
          const sup = l.match!.suppliers.find((x) => x.name === n);
          return a + (sup?.price ?? l.match!.unitPrice) * q;
        }, 0)
      : l.qty * (l.match?.unitPrice ?? 0)
    ), 0);
  const grand = subtotal + Math.round(subtotal * 0.08);

  const refCode = "MEC-9988";
  const accountNo = "1022.333.444";
  const accountName = "CONG TY TNHH MECSU";

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Đã sao chép");
    setTimeout(() => setCopied(false), 1500);
  };

  const handlePay = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1700));
    setOrderId(refCode);
    saveOrder(refCode, grand);
    router.push("/app/success");
  };

  return (
    <div className="container py-4">
      <div className="grid lg:grid-cols-[1fr_360px] gap-4 lg:gap-5">
        <div className="space-y-3 min-w-0 order-2 lg:order-1">
          <Card className="p-4">
            <h2 className="text-base sm:text-lg font-bold mb-0.5">Phương thức thanh toán</h2>
            <p className="text-xs text-muted-foreground mb-3">Chọn cách bạn muốn thanh toán đơn này.</p>

            {/* QR — primary */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setPaymentMethod("qr")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setPaymentMethod("qr");
                }
              }}
              className={cn(
                "w-full flex items-start gap-3 rounded-xl border-2 p-3 text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-300",
                paymentMethod === "qr" ? "border-violet-500 bg-violet-50/50 shadow-sm" : "border-border hover:border-violet-300",
              )}
            >
              <Radio active={paymentMethod === "qr"} />
              <div className="flex-1 min-w-0 grid sm:grid-cols-[150px_1fr] gap-3">
                <div className="rounded-lg border bg-white p-2 shadow-sm mx-auto sm:mx-0 max-w-[150px]">
                  <FakeQR seed={refCode} size={134} />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Tên tài khoản</div>
                  <div className="font-bold uppercase text-sm">{accountName}</div>

                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-2">Số tài khoản</div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-bold tracking-wide brand-gradient-text tabular-nums">{accountNo}</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copy(accountNo.replace(/\./g, ""));
                      }}
                      className="grid h-6 w-6 place-items-center rounded-md border hover:bg-muted"
                    >
                      {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>

                  <div className="mt-2 rounded-md border bg-amber-50/60 border-amber-200 p-2 flex items-start gap-1.5 text-[11px] leading-snug">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      Nội dung chuyển khoản tự điền khi quét QR. Nếu nhập tay, ghi:{" "}
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-900 bg-amber-100 px-1.5 rounded">
                        {refCode}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copy(refCode);
                          }}
                          className="hover:text-amber-700"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Other methods */}
            <div className="mt-2 space-y-1.5">
              {METHODS.slice(1).map((m) => {
                const disabled = !!m.comingSoon;
                return (
                  <button
                    key={m.k}
                    onClick={() => {
                      if (disabled) {
                        toast.info("Sẽ ra mắt vào tháng 12/2026");
                        return;
                      }
                      setPaymentMethod(m.k as typeof paymentMethod);
                    }}
                    disabled={disabled}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-lg border p-2.5 text-left transition-all",
                      disabled
                        ? "opacity-55 cursor-not-allowed bg-muted/30"
                        : paymentMethod === m.k
                          ? "border-violet-500 bg-violet-50/40"
                          : "hover:border-violet-300",
                    )}
                    title={disabled ? "Sẽ ra mắt vào tháng 12/2026" : undefined}
                  >
                    <Radio active={!disabled && paymentMethod === m.k} />
                    <m.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{m.label}</div>
                      {m.sub && <div className="text-[11px] text-muted-foreground truncate">{m.sub}</div>}
                    </div>
                    {disabled ? (
                      <span
                        className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-semibold bg-amber-100 text-amber-800 border border-amber-200"
                        title="Sẽ ra mắt vào tháng 12/2026"
                      >
                        <AlertCircle className="h-3 w-3" />
                        Ra mắt 12/2026
                      </span>
                    ) : (
                      m.badge && (
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-semibold", m.badgeColor)}>
                          {m.badge}
                        </span>
                      )
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          {submitting && (
            <Card className="p-4 animate-fade-up">
              <SteppedLoader
                steps={[
                  { label: "Khoá giá NCC realtime", durationMs: 320 },
                  { label: "Tạo đơn mua hàng & sinh mã đơn", durationMs: 360 },
                  { label: "Ghi sổ kế toán & xuất hoá đơn VAT", durationMs: 320 },
                  { label: "Gửi xác nhận tới NV bán & sourcing", durationMs: 320 },
                ]}
              />
            </Card>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/app/checkout")} className="h-10">
              <ChevronLeft className="h-4 w-4" /> Quay lại
            </Button>
          </div>
        </div>

        <aside className="order-1 lg:order-2">
          <OrderSummary
            onPay={submitting ? undefined : handlePay}
            cta={
              submitting ? (
                <div className="mt-4 grid place-items-center h-12 rounded-xl bg-violet-100 text-violet-700 font-semibold">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : null
            }
          />
        </aside>
      </div>
    </div>
  );
}

function Radio({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "shrink-0 mt-1 grid h-5 w-5 place-items-center rounded-full border-2 transition-colors",
        active ? "border-blue-600" : "border-input",
      )}
    >
      {active && <span className="h-2.5 w-2.5 rounded-full bg-violet-600" />}
    </span>
  );
}
