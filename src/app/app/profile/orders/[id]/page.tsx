"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {
  User,
  ShoppingCart,
  FileText,
  MapPin,
  ChevronRight,
  ArrowLeft,
  Printer,
  RefreshCw,
  Phone,
  Mail,
  Check,
  Circle,
  Truck,
  Package,
  CreditCard,
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
  placed: { label: "Đã đặt", bg: "bg-[#DBEAFE]", text: "text-[#1D4ED8]" },
  confirmed: { label: "Đã xác nhận", bg: "bg-[#E0E7FF]", text: "text-[#4338CA]" },
  packed: { label: "Đã đóng gói", bg: "bg-[#FEF3C7]", text: "text-[#B45309]" },
  shipped: { label: "Đang vận chuyển", bg: "bg-[#FEF9C3]", text: "text-[#A16207]" },
  delivered: { label: "Đã giao", bg: "bg-[#DCFCE7]", text: "text-[#16A34A]" },
  cancelled: { label: "Đã hủy", bg: "bg-[#FEE2E2]", text: "text-[#DC2626]" },
};

const PAYMENT_METHODS: Record<string, { label: string; icon: React.ElementType }> = {
  qr: { label: "QR Code", icon: CreditCard },
  credit: { label: "Thẻ tín dụng", icon: CreditCard },
  card: { label: "Thẻ", icon: CreditCard },
  bnpl: { label: "Mua trước trả sau", icon: CreditCard },
};

const TIMELINE_STEPS = [
  { key: "placed", label: "Đặt hàng", icon: ShoppingCart },
  { key: "confirmed", label: "Xác nhận", icon: Check },
  { key: "packed", label: "Đóng gói", icon: Package },
  { key: "shipped", label: "Vận chuyển", icon: Truck },
  { key: "delivered", label: "Giao hàng", icon: Check },
];

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.placed;
  return (
    <span className={cn("inline-flex h-8 items-center rounded-full px-3 text-[13px] font-semibold ring-1 ring-inset ring-current/10", config.bg, config.text)}>
      {config.label}
    </span>
  );
}

function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <div className="px-4 pt-5 sm:px-6 lg:px-8">
      <nav className="mx-auto flex h-10 max-w-[1280px] items-center gap-2 overflow-hidden rounded-full bg-white/65 px-4 text-sm shadow-sm ring-1 ring-indigo-100/70 backdrop-blur">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />}
            {index === items.length - 1 ? (
              <span className="truncate font-semibold text-slate-900">{item.label}</span>
            ) : item.href ? (
              <Link href={item.href} className="shrink-0 font-medium text-slate-400 transition-colors hover:text-indigo-600">
                {item.label}
              </Link>
            ) : (
              <span className="shrink-0 font-medium text-slate-400">{item.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
    </div>
  );
}

function OrderTimeline({ status }: { status: string }) {
  const statusOrder = ["placed", "confirmed", "packed", "shipped", "delivered"];
  const currentIndex = statusOrder.indexOf(status);

  return (
    <div className="rounded-3xl border border-indigo-100/80 bg-white/90 p-6 shadow-[0_16px_45px_rgba(79,70,229,0.06)]">
      <h3 className="mb-6 text-base font-semibold text-slate-950">Tiến trình đơn hàng</h3>
      <div className="flex items-center justify-between overflow-x-auto pb-1">
        {TIMELINE_STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="relative flex min-w-[84px] flex-1 flex-col items-center">
              {/* Connector line */}
              {index < TIMELINE_STEPS.length - 1 && (
                <div className="absolute left-1/2 top-5 -z-10 h-0.5 w-full">
                  <div className={cn("h-full transition-colors", index < currentIndex ? "bg-emerald-400" : "bg-indigo-100")} />
                </div>
              )}
              
              {/* Icon circle */}
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full transition-all",
                  isCompleted ? "bg-emerald-500 text-white" : "bg-indigo-50 text-slate-400 ring-1 ring-indigo-100",
                  isCurrent && "ring-4 ring-emerald-100"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              
              {/* Label */}
              <span className={cn("mt-2 text-xs font-medium", isCompleted ? "text-slate-700" : "text-slate-400")}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderSummaryCard({ order }: { order: NonNullable<ReturnType<ReturnType<typeof useRequest>["getOrder"]>> }) {
  const paymentConfig = PAYMENT_METHODS[order.paymentMethod] || PAYMENT_METHODS.qr;
  const PaymentIcon = paymentConfig.icon;

  return (
    <div className="rounded-3xl border border-indigo-100/80 bg-white/90 p-6 shadow-[0_16px_45px_rgba(79,70,229,0.06)]">
      <h3 className="mb-4 text-base font-semibold text-slate-950">Thông tin đơn hàng</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Mã đơn hàng</span>
          <span className="text-sm font-semibold text-slate-950">
            #{order.id.replace(/-/g, "").slice(0, 8).toUpperCase()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Ngày đặt</span>
          <span className="text-right text-sm text-slate-700">
            {new Date(order.createdAt).toLocaleDateString("vi-VN", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Số sản phẩm</span>
          <span className="text-sm text-slate-700">{order.itemCount} sản phẩm</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Phương thức thanh toán</span>
          <div className="flex items-center gap-2">
            <PaymentIcon className="h-4 w-4 text-indigo-400" />
            <span className="text-sm text-slate-700">{paymentConfig.label}</span>
          </div>
        </div>
        <div className="border-t border-indigo-100/80 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-medium text-slate-700">Tổng tiền</span>
            <span className="text-xl font-semibold text-slate-950">
              {formatVND(order.totalAmount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShippingCard({ shipping }: { shipping: ReturnType<typeof useRequest>["orders"][0]["shipping"] }) {
  return (
    <div className="rounded-3xl border border-indigo-100/80 bg-white/90 p-6 shadow-[0_16px_45px_rgba(79,70,229,0.06)]">
      <h3 className="mb-4 text-base font-semibold text-slate-950">Thông tin giao hàng</h3>
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-indigo-400" />
          <div>
            <p className="text-sm font-medium text-slate-950">{shipping.recipient}</p>
            <p className="text-sm text-slate-500">{shipping.phone}</p>
            <p className="mt-1 text-sm text-slate-500">{shipping.address}</p>
          </div>
        </div>
        {shipping.note && (
          <div className="border-t border-indigo-100/80 pt-3">
            <p className="text-[13px] text-slate-400">
              <span className="font-medium">Ghi chú:</span> {shipping.note}
            </p>
          </div>
        )}
        {shipping.vatRequired && (
          <div className="border-t border-indigo-100/80 pt-3">
            <div className="flex items-center gap-2 text-[13px] text-slate-500">
              <Check className="h-4 w-4 text-emerald-500" />
              <span>Yêu cầu xuất hóa đơn VAT</span>
            </div>
            <p className="ml-6 mt-1 text-[13px] text-slate-500">
              {shipping.companyName} - MST: {shipping.taxId}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductLinesTable({ lines }: { lines: ReturnType<typeof useRequest>["orders"][0]["lines"] }) {
  if (!lines || lines.length === 0) {
    return (
      <div className="rounded-3xl border border-indigo-100/80 bg-white/90 p-8 text-center shadow-[0_16px_45px_rgba(79,70,229,0.06)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
          <Package className="h-7 w-7 text-[#4F46E5]" />
        </div>
        <p className="text-[15px] font-medium text-slate-500">Không có thông tin chi tiết sản phẩm</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-indigo-100/80 bg-white/90 shadow-[0_16px_45px_rgba(79,70,229,0.06)]">
      <div className="border-b border-indigo-100/80 bg-indigo-50/55 px-6 py-4">
        <h3 className="text-base font-semibold text-slate-950">Chi tiết sản phẩm</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="border-b border-indigo-100/80">
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">#</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">Sản phẩm</th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">Số lượng</th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">Đơn giá</th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">Thành tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-indigo-50">
            {lines.map((line, index) => {
              const price = line.match?.unitPrice || 0;
              const total = price * line.qty;
              
              return (
                <tr key={line.id || index} className="transition-colors hover:bg-indigo-50/35">
                  <td className="px-6 py-4 text-sm text-slate-400">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-slate-950">{line.match?.name || line.raw}</p>
                      {line.match?.sku && (
                        <p className="mt-0.5 text-[13px] text-slate-400">SKU: {line.match.sku}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-slate-700">
                    {line.qty} {line.unit || "cái"}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-slate-700">{formatVND(price)}</td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-slate-950">{formatVND(total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const pathname = usePathname();
  const params = useParams();
  const { user, logout } = useAuth();
  const { getOrder } = useRequest();

  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  const orderId = params.id as string;
  const order = getOrder(orderId);
  const activeNav = NAV_ITEMS.find(item => item.path === "/app/profile/orders")?.key || "orders";

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

  if (!order) {
    return (
      <div className="relative min-h-screen overflow-x-hidden bg-[#F7F8FF]">
        <div className="pointer-events-none absolute left-[260px] top-0 h-72 w-72 rounded-full bg-indigo-200/35 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-28 h-80 w-80 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="flex">
          {/* Sidebar - same as orders page */}
          <aside
            className={cn(
              "fixed left-0 top-0 z-40 w-[220px] shrink-0",
              "transform -translate-x-full lg:translate-x-0 transition-transform duration-200",
              "bg-white/90 border-r border-indigo-100/80 backdrop-blur-xl shadow-[12px_0_40px_rgba(79,70,229,0.04)]",
              "h-screen flex flex-col",
              mobileNavOpen && "translate-x-0"
            )}
          >
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

            <div className="border-t border-indigo-100/80 px-3 py-4">
              <button
                onClick={logout}
                className="flex h-11 w-full items-center gap-3 rounded-[14px] px-[14px] text-[#EF4444] transition-all duration-200 hover:bg-red-50"
              >
                <span className="text-[14px] font-medium">Đăng xuất</span>
              </button>
            </div>
          </aside>

          {mobileNavOpen && (
            <div className="fixed inset-0 bg-black/10 z-30 lg:hidden" onClick={() => setMobileNavOpen(false)} />
          )}

          <main className="relative z-10 min-w-0 flex-1 pt-[76px] lg:ml-[220px] lg:pt-0">
            <div className="fixed left-0 right-0 top-0 z-30 border-b border-indigo-100/80 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
              <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="flex w-full items-center gap-3 rounded-2xl bg-indigo-50/70 px-3 py-2 ring-1 ring-indigo-100">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#4F46E5] shadow-sm">
                  <ShoppingCart className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold text-slate-950">Chi tiết đơn hàng</span>
                <ChevronRight className={cn("ml-auto h-4 w-4 text-slate-400 transition-transform", mobileNavOpen && "rotate-90")} />
              </button>
            </div>

            <Breadcrumb
              items={[
                { label: "Trang chủ", href: "/app" },
                { label: "Tài khoản", href: "/app/profile" },
                { label: "Đơn hàng", href: "/app/profile/orders" },
                { label: `#${orderId.replace(/-/g, "").slice(0, 8).toUpperCase()}` },
              ]}
            />

            <div className="mx-auto max-w-[1280px] px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pt-8">
              {/* Back link */}
              <Link
                href="/app/profile/orders"
                className="inline-flex items-center gap-2 text-[14px] font-medium text-[#6B7280] hover:text-[#111827] transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại danh sách đơn hàng
              </Link>

              {/* Error State - Order not found */}
              <div className="rounded-3xl border border-indigo-100/80 bg-white/90 p-12 text-center shadow-[0_24px_80px_rgba(79,70,229,0.08)]">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
                  <Package className="h-8 w-8 text-red-500" />
                </div>
                <h2 className="mb-2 text-xl font-semibold text-slate-950">Không tìm thấy đơn hàng</h2>
                <p className="mb-6 text-[15px] text-slate-500">
                  Đơn hàng này không tồn tại hoặc đã bị xóa.
                </p>
                <Link
                  href="/app/profile/orders"
                  className="brand-gradient inline-flex h-11 items-center rounded-2xl px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all duration-200 hover:-translate-y-0.5"
                  style={{ boxShadow: "0 2px 8px rgba(99, 91, 255, 0.25)" }}
                >
                  Quay lại danh sách đơn hàng
                </Link>
              </div>
            </div>
          </main>
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

          <div className="border-t border-indigo-100/80 px-3 py-4">
            <button
              onClick={logout}
              className="flex h-11 w-full items-center gap-3 rounded-[14px] px-[14px] text-[#EF4444] transition-all duration-200 hover:bg-red-50"
            >
              <span className="text-[14px] font-medium">Đăng xuất</span>
            </button>
          </div>
        </aside>

        {mobileNavOpen && (
          <div className="fixed inset-0 bg-black/10 z-30 lg:hidden" onClick={() => setMobileNavOpen(false)} />
        )}

        <main className="relative z-10 min-w-0 flex-1 pt-[76px] lg:ml-[220px] lg:pt-0">
          <div className="fixed left-0 right-0 top-0 z-30 border-b border-indigo-100/80 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
            <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="flex w-full items-center gap-3 rounded-2xl bg-indigo-50/70 px-3 py-2 ring-1 ring-indigo-100">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#4F46E5] shadow-sm">
                <ShoppingCart className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold text-slate-950">Chi tiết đơn hàng</span>
              <ChevronRight className={cn("ml-auto h-4 w-4 text-slate-400 transition-transform", mobileNavOpen && "rotate-90")} />
            </button>
          </div>

          <Breadcrumb
            items={[
              { label: "Trang chủ", href: "/app" },
              { label: "Tài khoản", href: "/app/profile" },
              { label: "Đơn hàng", href: "/app/profile/orders" },
              { label: `#${orderId.replace(/-/g, "").slice(0, 8).toUpperCase()}` },
            ]}
          />

          <div className="mx-auto max-w-[1280px] px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pt-8">
            {/* Back link */}
            <Link
              href="/app/profile/orders"
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-[#4F46E5]"
            >
                <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách đơn hàng
            </Link>

            {/* Order Header */}
            <div className="mb-8 rounded-3xl border border-indigo-100/80 bg-white/90 p-6 shadow-[0_24px_80px_rgba(79,70,229,0.08)] backdrop-blur sm:p-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#4F46E5]">Chi tiết đơn hàng</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold text-slate-950">
                      #{orderId.replace(/-/g, "").slice(0, 8).toUpperCase()}
                    </h1>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="mt-2 text-[15px] text-slate-500">
                    Theo dõi thông tin thanh toán, giao hàng và sản phẩm trong đơn.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button className="flex h-11 items-center gap-2 rounded-2xl border border-indigo-100 bg-white px-5 text-sm font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:text-[#4F46E5]">
                    <Printer className="h-4 w-4" />
                    In hóa đơn
                  </button>
                  <button className="brand-gradient flex h-11 items-center gap-2 rounded-2xl px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all duration-200 hover:-translate-y-0.5">
                    <RefreshCw className="h-4 w-4" />
                    Mua lại
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left column - 2/3 width */}
              <div className="lg:col-span-2 space-y-6">
                <OrderSummaryCard order={order} />
                <ShippingCard shipping={order.shipping} />
              </div>

              {/* Right column - 1/3 width */}
              <div className="space-y-6">
                <OrderTimeline status={order.status} />
                
                {/* Support Card */}
                <div className="rounded-3xl border border-indigo-100/80 bg-white/90 p-6 shadow-[0_16px_45px_rgba(79,70,229,0.06)]">
                  <h3 className="mb-4 text-base font-semibold text-slate-950">Hỗ trợ</h3>
                  <div className="space-y-3">
                    <a href="tel:19001234" className="flex items-center gap-3 rounded-2xl bg-indigo-50/70 p-3 transition-colors hover:bg-indigo-100">
                      <Phone className="h-5 w-5 text-[#4F46E5]" />
                      <div>
                        <p className="text-sm font-medium text-slate-950">Hotline</p>
                        <p className="text-[13px] text-slate-500">1900 1234</p>
                      </div>
                    </a>
                    <a href="mailto:support@mecsu.vn" className="flex items-center gap-3 rounded-2xl bg-indigo-50/70 p-3 transition-colors hover:bg-indigo-100">
                      <Mail className="h-5 w-5 text-[#4F46E5]" />
                      <div>
                        <p className="text-sm font-medium text-slate-950">Email</p>
                        <p className="text-[13px] text-slate-500">support@mecsu.vn</p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Lines Table */}
            <ProductLinesTable lines={order.lines} />
          </div>
        </main>
      </div>
    </div>
  );
}
