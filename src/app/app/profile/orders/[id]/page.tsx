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
    <span className={cn("inline-flex items-center h-8 px-3 rounded-full text-[13px] font-medium", config.bg, config.text)}>
      {config.label}
    </span>
  );
}

function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <div className="h-16 flex items-center px-8 border-b border-[#ECECF1] bg-white/80 backdrop-blur-sm">
      <nav className="flex items-center gap-2">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#D1D5DB]" />}
            {index === items.length - 1 ? (
              <span className="text-[14px] font-semibold text-[#111827]">{item.label}</span>
            ) : item.href ? (
              <Link href={item.href} className="text-[14px] font-medium text-[#9CA3AF] hover:text-[#111827] transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-[14px] font-medium text-[#9CA3AF]">{item.label}</span>
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
    <div className="bg-white rounded-2xl border border-[#ECECF1] p-6">
      <h3 className="text-[16px] font-semibold text-[#111827] mb-6">Tiến trình đơn hàng</h3>
      <div className="flex items-center justify-between">
        {TIMELINE_STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center relative flex-1">
              {/* Connector line */}
              {index < TIMELINE_STEPS.length - 1 && (
                <div className="absolute top-5 left-1/2 w-full h-0.5 -z-10">
                  <div className={cn("h-full transition-colors", index < currentIndex ? "bg-[#16A34A]" : "bg-[#E5E7EB]")} />
                </div>
              )}
              
              {/* Icon circle */}
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  isCompleted ? "bg-[#16A34A]" : "bg-[#F3F4F6]",
                  isCurrent && "ring-4 ring-[#DCFCE7]"
                )}
              >
                <Icon className={cn("w-5 h-5", isCompleted ? "text-white" : "text-[#9CA3AF]")} />
              </div>
              
              {/* Label */}
              <span className={cn("text-xs mt-2 font-medium", isCompleted ? "text-[#111827]" : "text-[#9CA3AF]")}>
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
    <div className="bg-white rounded-2xl border border-[#ECECF1] p-6">
      <h3 className="text-[16px] font-semibold text-[#111827] mb-4">Thông tin đơn hàng</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[14px] text-[#6B7280]">Mã đơn hàng</span>
          <span className="text-[14px] font-semibold text-[#111827]">
            #{order.id.replace(/-/g, "").slice(0, 8).toUpperCase()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[14px] text-[#6B7280]">Ngày đặt</span>
          <span className="text-[14px] text-[#111827]">
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
          <span className="text-[14px] text-[#6B7280]">Số sản phẩm</span>
          <span className="text-[14px] text-[#111827]">{order.itemCount} sản phẩm</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[14px] text-[#6B7280]">Phương thức thanh toán</span>
          <div className="flex items-center gap-2">
            <PaymentIcon className="w-4 h-4 text-[#6B7280]" />
            <span className="text-[14px] text-[#111827]">{paymentConfig.label}</span>
          </div>
        </div>
        <div className="pt-4 border-t border-[#ECECF1]">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-medium text-[#111827]">Tổng tiền</span>
            <span className="text-[20px] font-bold text-[#111827]" style={{ letterSpacing: "-0.02em" }}>
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
    <div className="bg-white rounded-2xl border border-[#ECECF1] p-6">
      <h3 className="text-[16px] font-semibold text-[#111827] mb-4">Thông tin giao hàng</h3>
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-[#6B7280] mt-0.5 shrink-0" />
          <div>
            <p className="text-[14px] font-medium text-[#111827]">{shipping.recipient}</p>
            <p className="text-[14px] text-[#6B7280]">{shipping.phone}</p>
            <p className="text-[14px] text-[#6B7280] mt-1">{shipping.address}</p>
          </div>
        </div>
        {shipping.note && (
          <div className="pt-3 border-t border-[#ECECF1]">
            <p className="text-[13px] text-[#9CA3AF]">
              <span className="font-medium">Ghi chú:</span> {shipping.note}
            </p>
          </div>
        )}
        {shipping.vatRequired && (
          <div className="pt-3 border-t border-[#ECECF1]">
            <div className="flex items-center gap-2 text-[13px] text-[#6B7280]">
              <Check className="w-4 h-4 text-[#16A34A]" />
              <span>Yêu cầu xuất hóa đơn VAT</span>
            </div>
            <p className="text-[13px] text-[#6B7280] mt-1 ml-6">
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
      <div className="bg-white rounded-2xl border border-[#ECECF1] p-8 text-center">
        <Package className="w-12 h-12 text-[#D1D5DB] mx-auto mb-4" />
        <p className="text-[15px] text-[#6B7280]">Không có thông tin chi tiết sản phẩm</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#ECECF1] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#ECECF1] bg-[#FAFAFB]">
        <h3 className="text-[16px] font-semibold text-[#111827]">Chi tiết sản phẩm</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#ECECF1]">
              <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#9CA3AF] uppercase tracking-wider">#</th>
              <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Sản phẩm</th>
              <th className="px-6 py-4 text-center text-[13px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Số lượng</th>
              <th className="px-6 py-4 text-right text-[13px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Đơn giá</th>
              <th className="px-6 py-4 text-right text-[13px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Thành tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECECF1]">
            {lines.map((line, index) => {
              const price = line.match?.price || 0;
              const total = price * line.qty;
              
              return (
                <tr key={line.id || index} className="hover:bg-[#FAFAFB] transition-colors">
                  <td className="px-6 py-4 text-[14px] text-[#9CA3AF]">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-[14px] font-medium text-[#111827]">{line.match?.name || line.raw}</p>
                      {line.match?.sku && (
                        <p className="text-[13px] text-[#9CA3AF] mt-0.5">SKU: {line.match.sku}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-[14px] text-[#111827]">
                    {line.qty} {line.unit || "cái"}
                  </td>
                  <td className="px-6 py-4 text-right text-[14px] text-[#111827]">{formatVND(price)}</td>
                  <td className="px-6 py-4 text-right text-[14px] font-medium text-[#111827]">{formatVND(total)}</td>
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

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FAFAFB]">
        <div className="flex">
          {/* Sidebar - same as orders page */}
          <aside
            className={cn(
              "fixed lg:sticky lg:top-0 top-0 left-0 z-40 w-[220px] shrink-0",
              "transform -translate-x-full lg:translate-x-0 transition-transform duration-200",
              "bg-white border-r border-[#ECECF1]",
              "h-screen flex flex-col",
              mobileNavOpen && "translate-x-0"
            )}
          >
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

            <div className="py-4 px-3 border-t border-[#ECECF1]">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 h-11 px-[14px] rounded-[14px] text-[#EF4444] hover:bg-red-50 transition-all duration-200"
              >
                <span className="text-[14px] font-medium">Đăng xuất</span>
              </button>
            </div>
          </aside>

          {mobileNavOpen && (
            <div className="fixed inset-0 bg-black/10 z-30 lg:hidden" onClick={() => setMobileNavOpen(false)} />
          )}

          <main className="flex-1 min-w-0 lg:ml-0">
            <div className="lg:hidden fixed top-14 left-0 right-0 z-30 bg-white border-b border-[#ECECF1] px-4 py-3">
              <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="flex items-center gap-3 w-full">
                <div className="w-9 h-9 rounded-xl bg-[#F3F1FF] flex items-center justify-center">
                  <ShoppingCart className="h-4 w-4 text-[#635BFF]" />
                </div>
                <span className="text-sm font-medium text-[#111827]">Chi tiết đơn hàng</span>
                <ChevronRight className={cn("h-4 w-4 text-[#9CA3AF] ml-auto transition-transform", mobileNavOpen && "rotate-90")} />
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

            <div className="px-8 pt-8 pb-10">
              {/* Back link */}
              <Link
                href="/app/profile/orders"
                className="inline-flex items-center gap-2 text-[14px] font-medium text-[#6B7280] hover:text-[#111827] transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại danh sách đơn hàng
              </Link>

              {/* Error State - Order not found */}
              <div className="bg-white rounded-3xl border border-[#ECECF1] p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#FEE2E2] flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-[#DC2626]" />
                </div>
                <h2 className="text-[20px] font-semibold text-[#111827] mb-2">Không tìm thấy đơn hàng</h2>
                <p className="text-[15px] text-[#6B7280] mb-6">
                  Đơn hàng này không tồn tại hoặc đã bị xóa.
                </p>
                <Link
                  href="/app/profile/orders"
                  className="inline-flex h-11 px-6 text-[14px] font-semibold text-white bg-[#635BFF] rounded-[14px] hover:bg-[#5B52F5] transition-colors"
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

          <div className="py-4 px-3 border-t border-[#ECECF1]">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 h-11 px-[14px] rounded-[14px] text-[#EF4444] hover:bg-red-50 transition-all duration-200"
            >
              <span className="text-[14px] font-medium">Đăng xuất</span>
            </button>
          </div>
        </aside>

        {mobileNavOpen && (
          <div className="fixed inset-0 bg-black/10 z-30 lg:hidden" onClick={() => setMobileNavOpen(false)} />
        )}

        <main className="flex-1 min-w-0 lg:ml-0">
          <div className="lg:hidden fixed top-14 left-0 right-0 z-30 bg-white border-b border-[#ECECF1] px-4 py-3">
            <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="flex items-center gap-3 w-full">
              <div className="w-9 h-9 rounded-xl bg-[#F3F1FF] flex items-center justify-center">
                <ShoppingCart className="h-4 w-4 text-[#635BFF]" />
              </div>
              <span className="text-sm font-medium text-[#111827]">Chi tiết đơn hàng</span>
              <ChevronRight className={cn("h-4 w-4 text-[#9CA3AF] ml-auto transition-transform", mobileNavOpen && "rotate-90")} />
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

          <div className="px-8 pt-8 pb-10">
            {/* Back link */}
            <Link
              href="/app/profile/orders"
              className="inline-flex items-center gap-2 text-[14px] font-medium text-[#6B7280] hover:text-[#111827] transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại danh sách đơn hàng
            </Link>

            {/* Order Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <h1 className="text-[32px] font-bold text-[#111827]" style={{ letterSpacing: "-0.03em" }}>
                  #{orderId.replace(/-/g, "").slice(0, 8).toUpperCase()}
                </h1>
                <StatusBadge status={order.status} />
              </div>
              <div className="flex items-center gap-3">
                <button className="h-11 px-5 text-[14px] font-medium text-[#111827] bg-white border border-[#ECECF1] rounded-[14px] hover:bg-[#F5F5F8] transition-colors flex items-center gap-2">
                  <Printer className="w-4 h-4" />
                  In hóa đơn
                </button>
                <button className="h-11 px-5 text-[14px] font-semibold text-white bg-[#635BFF] rounded-[14px] hover:bg-[#5B52F5] transition-colors flex items-center gap-2" style={{ boxShadow: "0 2px 8px rgba(99, 91, 255, 0.25)" }}>
                  <RefreshCw className="w-4 h-4" />
                  Mua lại
                </button>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Left column - 2/3 width */}
              <div className="lg:col-span-2 space-y-6">
                <OrderSummaryCard order={order} />
                <ShippingCard shipping={order.shipping} />
              </div>

              {/* Right column - 1/3 width */}
              <div className="space-y-6">
                <OrderTimeline status={order.status} />
                
                {/* Support Card */}
                <div className="bg-white rounded-2xl border border-[#ECECF1] p-6">
                  <h3 className="text-[16px] font-semibold text-[#111827] mb-4">Hỗ trợ</h3>
                  <div className="space-y-3">
                    <a href="tel:19001234" className="flex items-center gap-3 p-3 rounded-xl bg-[#FAFAFB] hover:bg-[#F3F1FF] transition-colors">
                      <Phone className="w-5 h-5 text-[#635BFF]" />
                      <div>
                        <p className="text-[14px] font-medium text-[#111827]">Hotline</p>
                        <p className="text-[13px] text-[#6B7280]">1900 1234</p>
                      </div>
                    </a>
                    <a href="mailto:support@mecsu.vn" className="flex items-center gap-3 p-3 rounded-xl bg-[#FAFAFB] hover:bg-[#F3F1FF] transition-colors">
                      <Mail className="w-5 h-5 text-[#635BFF]" />
                      <div>
                        <p className="text-[14px] font-medium text-[#111827]">Email</p>
                        <p className="text-[13px] text-[#6B7280]">support@mecsu.vn</p>
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
