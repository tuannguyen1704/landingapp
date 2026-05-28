"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  ShoppingCart,
  FileText,
  MapPin,
  ChevronRight,
  Search,
  ShoppingBag,
  Clock,
  Package,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useRequest } from "@/components/request-provider";
import { cn, formatVND } from "@/lib/utils";

type NavKey = "personal" | "orders" | "quotes" | "address";

const NAV_ITEMS: { key: NavKey; label: string; icon: React.ElementType; path: string }[] = [
  { key: "personal", label: "Trang cá nhân", icon: User, path: "/app/profile" },
  { key: "orders", label: "Đơn hàng", icon: ShoppingCart, path: "/app/profile/orders" },
  { key: "quotes", label: "Báo giá", icon: FileText, path: "/app/profile/quotes" },
  { key: "address", label: "Địa chỉ giao hàng", icon: MapPin, path: "/app/profile/address" },
];

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: "Đang xử lý", bg: "bg-[#FEF3C7]", text: "text-[#92400E]" },
  processing: { label: "Đang xử lý", bg: "bg-[#FEF3C7]", text: "text-[#92400E]" },
  completed: { label: "Đã giao", bg: "bg-[#DCFCE7]", text: "text-[#166534]" },
  delivered: { label: "Đã giao", bg: "bg-[#DCFCE7]", text: "text-[#166534]" },
  confirmed: { label: "Đã xác nhận", bg: "bg-[#DCFCE7]", text: "text-[#166534]" },
  cancelled: { label: "Đã hủy", bg: "bg-[#FEE2E2]", text: "text-[#991B1B]" },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={cn("inline-flex h-8 items-center rounded-full px-3 text-[13px] font-semibold ring-1 ring-inset ring-current/10", config.bg, config.text)}>
      {config.label}
    </span>
  );
}

function Breadcrumb({ pathname }: { pathname: string }) {
  const items = [
    { label: "Trang chủ", href: "/app" },
    { label: "Tài khoản", href: "/app/profile" },
    { label: "Đơn hàng", href: "/app/profile/orders" },
  ];

  return (
    <div className="px-4 pt-5 sm:px-6 lg:px-8">
      <nav className="mx-auto flex h-10 max-w-[1280px] items-center gap-2 rounded-full bg-white/65 px-4 text-sm shadow-sm ring-1 ring-indigo-100/70 backdrop-blur">
        {items.map((item, index) => (
          <React.Fragment key={item.href}>
            {index > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            )}
            {index === items.length - 1 ? (
              <span className="font-semibold text-slate-900">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="font-medium text-slate-400 transition-colors hover:text-indigo-600"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </nav>
    </div>
  );
}

function OrderCard({ order }: { order: any }) {
  return (
    <Link
      href={`/app/profile/orders/${order.id}`}
      className="group block rounded-3xl border border-indigo-100/80 bg-white/90 p-5 shadow-[0_12px_35px_rgba(79,70,229,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-white hover:shadow-[0_18px_45px_rgba(79,70,229,0.10)] sm:p-6"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100">
            <ShoppingCart className="h-5 w-5 text-[#4F46E5]" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-lg font-semibold text-slate-950">
              #{order.id.replace(/-/g, "").slice(0, 8).toUpperCase()}
            </span>
            <span className="text-sm font-medium text-slate-500">
              {new Date(order.createdAt).toLocaleDateString("vi-VN")} · {order.itemCount || 1} sản phẩm
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 lg:gap-5">
          <StatusBadge status={order.status} />
          <span className="text-lg font-semibold text-slate-950 lg:text-xl">{formatVND(order.totalAmount)}</span>
          <span className="inline-flex h-10 items-center rounded-2xl bg-indigo-50 px-4 text-sm font-semibold text-[#4F46E5] ring-1 ring-indigo-100 transition-colors group-hover:bg-indigo-100">
            Xem chi tiết
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function OrdersPage() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { orders } = useRequest();

  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState("all");

  const activeNav = NAV_ITEMS.find(item => pathname === item.path)?.key || "orders";

  const filteredOrders = React.useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === "all" || order.status === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [orders, searchQuery, activeFilter]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8FF] px-4">
        <div className="rounded-3xl border border-indigo-100/80 bg-white/90 px-8 py-10 text-center shadow-[0_24px_80px_rgba(79,70,229,0.10)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100">
            <User className="h-6 w-6 text-indigo-500" />
          </div>
          <h2 className="text-lg font-semibold text-slate-950">Chưa đăng nhập</h2>
          <p className="mt-2 max-w-xs text-sm text-slate-500">
            Vui lòng đăng nhập để xem thông tin tài khoản của bạn.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#F7F8FF]">
      <div className="pointer-events-none absolute left-[260px] top-0 h-72 w-72 rounded-full bg-indigo-200/35 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-28 h-80 w-80 rounded-full bg-sky-200/30 blur-3xl" />
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed left-0 top-0 z-40 w-[220px] shrink-0",
            "transform -translate-x-full lg:translate-x-0 transition-transform duration-200",
            "bg-white/90 border-r border-indigo-100/80 backdrop-blur-xl shadow-[12px_0_40px_rgba(79,70,229,0.04)]",
            "h-screen flex flex-col",
            mobileNavOpen && "translate-x-0"
          )}
        >
          {/* Logo Section */}
          <div className="flex h-16 items-center px-5">
            <Link href="/app" className="flex items-center gap-3">
              <div
                className="brand-gradient flex h-10 w-10 items-center justify-center rounded-2xl shadow-lg shadow-indigo-200/70"
                style={{
                  boxShadow: "0 8px 20px rgba(99,91,255,0.12)",
                }}
              >
                <span className="text-sm font-bold text-white">V</span>
              </div>
              <div>
                <p className="text-base font-bold leading-tight text-[#4F46E5]">MAI</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Procurement</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4">
            <div className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.key;
                return (
                  <Link
                    key={item.key}
                    href={item.path}
                    className={cn(
                      "relative flex items-center gap-3 h-11 px-[14px] rounded-[14px] transition-all duration-200",
                      isActive
                        ? "bg-indigo-50 text-[#4F46E5] shadow-sm ring-1 ring-indigo-100"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
                    )}
                    style={{ transition: "all 180ms ease" }}
                  >
                    <Icon className="w-[18px] h-[18px]" />
                    <span className="text-[14px] font-medium">{item.label}</span>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r bg-[#4F46E5]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Bottom Section */}
          <div className="border-t border-indigo-100/80 px-3 py-4">
            <div className="space-y-1">
              <button
                onClick={logout}
                className="flex h-11 w-full items-center gap-3 rounded-[14px] px-[14px] text-[#EF4444] transition-all duration-200 hover:bg-red-50"
              >
                <span className="text-[14px] font-medium">Đăng xuất</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Nav Overlay */}
        {mobileNavOpen && (
          <div
            className="fixed inset-0 bg-black/10 z-30 lg:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="relative z-10 min-w-0 flex-1 pt-[76px] lg:ml-[220px] lg:pt-0">
          {/* Mobile Header */}
          <div className="fixed left-0 right-0 top-0 z-30 border-b border-indigo-100/80 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="flex w-full items-center gap-3 rounded-2xl bg-indigo-50/70 px-3 py-2 ring-1 ring-indigo-100"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#4F46E5] shadow-sm">
                <ShoppingCart className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold text-slate-950">Đơn hàng</span>
              <ChevronRight className={cn("ml-auto h-4 w-4 text-slate-400 transition-transform", mobileNavOpen && "rotate-90")} />
            </button>
          </div>

          {/* Breadcrumb */}
          <Breadcrumb pathname={pathname} />

          {/* Content */}
          <div className="mx-auto max-w-[1280px] px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pt-8">
            {/* Page Header */}
            <div className="mb-8 rounded-3xl border border-indigo-100/80 bg-white/90 p-6 shadow-[0_24px_80px_rgba(79,70,229,0.08)] backdrop-blur sm:p-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#4F46E5]">Lịch sử mua hàng</p>
                  <h1 className="text-3xl font-bold text-slate-950">Đơn hàng</h1>
                  <p className="mt-2 text-[15px] text-slate-500">Theo dõi trạng thái đơn hàng và lịch sử mua hàng của bạn.</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-[#4F46E5] ring-1 ring-indigo-100">
                  <Package className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-indigo-100/80 bg-white/80 p-3 shadow-[0_12px_35px_rgba(79,70,229,0.05)] backdrop-blur lg:flex-row lg:items-center lg:gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm mã đơn hàng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 w-full rounded-2xl border border-indigo-100 bg-white pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              {/* Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto">
                {["all", "processing", "delivered", "cancelled"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={cn(
                      "h-9 shrink-0 rounded-full px-4 text-[13px] font-semibold transition-all duration-200",
                      activeFilter === filter
                        ? "bg-indigo-50 text-[#4F46E5] ring-1 ring-indigo-100"
                        : "bg-white text-slate-500 ring-1 ring-indigo-100 hover:bg-slate-50 hover:text-slate-950"
                    )}
                  >
                    {filter === "all" && "Tất cả"}
                    {filter === "processing" && "Đang xử lý"}
                    {filter === "delivered" && "Đã giao"}
                    {filter === "cancelled" && "Đã hủy"}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="rounded-3xl border border-indigo-100/80 bg-white/90 py-16 text-center shadow-[0_16px_45px_rgba(79,70,229,0.06)]">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100">
                  <ShoppingBag className="h-8 w-8 text-[#4F46E5]" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-950">
                  Bạn chưa có đơn hàng nào.
                </h3>
                <p className="mb-6 text-sm text-slate-500">
                  Bắt đầu mua sắm để xem đơn hàng của bạn tại đây.
                </p>
                <Link
                  href="/app"
                  className="brand-gradient inline-flex h-11 items-center rounded-2xl px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all duration-200 hover:-translate-y-0.5"
                  style={{ boxShadow: "0 2px 8px rgba(99, 91, 255, 0.25)" }}
                >
                  Mua sắm ngay
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
