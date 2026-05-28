"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Receipt, Search, Truck, CheckCircle2, Package, Clock, ChevronRight, FileText } from "lucide-react";
import { useRequest, type SavedOrder } from "@/components/request-provider";
import { useAuth } from "@/components/auth-provider";
import { Card } from "@/components/ui/card";
import { LoginPromptBanner } from "@/components/ui/login-prompt-banner";
import { cn, formatVND } from "@/lib/utils";

const STATUS_META: Record<SavedOrder["status"], { label: string; icon: typeof Truck; color: string }> = {
  placed:    { label: "Đã đặt",        icon: Receipt,      color: "rounded-sm bg-amber-100 text-amber-700" },
  confirmed: { label: "Đã xác nhận",   icon: CheckCircle2, color: "rounded-sm bg-violet-100 text-violet-700" },
  packed:    { label: "Đang đóng gói", icon: Package,      color: "rounded-sm bg-blue-100 text-blue-700" },
  shipped:   { label: "Đang giao",     icon: Truck,        color: "rounded-sm bg-sky-100 text-sky-700" },
  delivered: { label: "Đã giao",       icon: CheckCircle2, color: "rounded-sm bg-emerald-100 text-emerald-700" },
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
      <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 md:px-8">
        <div className="mb-7 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-950">Lịch sử đơn hàng</h1>
            <p className="text-base text-slate-600">Đang tải...</p>
          </div>
        </div>
        <Card className="p-12 text-center text-sm text-muted-foreground">Đang tải...</Card>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 md:px-8">
        <div className="mb-7 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-950">Lịch sử đơn hàng</h1>
            <p className="text-base text-slate-600">Theo dõi trạng thái giao hàng</p>
          </div>
          <Link
            href="/app"
            className="inline-flex h-12 items-center border-0 rounded-sm bg-gradient-to-r from-violet-600 to-blue-600 px-6 text-base font-semibold text-white outline-none transition-opacity hover:opacity-95"
          >
            + Tạo yêu cầu mới
          </Link>
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
    <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 md:px-8">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-950">Lịch sử đơn hàng</h1>
          <p className="text-base text-slate-600">{orders.length} đơn đã đặt · theo dõi trạng thái giao hàng</p>
        </div>
        <Link
          href="/app"
          className="inline-flex h-12 items-center border-0 rounded-sm bg-gradient-to-r from-violet-600 to-blue-600 px-6 text-base font-semibold text-white outline-none transition-opacity hover:opacity-95"
        >
          + Tạo yêu cầu mới
        </Link>
      </div>

      {/* Search + tabs */}
      <div className="mb-5 flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
        <div className="relative w-full lg:max-w-[460px]">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-600" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo mã đơn..."
            className="h-[60px] w-full rounded-sm border border-slate-300 bg-white pl-14 pr-4 text-base outline-none placeholder:text-slate-500 focus:border-slate-400"
          />
        </div>
        <div className="flex items-center gap-5 overflow-x-auto pb-0.5 text-sm scrollbar-none">
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
                  "inline-flex h-[60px] shrink-0 appearance-none items-center gap-2 border-0 bg-transparent px-3 font-semibold outline-none ring-0 transition-colors",
                  active ? "bg-violet-50 text-violet-700 shadow-[inset_0_-3px_0_rgba(124,58,237,0.35)]" : "text-slate-950 hover:text-violet-700",
                )}
              >
                {t.label}
                <span className={cn("rounded px-1.5 text-xs tabular-nums", active ? "bg-white/70 text-violet-700" : "text-slate-950")}>
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
        <div className="space-y-2.5">
          {visible.map((o) => {
            const meta = STATUS_META[o.status];
            const Icon = meta.icon;
            return (
              <Link
                key={o.id}
                href={`/orders/${o.id}`}
                className="group block rounded-2xl border border-slate-200 p-5 transition-all hover:border-violet-500 hover:shadow-[0_10px_30px_rgba(79,70,229,0.10)]"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("grid h-[60px] w-[60px] shrink-0 place-items-center rounded-none", meta.color)}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-base font-semibold text-[#4F46E5]">#{o.id}</span>
                      <span className={cn("inline-flex items-center px-2.5 py-1 text-sm font-medium", meta.color)}>
                        {meta.label}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-950">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(o.createdAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}
                      </span>
                      <span>·</span>
                      <span>{o.itemCount} mặt hàng</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xl font-bold tabular-nums text-[#3F3BEF]">{formatVND(o.totalAmount)}</div>
                    <div className="mt-1 text-xs text-slate-950">
                      {o.paymentMethod === "qr"
                        ? "Chuyển khoản QR"
                        : o.paymentMethod === "credit"
                          ? "Công nợ"
                          : o.paymentMethod === "card"
                            ? "Thẻ"
                            : "BNPL"}
                    </div>
                  </div>
                  <ChevronRight className="h-6 w-6 shrink-0 text-slate-950 transition-colors group-hover:text-violet-600" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {orders.length > 0 && (
        <div className="mt-8 text-center text-sm text-slate-950">
          Lịch sử lưu trên trình duyệt này. Production sẽ đồng bộ với BE để xem trên mọi thiết bị.
        </div>
      )}
    </div>
  );
}
