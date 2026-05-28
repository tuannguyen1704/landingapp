"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Clock,
  ShoppingCart,
  FileText,
  MapPin,
  ChevronRight,
  Building2,
  ShoppingBag,
  CheckCircle,
  Eye,
  MoreHorizontal,
  Settings,
  LogOut,
  Package,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { UserAvatar } from "@/components/user-avatar";
import { useRequest } from "@/components/request-provider";
import { formatVND, cn } from "@/lib/utils";

type NavKey = "personal" | "orders" | "quotes" | "history" | "address" | "security";

const NAV_ITEMS: { key: NavKey; label: string; icon: React.ElementType; path: string }[] = [
  { key: "personal", label: "Trang cá nhân", icon: User, path: "/app/profile" },
  { key: "orders", label: "Đơn hàng", icon: ShoppingCart, path: "/app/profile/orders" },
  { key: "quotes", label: "Báo giá", icon: FileText, path: "/app/profile/quotes" },
  { key: "address", label: "Địa chỉ giao hàng", icon: MapPin, path: "/app/profile/address" },
];

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: "Đang chờ", bg: "bg-amber-50", text: "text-amber-700" },
  processing: { label: "Đang xử lý", bg: "bg-blue-50", text: "text-blue-700" },
  completed: { label: "Hoàn tất", bg: "bg-emerald-50", text: "text-emerald-700" },
  delivered: { label: "Đã giao", bg: "bg-emerald-50", text: "text-emerald-700" },
  cancelled: { label: "Đã hủy", bg: "bg-red-50", text: "text-red-700" },
  confirmed: { label: "Đã xác nhận", bg: "bg-violet-50", text: "text-violet-700" },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ring-current/10", config.bg, config.text)}>
      {config.label}
    </span>
  );
}

function StatCard({ label, value, change, icon: Icon, accent, bg }: { label: string; value: string; change: string; icon: React.ElementType; accent: string; bg: string }) {
  return (
    <div
      className="group flex min-h-[128px] flex-col justify-between rounded-2xl border border-indigo-100/70 bg-white/90 p-5 shadow-[0_16px_45px_rgba(79,70,229,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_20px_55px_rgba(79,70,229,0.10)]"
      style={{
        transition: "all 180ms ease",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-500">{label}</span>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${bg} ring-1 ring-black/5`}>
          <Icon className="h-[18px] w-[18px]" style={{ color: accent }} />
        </div>
      </div>
      <div>
        <div className="mb-2 text-3xl font-bold leading-none text-slate-950">
          {value}
        </div>
        <span className="text-sm font-medium text-slate-500">
          {change}
        </span>
      </div>
    </div>
  );
}

function Breadcrumb({ pathname }: { pathname: string }) {
  const items = [
    { label: "Trang chủ", href: "/app" },
    { label: "Tài khoản", href: "/app/profile" },
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

export default function ProfilePage() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { orders } = useRequest();

  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const activeNav = NAV_ITEMS.find(item => pathname === item.path)?.key || "personal";

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

  const totalOrders = orders.length || 24;
  const completedOrders = orders.filter(o => o.status === "delivered" || o.status === "confirmed").length || 18;
  const pendingQuotes = 3;
  const totalProducts = orders.reduce((sum, o) => sum + (o.itemCount || 0), 0) || 156;

  const stats = [
    { label: "Tổng đơn hàng", value: totalOrders.toString(), change: "2 đơn đã giao", icon: ShoppingBag, accent: "#635BFF", bg: "bg-[#F3F1FF]" },
    { label: "Báo giá đang chờ", value: pendingQuotes.toString(), change: "Cần phản hồi từ MECSU", icon: Clock, accent: "#D97706", bg: "bg-[#FEF3C7]" },
    { label: "Đơn hàng hoàn tất", value: completedOrders.toString(), change: "Đã giao thành công", icon: CheckCircle, accent: "#16A34A", bg: "bg-[#DCFCE7]" },
    { label: "Sản phẩm đã mua", value: totalProducts.toString(), change: `Trong ${totalOrders} đơn hàng`, icon: Package, accent: "#2563EB", bg: "bg-[#DBEAFE]" },
  ];

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
              <Link
                href="/app/profile/settings"
                className="flex h-11 items-center gap-3 rounded-[14px] px-[14px] text-slate-500 transition-all duration-200 hover:bg-slate-50 hover:text-slate-950"
              >
                <Settings className="w-[18px] h-[18px]" />
                <span className="text-[14px] font-medium">Cài đặt</span>
              </Link>
              <button
                onClick={logout}
                className="flex h-11 w-full items-center gap-3 rounded-[14px] px-[14px] text-[#EF4444] transition-all duration-200 hover:bg-red-50"
              >
                <LogOut className="w-[18px] h-[18px]" />
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
                <User className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold text-slate-950">Tài khoản</span>
              <ChevronRight className={cn("ml-auto h-4 w-4 text-slate-400 transition-transform", mobileNavOpen && "rotate-90")} />
            </button>
          </div>

          {/* Breadcrumb */}
          <Breadcrumb pathname={pathname} />

          {/* Content */}
          <div className="mx-auto max-w-[1280px] px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pt-8">

            {/* Profile Header */}
            <div className="relative mb-8 overflow-hidden rounded-3xl border border-indigo-100/80 bg-white/90 p-6 shadow-[0_24px_80px_rgba(79,70,229,0.10)] backdrop-blur sm:p-8">
              <div className="absolute right-0 top-0 h-40 w-56 rounded-bl-full bg-gradient-to-br from-indigo-100 via-violet-100 to-sky-100 opacity-80" />
              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="relative">
                  <UserAvatar name={user.name} size="lg" className="!h-20 !w-20 !text-2xl ring-4 ring-white shadow-xl" />
                  <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full border-[3px] border-white bg-emerald-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-[#4F46E5] ring-1 ring-indigo-100">Tài khoản doanh nghiệp</span>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">Đã xác thực</span>
                  </div>
                  <h2 className="truncate text-3xl font-bold leading-tight text-slate-950">
                    {user.name}
                  </h2>
                  <p className="mt-1 truncate text-[15px] text-slate-500">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Building2 className="h-4 w-4 text-indigo-400" />
                    <span className="text-sm font-medium text-slate-500">Công ty TNHH MECSU</span>
                  </div>
                </div>
                <button
                  className="brand-gradient h-[42px] rounded-2xl px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-indigo-300 sm:self-start"
                  style={{ boxShadow: "0 2px 8px rgba(99, 91, 255, 0.25)" }}
                >
                  Chỉnh sửa
                </button>
              </div>
            </div>

            {/* Statistics */}
            <div className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat, i) => (
                <StatCard key={i} {...stat} />
              ))}
            </div>

            {/* Recent Orders */}
            <section className="mb-10">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-950">
                  Đơn hàng gần đây
                </h2>
                <Link
                  href="/app/profile/orders"
                  className="text-sm font-semibold text-[#4F46E5] transition-colors hover:text-[#3730A3]"
                >
                  Xem tất cả
                </Link>
              </div>

              {orders.length === 0 ? (
                <div className="rounded-3xl border border-indigo-100/80 bg-white/90 py-16 text-center shadow-[0_16px_45px_rgba(79,70,229,0.06)]">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                    <ShoppingCart className="h-7 w-7 text-[#4F46E5]" />
                  </div>
                  <p className="text-[15px] font-medium text-slate-500">Chưa có đơn hàng nào</p>
                  <Link
                    href="/app"
                    className="brand-gradient mt-4 inline-flex h-11 items-center rounded-2xl px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all duration-200 hover:-translate-y-0.5"
                    style={{ boxShadow: "0 2px 8px rgba(99, 91, 255, 0.25)" }}
                  >
                    Tạo yêu cầu báo giá
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-3xl border border-indigo-100/80 bg-white/90 shadow-[0_16px_45px_rgba(79,70,229,0.06)]">
                  <table className="w-full min-w-[720px]">
                    <thead>
                      <tr className="bg-indigo-50/55">
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">Mã đơn</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">Ngày đặt</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">Trạng thái</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">Tổng tiền</th>
                        <th className="w-20" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-50">
                      {orders.slice(0, 5).map((order) => (
                        <tr
                          key={order.id}
                          className="transition-colors hover:bg-indigo-50/35"
                          style={{ height: "72px", transition: "background-color 180ms ease" }}
                        >
                          <td className="px-6 py-5">
                            <span className="text-[15px] font-semibold text-slate-950">
                              #{order.id.replace(/-/g, "").slice(0, 8).toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-[15px] text-slate-500">
                              {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-[15px] font-semibold text-slate-950">{formatVND(order.totalAmount)}</span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-1">
                              <button className="p-2 rounded-lg text-[#9CA3AF] hover:text-[#635BFF] hover:bg-[#F3F1FF] transition-all duration-200">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-2 rounded-lg text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F5F5F8] transition-all duration-200">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Quotations */}
            <section>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-950">
                  Yêu cầu báo giá
                </h2>
                <Link
                  href="/app/profile/quotes"
                  className="text-sm font-semibold text-[#4F46E5] transition-colors hover:text-[#3730A3]"
                >
                  Xem tất cả
                </Link>
              </div>

              {orders.length === 0 ? (
                <div className="rounded-3xl border border-indigo-100/80 bg-white/90 py-16 text-center shadow-[0_16px_45px_rgba(79,70,229,0.06)]">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                    <FileText className="h-7 w-7 text-[#4F46E5]" />
                  </div>
                  <p className="text-[15px] font-medium text-slate-500">Chưa có yêu cầu báo giá nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 4).map((order) => (
                    <div
                      key={order.id}
                      className="flex cursor-pointer flex-col gap-4 rounded-2xl border border-indigo-100/80 bg-white/90 px-5 py-4 shadow-[0_12px_35px_rgba(79,70,229,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-white hover:shadow-[0_18px_45px_rgba(79,70,229,0.10)] sm:flex-row sm:items-center sm:justify-between sm:px-6"
                      style={{ transition: "all 180ms ease" }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100">
                          <FileText className="h-5 w-5 text-[#4F46E5]" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-semibold text-slate-950">
                            Yêu cầu #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="mt-0.5 text-sm text-slate-400">
                            {order.itemCount} sản phẩm · {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <StatusBadge status={order.status} />
                        <ChevronRight className="h-5 w-5 text-slate-300" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
