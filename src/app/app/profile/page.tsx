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
    <span className={cn("inline-flex px-2.5 py-1 rounded-full text-xs font-medium", config.bg, config.text)}>
      {config.label}
    </span>
  );
}

function StatCard({ label, value, change, icon: Icon, accent, bg }: { label: string; value: string; change: string; icon: React.ElementType; accent: string; bg: string }) {
  return (
    <div
      className="bg-white rounded-3xl border border-[#ECECF1] p-6 flex flex-col justify-between h-[140px] hover:-translate-y-0.5"
      style={{
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        transition: "all 180ms ease",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-medium text-[#6B7280]">{label}</span>
        <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon className="w-[18px] h-[18px]" style={{ color: accent }} />
        </div>
      </div>
      <div>
        <div className="text-[40px] font-bold text-[#111827] leading-none mb-2" style={{ letterSpacing: "-0.02em" }}>
          {value}
        </div>
        <span className="text-[14px] font-medium text-[#6B7280]">
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
    <div className="h-16 flex items-center px-8 border-b border-[#ECECF1] bg-white/80 backdrop-blur-sm">
      <nav className="flex items-center gap-2">
        {items.map((item, index) => (
          <React.Fragment key={item.href}>
            {index > 0 && (
              <ChevronRight className="w-3.5 h-3.5 text-[#D1D5DB]" />
            )}
            {index === items.length - 1 ? (
              <span className="text-[14px] font-semibold text-[#111827]">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-[14px] font-medium text-[#9CA3AF] hover:text-[#111827] transition-colors"
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
      <div className="min-h-screen bg-[#FAFAFB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-white border border-[#ECECF1] flex items-center justify-center mx-auto mb-4">
            <User className="h-5 w-5 text-[#9CA3AF]" />
          </div>
          <h2 className="text-lg font-medium text-[#111827]">Chưa đăng nhập</h2>
          <p className="mt-2 text-sm text-[#6B7280] max-w-xs">
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
    <div className="min-h-screen bg-[#FAFAFB]">
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed lg:sticky lg:top-0 top-0 left-0 z-40 w-[220px] shrink-0",
            "transform -translate-x-full lg:translate-x-0 transition-transform duration-200",
            "bg-white border-r border-[#ECECF1]",
            "h-screen flex flex-col",
            mobileNavOpen && "translate-x-0"
          )}
        >
          {/* Logo Section */}
          <div className="h-16 flex items-center px-6 border-b border-[#ECECF1]">
            <Link href="/app" className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-[14px] flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #7C6CFF 0%, #5B52F5 100%)",
                  boxShadow: "0 8px 20px rgba(99,91,255,0.12)",
                }}
              >
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <div>
                <p className="text-base font-bold text-[#111827] leading-tight">M.AI</p>
                <p className="text-xs text-[#9CA3AF]">MECSU</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-3">
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
                        ? "bg-[#F3F1FF] text-[#635BFF]"
                        : "text-[#6B7280] hover:bg-[#F5F5F8] hover:text-[#111827]"
                    )}
                    style={{ transition: "all 180ms ease" }}
                  >
                    <Icon className="w-[18px] h-[18px]" />
                    <span className="text-[14px] font-medium">{item.label}</span>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-[#635BFF] rounded-r" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Bottom Section */}
          <div className="py-4 px-3 border-t border-[#ECECF1]">
            <div className="space-y-1">
              <Link
                href="/app/profile/settings"
                className="flex items-center gap-3 h-11 px-[14px] rounded-[14px] text-[#6B7280] hover:bg-[#F5F5F8] hover:text-[#111827] transition-all duration-200"
              >
                <Settings className="w-[18px] h-[18px]" />
                <span className="text-[14px] font-medium">Cài đặt</span>
              </Link>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 h-11 px-[14px] rounded-[14px] text-[#EF4444] hover:bg-red-50 transition-all duration-200"
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
        <main className="flex-1 min-w-0 lg:ml-0">
          {/* Mobile Header */}
          <div className="lg:hidden fixed top-14 left-0 right-0 z-30 bg-white border-b border-[#ECECF1] px-4 py-3">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="flex items-center gap-3 w-full"
            >
              <div className="w-9 h-9 rounded-xl bg-[#F3F1FF] flex items-center justify-center">
                <User className="h-4 w-4 text-[#635BFF]" />
              </div>
              <span className="text-sm font-medium text-[#111827]">Tài khoản</span>
              <ChevronRight className={cn("h-4 w-4 text-[#9CA3AF] ml-auto transition-transform", mobileNavOpen && "rotate-90")} />
            </button>
          </div>

          {/* Breadcrumb */}
          <Breadcrumb pathname={pathname} />

          {/* Content */}
          <div className="px-8 pt-8 pb-10">

            {/* Profile Header */}
            <div className="bg-white rounded-3xl border border-[#ECECF1] p-8 mb-8" style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <UserAvatar name={user.name} size="lg" className="!h-16 !w-16 !text-xl" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-[28px] font-bold text-[#111827] leading-tight" style={{ letterSpacing: "-0.03em" }}>
                    {user.name}
                  </h2>
                  <p className="text-[15px] text-[#6B7280] mt-1">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Building2 className="w-4 h-4 text-[#9CA3AF]" />
                    <span className="text-sm text-[#9CA3AF]">Công ty TNHH MECSU</span>
                  </div>
                </div>
                <button
                  className="h-[42px] px-[18px] text-[14px] font-semibold text-white bg-[#635BFF] rounded-[14px] hover:bg-[#5B52F5] transition-all duration-200"
                  style={{ boxShadow: "0 2px 8px rgba(99, 91, 255, 0.25)" }}
                >
                  Chỉnh sửa
                </button>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-4 gap-5 mt-8 mb-10">
              {stats.map((stat, i) => (
                <StatCard key={i} {...stat} />
              ))}
            </div>

            {/* Recent Orders */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[24px] font-semibold text-[#111827]" style={{ letterSpacing: "-0.02em" }}>
                  Đơn hàng gần đây
                </h2>
                <Link
                  href="/app/profile/orders"
                  className="text-[14px] font-medium text-[#635BFF] hover:text-[#5B52F5] transition-colors"
                >
                  Xem tất cả
                </Link>
              </div>

              {orders.length === 0 ? (
                <div className="bg-white rounded-3xl border border-[#ECECF1] py-16 text-center">
                  <ShoppingCart className="w-10 h-10 text-[#D1D5DB] mx-auto mb-4" />
                  <p className="text-[15px] text-[#6B7280]">Chưa có đơn hàng nào</p>
                  <Link
                    href="/app"
                    className="inline-flex mt-4 h-11 px-[18px] text-[14px] font-semibold text-white bg-[#635BFF] rounded-[14px] hover:bg-[#5B52F5] transition-all duration-200"
                    style={{ boxShadow: "0 2px 8px rgba(99, 91, 255, 0.25)" }}
                  >
                    Tạo yêu cầu báo giá
                  </Link>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-[#ECECF1] overflow-hidden" style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#FAFAFB]">
                        <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#9CA3AF] uppercase tracking-[0.04em]">Mã đơn</th>
                        <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#9CA3AF] uppercase tracking-[0.04em]">Ngày đặt</th>
                        <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#9CA3AF] uppercase tracking-[0.04em]">Trạng thái</th>
                        <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#9CA3AF] uppercase tracking-[0.04em]">Tổng tiền</th>
                        <th className="w-20" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ECECF1]">
                      {orders.slice(0, 5).map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-[#FAFAFB] transition-colors"
                          style={{ height: "72px", transition: "background-color 180ms ease" }}
                        >
                          <td className="px-6 py-5">
                            <span className="text-[15px] font-semibold text-[#111827]">
                              #{order.id.replace(/-/g, "").slice(0, 8).toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-[15px] text-[#6B7280]">
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
                            <span className="text-[15px] font-semibold text-[#111827]">{formatVND(order.totalAmount)}</span>
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[24px] font-semibold text-[#111827]" style={{ letterSpacing: "-0.02em" }}>
                  Yêu cầu báo giá
                </h2>
                <Link
                  href="/app/profile/quotes"
                  className="text-[14px] font-medium text-[#635BFF] hover:text-[#5B52F5] transition-colors"
                >
                  Xem tất cả
                </Link>
              </div>

              {orders.length === 0 ? (
                <div className="bg-white rounded-3xl border border-[#ECECF1] py-16 text-center">
                  <FileText className="w-10 h-10 text-[#D1D5DB] mx-auto mb-4" />
                  <p className="text-[15px] text-[#6B7280]">Chưa có yêu cầu báo giá nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 4).map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-[#ECECF1] px-6 py-5 flex items-center justify-between hover:shadow-md transition-all duration-200 cursor-pointer"
                      style={{ transition: "all 180ms ease" }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#F3F1FF] flex items-center justify-center">
                          <FileText className="w-5 h-5 text-[#635BFF]" />
                        </div>
                        <div>
                          <p className="text-[15px] font-semibold text-[#111827]">
                            Yêu cầu #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="text-sm text-[#9CA3AF] mt-0.5">
                            {order.itemCount} sản phẩm · {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <StatusBadge status={order.status} />
                        <ChevronRight className="w-5 h-5 text-[#9CA3AF]" />
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
