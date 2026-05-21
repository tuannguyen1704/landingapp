"use client";
import * as React from "react";
import Link from "next/link";
import { CheckCircle2, Truck, Receipt, FileText, Home, Eye } from "lucide-react";
import { useRequest } from "@/components/request-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatVND } from "@/lib/utils";

export default function SuccessPage() {
  const { lines, paymentMethod, orderId, reset } = useRequest();
  const items = lines.filter((l) => l.selected && l.match);
  const subtotal = items.reduce((s, l) => s + l.qty * (l.match?.unitPrice ?? 0), 0);
  const grand = subtotal + Math.round(subtotal * 0.08);

  const methodLabel = {
    qr: "Chuyển khoản QR",
    credit: "Công nợ 30 ngày",
    card: "Thẻ tín dụng",
    bnpl: "BNPL Fundiin",
  }[paymentMethod];

  const id = orderId || "MEC-9988";
  // ETA tính client-side để tránh hydration mismatch giữa server prerender và client
  const [eta, setEta] = React.useState("");
  React.useEffect(() => {
    setEta(new Date(Date.now() + 86400000 * 2).toLocaleDateString("vi-VN"));
  }, []);

  return (
    <div className="container max-w-xl py-6 sm:py-10 md:py-16">
      <Card className="p-5 sm:p-8 text-center">
        {/* Confetti / check */}
        <div className="relative inline-grid place-items-center mb-2">
          <div className="absolute inset-0 -m-4 rounded-full bg-emerald-100 animate-ping opacity-30" />
          <div className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-600 ring-4 ring-emerald-50 relative">
            <CheckCircle2 className="h-14 w-14" strokeWidth={2.5} />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold mt-4 animate-fade-up">Đặt hàng thành công!</h1>
        <p className="text-muted-foreground mt-2 animate-fade-up" style={{ animationDelay: "100ms" }}>
          Cảm ơn bạn đã tin tưởng MECSU. Đơn hàng đang được xử lý.
        </p>

        <div className="mt-4 sm:mt-6 text-left rounded-xl border bg-muted/30 p-4 sm:p-5 space-y-3 animate-fade-up" style={{ animationDelay: "200ms" }}>
          <Row icon={Receipt} label="Mã đơn hàng" value={
            <span className="font-mono font-bold brand-gradient-text">#{id}</span>
          } />
          <Separator />
          <Row icon={FileText} label="Tổng tiền đã thanh toán" value={
            <span className="font-bold brand-gradient-text">{formatVND(grand)}</span>
          } />
          <Separator />
          <Row icon={Receipt} label="Phương thức" value={methodLabel} />
          <Separator />
          <Row icon={Truck} label="Giao hàng dự kiến" value={
            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">{eta}</span>
          } />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 animate-fade-up" style={{ animationDelay: "300ms" }}>
          <Button asChild variant="outline">
            <Link href="/app" onClick={() => reset()}>
              <Home className="h-4 w-4" /> Về trang chủ
            </Link>
          </Button>
          <Button asChild className="brand-gradient text-white border-0 hover:opacity-90">
            <Link href={`/orders/${id}`}>
              <Eye className="h-4 w-4" /> Theo dõi đơn hàng
            </Link>
          </Button>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Email xác nhận + hoá đơn VAT đã được gửi tới bộ phận mua hàng của bạn.
        </p>
      </Card>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Receipt; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <span className="font-medium text-sm text-right">{value}</span>
    </div>
  );
}
