"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Receipt, Search, Truck, CheckCircle2, Package, Clock, ChevronRight, FileText } from "lucide-react";
import { useRequest, type SavedOrder } from "@/components/request-provider";
import { useAuth } from "@/components/auth-provider";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoginPromptBanner } from "@/components/ui/login-prompt-banner";
import { cn, formatVND } from "@/lib/utils";

const STATUS_META: Record<SavedOrder["status"], { label: string; icon: typeof Truck; color: string }> = {
  placed:    { label: "Đã đặt",        icon: Receipt,      color: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Đã xác nhận",   icon: CheckCircle2, color: "bg-violet-100 text-violet-700" },
  packed:    { label: "Đang đóng gói", icon: Package,      color: "bg-blue-100 text-blue-700" },
  shipped:   { label: "Đang giao",     icon: Truck,        color: "bg-sky-100 text-sky-700" },
  delivered: { label: "Đã giao",       icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700" },
};

export default function OrdersPage() {
  const { user } = useAuth();
  const { orders } = useRequest();
  const [q, setQ] = React.useState("");
  const [tab, setTab] = React.useState<"all" | SavedOrder["status"]>("all");
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => setHydrated(true), []);

  const visible = orders.filter((o) => {
    if (tab !== "all" && o.status !== tab) return false;
    if (q.trim() && !o.id.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all: orders.length,
    placed: orders.filter((o) => o.status === "placed").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    packed: orders.filter((o) => o.status === "packed").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  // Show loading state while hydrating
  if (!hydrated) {
    return (
      <div className="px-3 sm:px-4 md:px-8 py-4 sm:py-6 max-w-[1400px] mx-auto">
        <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-[26px] font-bold tracking-tight">Lịch sử đơn hàng</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Đang tải...</p>
          </div>
        </div>
        <Card className="p-12 text-center text-sm text-muted-foreground">Đang tải...</Card>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="px-3 sm:px-4 md:px-8 py-4 sm:py-6 max-w-[1400px] mx-auto">
        <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-[26px] font-bold tracking-tight">Lịch sử đơn hàng</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Theo dõi trạng thái giao hàng</p>
          </div>
          <Button asChild className="brand-gradient text-white border-0 hover:opacity-90">
            <Link href="/app">+ Tạo yêu cầu mới</Link>
          </Button>
        </div>
        <LoginPromptBanner
          variant="card"
          purpose="xem lịch sử đơn hàng của bạn"
          description="Đăng nhập để xem và theo dõi các đơn hàng đã đặt."
        />
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-4 md:px-8 py-4 sm:py-6 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-[26px] font-bold tracking-tight">Lịch sử đơn hàng</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">{orders.length} đơn đã đặt · theo dõi trạng thái giao hàng</p>
        </div>
        <Button asChild className="brand-gradient text-white border-0 hover:opacity-90">
          <Link href="/app">+ Tạo yêu cầu mới</Link>
        </Button>
      </div>

      {/* Search + tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mb-4">
        <div className="relative w-full sm:flex-1 sm:min-w-[200px] sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo mã đơn..." className="pl-9 h-9" />
        </div>
        <div className="flex items-center gap-1 text-xs overflow-x-auto scrollbar-none pb-0.5 flex-nowrap">
          {[
            { k: "all", label: "Tất cả" },
            { k: "placed", label: "Đã đặt" },
            { k: "confirmed", label: "Đã xác nhận" },
            { k: "packed", label: "Đóng gói" },
            { k: "shipped", label: "Đang giao" },
            { k: "delivered", label: "Đã giao" },
          ].map((t) => {
            const active = tab === t.k;
            const c = counts[t.k as keyof typeof counts];
            return (
              <button
                key={t.k}
                onClick={() => setTab(t.k as typeof tab)}
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 h-8 rounded-md border font-medium transition-all",
                  active ? "ring-2 ring-violet-300 bg-violet-50 text-violet-700 border-violet-200" : "border-transparent text-muted-foreground hover:bg-muted",
                )}
              >
                {t.label}
                <span className={cn("text-[10px] tabular-nums px-1.5 rounded", active ? "bg-white/60" : "bg-muted")}>
                  {c}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders list */}
      {!hydrated ? (
        <Card className="p-12 text-center text-sm text-muted-foreground">Đang tải...</Card>
      ) : visible.length === 0 ? (
        <Card className="p-12 text-center">
          <Receipt className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
          <h3 className="font-semibold text-lg">Chưa có đơn hàng</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {orders.length === 0 ? "Đặt đơn đầu tiên để xem ở đây." : "Không có đơn khớp bộ lọc hiện tại."}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {visible.map((o) => {
            const meta = STATUS_META[o.status];
            const Icon = meta.icon;
            return (
              <Link
                key={o.id}
                href={`/orders/${o.id}`}
                className="block rounded-xl border bg-card p-4 hover:shadow-md hover:border-violet-300 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-lg shrink-0", meta.color)}>
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold brand-gradient-text">#{o.id}</span>
                      <Badge variant="secondary" className={meta.color}>
                        {meta.label}
                      </Badge>
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5 sm:gap-3 flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(o.createdAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}
                      </span>
                      <span className="hidden sm:inline">·</span>
                      <span className="hidden sm:inline">{o.itemCount} mặt hàng</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-base sm:text-lg font-bold brand-gradient-text tabular-nums">{formatVND(o.totalAmount)}</div>
                    <div className="text-[10px] sm:text-[11px] text-muted-foreground">
                      {o.paymentMethod === "qr"
                        ? "Chuyển khoản QR"
                        : o.paymentMethod === "credit"
                          ? "Công nợ"
                          : o.paymentMethod === "card"
                            ? "Thẻ"
                            : "BNPL"}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-violet-600 transition-colors shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {orders.length > 0 && (
        <div className="mt-6 text-center text-xs text-muted-foreground">
          Lịch sử lưu trên trình duyệt này. Production sẽ đồng bộ với BE để xem trên mọi thiết bị.
        </div>
      )}
    </div>
  );
}
