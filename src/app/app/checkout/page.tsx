"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Truck,
  FileText,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Phone,
  User,
  Zap,
  PackageOpen,
  Boxes,
} from "lucide-react";
import { toast } from "sonner";
import { useRequest } from "@/components/request-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrderSummary } from "@/components/order-summary";
import { cn } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { hasRequest, loadSample, shipping, setShipping } = useRequest();

  React.useEffect(() => {
    if (!hasRequest) loadSample("Upload_Image.png");
  }, [hasRequest, loadSample]);

  const set = <K extends keyof typeof shipping>(k: K, v: (typeof shipping)[K]) =>
    setShipping({ ...shipping, [k]: v });

  const proceed = () => {
    if (!shipping.recipient || !shipping.phone || !shipping.address) {
      toast.error("Vui lòng điền đầy đủ thông tin nhận hàng");
      return;
    }
    router.push("/app/payment");
  };

  return (
    <div className="container py-4">
      <div className="grid lg:grid-cols-[1fr_360px] gap-4 lg:gap-5">
        <div className="space-y-3 min-w-0 order-2 lg:order-1">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Truck className="h-5 w-5 text-violet-600" />
              <h2 className="text-lg font-bold">Thông tin giao hàng &amp; Hoá đơn</h2>
            </div>

            {/* Địa chỉ nhận hàng */}
            <div className="rounded-lg border bg-violet-50/30 p-3 mb-3">
              <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-violet-700 uppercase tracking-wide">
                <MapPin className="h-3.5 w-3.5" /> Địa chỉ nhận hàng
              </div>
              <div className="grid sm:grid-cols-2 gap-2.5">
                <div>
                  <Label className="flex items-center gap-1 mb-1 text-xs"><User className="h-3 w-3" /> Người nhận</Label>
                  <Input value={shipping.recipient} onChange={(e) => set("recipient", e.target.value)} className="h-9" />
                </div>
                <div>
                  <Label className="flex items-center gap-1 mb-1 text-xs"><Phone className="h-3 w-3" /> Số điện thoại</Label>
                  <Input value={shipping.phone} onChange={(e) => set("phone", e.target.value)} className="h-9" />
                </div>
                <div className="sm:col-span-2">
                  <Label className="mb-1 text-xs">Địa chỉ chi tiết (Nhà máy / Kho)</Label>
                  <Input value={shipping.address} onChange={(e) => set("address", e.target.value)} className="h-9" />
                </div>
                <div className="sm:col-span-2">
                  <Label className="mb-1 text-xs">Ghi chú giao hàng</Label>
                  <textarea
                    value={shipping.note}
                    onChange={(e) => set("note", e.target.value)}
                    rows={1}
                    placeholder="Giao trong giờ hành chính..."
                    className="w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
            </div>

            {/* Tốc độ giao + Ưu tiên giao — 2 cols */}
            <div className="grid sm:grid-cols-2 gap-2.5 mb-3">
              {/* Tốc độ giao */}
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-violet-700 uppercase tracking-wide">
                  <Zap className="h-3.5 w-3.5" /> Tốc độ giao
                </div>
                <div className="space-y-1.5">
                  <RadioCard
                    active={shipping.deliveryMode === "standard"}
                    onClick={() => set("deliveryMode", "standard")}
                    icon={Truck}
                    label="Giao tiêu chuẩn"
                    sub="1-3 ngày · Miễn phí"
                  />
                  <RadioCard
                    active={shipping.deliveryMode === "express"}
                    onClick={() => set("deliveryMode", "express")}
                    icon={Zap}
                    label="Giao hoả tốc"
                    sub="4-8h · +150.000 đ"
                    accentClass="text-amber-700"
                  />
                </div>
              </div>

              {/* Ưu tiên giao */}
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-violet-700 uppercase tracking-wide">
                  <Boxes className="h-3.5 w-3.5" /> Ưu tiên giao
                </div>
                <div className="space-y-1.5">
                  <RadioCard
                    active={shipping.deliveryPriority === "all"}
                    onClick={() => set("deliveryPriority", "all")}
                    icon={Boxes}
                    label="Đợi đủ giao 1 lần"
                    sub="Tiết kiệm phí ship gộp"
                  />
                  <RadioCard
                    active={shipping.deliveryPriority === "available-first"}
                    onClick={() => set("deliveryPriority", "available-first")}
                    icon={PackageOpen}
                    label="Có hàng trước giao trước"
                    sub="Mã hết hàng giao đợt sau"
                  />
                </div>
              </div>
            </div>

            {/* VAT toggle */}
            <div className={cn("rounded-lg border p-3 transition-colors", shipping.vatRequired && "bg-amber-50/40 border-amber-200")}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-semibold">
                  <FileText className="h-4 w-4 text-amber-600" />
                  Yêu cầu xuất hoá đơn VAT
                </div>
                <Toggle
                  checked={shipping.vatRequired}
                  onChange={(v) => set("vatRequired", v)}
                />
              </div>
              {shipping.vatRequired && (
                <div className="grid sm:grid-cols-2 gap-2.5 mt-3 animate-fade-up">
                  <div>
                    <Label className="mb-1 text-xs">Tên công ty *</Label>
                    <Input value={shipping.companyName} onChange={(e) => set("companyName", e.target.value)} className="h-9" />
                  </div>
                  <div>
                    <Label className="mb-1 text-xs">Mã số thuế *</Label>
                    <Input value={shipping.taxId} onChange={(e) => set("taxId", e.target.value)} className="h-9" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="mb-1 text-xs">Email nhận hoá đơn</Label>
                    <Input type="email" value={shipping.invoiceEmail} onChange={(e) => set("invoiceEmail", e.target.value)} className="h-9" />
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Bottom nav */}
          <div className="flex justify-between gap-2">
            <Button variant="outline" onClick={() => router.push("/app/quote")} className="h-10">
              <ChevronLeft className="h-4 w-4" /> Quay lại báo giá
            </Button>
            <Button onClick={proceed} className="brand-gradient text-white border-0 hover:opacity-90 h-10">
              Tiếp tục → Thanh toán <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <aside className="order-1 lg:order-2">
          <OrderSummary />
        </aside>
      </div>
    </div>
  );
}

/** Radio-card kiểu compact: viền + check active, icon + label + sub */
function RadioCard({
  active,
  onClick,
  icon: Icon,
  label,
  sub,
  accentClass,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sub: string;
  accentClass?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-left transition-all",
        active ? "border-violet-500 bg-violet-50/60 shadow-sm" : "border-border hover:border-violet-300 hover:bg-violet-50/30",
      )}
    >
      <span
        className={cn(
          "shrink-0 grid h-4 w-4 place-items-center rounded-full border-2 transition-colors",
          active ? "border-violet-600" : "border-input",
        )}
      >
        {active && <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />}
      </span>
      <Icon className={cn("h-3.5 w-3.5 shrink-0", active ? "text-violet-600" : "text-muted-foreground")} />
      <div className="min-w-0 flex-1">
        <div className={cn("text-xs font-semibold leading-tight", accentClass)}>{label}</div>
        <div className="text-[10px] text-muted-foreground leading-tight">{sub}</div>
      </div>
    </button>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="Yêu cầu xuất hoá đơn VAT"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2",
        checked ? "bg-violet-600" : "bg-slate-300",
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-[18px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
