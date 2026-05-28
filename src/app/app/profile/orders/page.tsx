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
    <span className={cn("inline-flex items-center h-8 px-3 rounded-full text-[13px] font-medium", config.bg, config.text)}>
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

function OrderCard({ order }: { order: any }) {
  return (
    <Link
      href={`/app/profile/orders/${order.id}`}
      className="bg-white rounded-3xl border border-[#ECECF1] p-6 flex items-center justify-between hover:shadow-md transition-all duration-200 cursor-pointer block"
    >
      <div className="flex items-center gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-[18px] font-bold text-[#111827]">
            #{order.id.replace(/-/g, "").slice(0, 8).toUpperCase()}
          </span>
          <span className="text-[14px] text-[#6B7280]">
            {new Date(order.createdAt).toLocaleDateString("vi-VN")} · {order.itemCount || 1} sản phẩm
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <StatusBadge status={order.status} />
        <span className="text-[20px] font-bold text-[#111827]">{formatVND(order.totalAmount)}</span>
        <button className="h-10 px-4 text-[14px] font-medium text-[#111827] bg-[#F5F5F8] rounded-xl hover:bg-[#ECECF1] transition-colors">
          Xem chi tiết
        </button>
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
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 h-11 px-[14px] rounded-[14px] text-[#EF4444] hover:bg-red-50 transition-all duration-200"
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
        <main className="flex-1 min-w-0 lg:ml-0">
          {/* Mobile Header */}
          <div className="lg:hidden fixed top-14 left-0 right-0 z-30 bg-white border-b border-[#ECECF1] px-4 py-3">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="flex items-center gap-3 w-full"
            >
              <div className="w-9 h-9 rounded-xl bg-[#F3F1FF] flex items-center justify-center">
                <ShoppingCart className="h-4 w-4 text-[#635BFF]" />
              </div>
              <span className="text-sm font-medium text-[#111827]">Đơn hàng</span>
              <ChevronRight className={cn("h-4 w-4 text-[#9CA3AF] ml-auto transition-transform", mobileNavOpen && "rotate-90")} />
            </button>
          </div>

          {/* Breadcrumb */}
          <Breadcrumb pathname={pathname} />

          {/* Content */}
          <div className="px-8 pt-8 pb-10">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-[32px] font-bold text-[#111827]" style={{ letterSpacing: "-0.03em" }}>
                Đơn hàng
              </h1>
              <p className="text-[15px] text-[#6B7280] mt-2">
                Theo dõi trạng thái đơn hàng và lịch sử mua hàng của bạn.
              </p>
            </div>

            {/* Search & Filters */}
            <div className="flex items-center gap-4 mb-6">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9CA3AF]" />
                <input
                  type="text"
                  placeholder="Tìm mã đơn hàng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 text-[14px] bg-white border border-[#ECECF1] rounded-[14px] outline-none focus:border-[#635BFF] transition-colors"
                />
              </div>

              {/* Filter Chips */}
              <div className="flex items-center gap-2">
                {["all", "processing", "delivered", "cancelled"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={cn(
                      "h-9 px-4 text-[13px] font-medium rounded-full transition-all duration-200",
                      activeFilter === filter
                        ? "bg-[#F3F1FF] text-[#635BFF]"
                        : "bg-white border border-[#ECECF1] text-[#6B7280] hover:bg-[#F5F5F8]"
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
              <div className="bg-white rounded-3xl border border-[#ECECF1] py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#F5F5F8] flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-[#9CA3AF]" />
                </div>
                <h3 className="text-[18px] font-semibold text-[#111827] mb-2">
                  Bạn chưa có đơn hàng nào.
                </h3>
                <p className="text-[14px] text-[#6B7280] mb-6">
                  Bắt đầu mua sắm để xem đơn hàng của bạn tại đây.
                </p>
                <Link
                  href="/app"
                  className="inline-flex h-11 px-6 text-[14px] font-semibold text-white bg-[#635BFF] rounded-[14px] hover:bg-[#5B52F5] transition-colors"
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
