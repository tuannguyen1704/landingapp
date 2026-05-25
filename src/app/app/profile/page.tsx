"use client";
import { useState } from "react";
import { User, Bell, Shield, Package, Pencil, Check, X } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { UserAvatar } from "@/components/user-avatar";
import { useRequest } from "@/components/request-provider";
import { formatVND } from "@/lib/utils";

type Tab = "info" | "settings" | "orders";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { orders } = useRequest();
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: user?.name ?? "", email: user?.email ?? "" });

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900">Chưa đăng nhập</h2>
        <p className="mt-2 text-slate-500 max-w-sm">
          Vui lòng đăng nhập để xem thông tin tài khoản của bạn.
        </p>
      </div>
    );
  }

  const handleSave = () => {
    updateUser({ name: editForm.name, email: editForm.email });
    setEditing(false);
  };

  const handleCancel = () => {
    setEditForm({ name: user.name, email: user.email });
    setEditing(false);
  };

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "info", label: "Thông tin cá nhân", icon: User },
    { key: "settings", label: "Cài đặt", icon: Bell },
    { key: "orders", label: "Lịch sử đơn hàng", icon: Package },
  ];

  const userOrders = orders.slice(0, 5);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="flex items-start gap-5 mb-8">
        <UserAvatar name={user.name} size="lg" />
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
          <p className="mt-0.5 text-sm text-slate-500">{user.email}</p>
          <p className="mt-1 text-xs text-slate-400">
            Tham gia {new Date(user.createdAt).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <nav className="flex gap-1" aria-label="Tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-violet-600 text-violet-700"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === "info" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-slate-900">Thông tin tài khoản</h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-violet-700 bg-violet-50 hover:bg-violet-100 transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
                Chỉnh sửa
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                >
                  <Check className="h-3.5 w-3.5" />
                  Lưu
                </button>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                  Huỷ
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Họ và tên</label>
                {editing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-400/60 focus:border-violet-400"
                  />
                ) : (
                  <p className="text-sm text-slate-900 font-medium">{user.name}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Email</label>
                {editing ? (
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-400/60 focus:border-violet-400"
                  />
                ) : (
                  <p className="text-sm text-slate-900 font-medium">{user.email}</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Tài khoản liên kết</h3>
              <div className="flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="text-slate-600">Google</span>
                  <span className="text-xs text-slate-400 ml-1">Chưa liên kết</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-violet-50">
                <Bell className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Thông báo</h2>
                <p className="text-sm text-slate-500">Quản lý cách bạn nhận thông báo</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: "Thông báo đơn hàng mới", desc: "Nhận email khi có cập nhật đơn hàng", defaultChecked: true },
                { label: "Báo giá từ nhà cung cấp", desc: "Nhận thông báo khi có báo giá mới", defaultChecked: true },
                { label: "Tin tức và cập nhật", desc: "Nhận email về tính năng mới", defaultChecked: false },
              ].map((item) => (
                <label key={item.label} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={item.defaultChecked}
                    className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-400"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-violet-50">
                <Shield className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Bảo mật</h2>
                <p className="text-sm text-slate-500">Quản lý mật khẩu và bảo mật tài khoản</p>
              </div>
            </div>
            <button className="w-full sm:w-auto px-4 py-2 rounded-xl text-sm font-medium text-violet-700 bg-violet-50 hover:bg-violet-100 transition-colors text-left">
              Đổi mật khẩu
            </button>
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Đơn hàng gần đây</h2>
            <p className="mt-0.5 text-sm text-slate-500">{userOrders.length} đơn hàng được lưu trong hệ thống</p>
          </div>
          {userOrders.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Chưa có đơn hàng nào.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {userOrders.map((order) => (
                <div key={order.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        #{order.id.replace(/-/g, "").slice(0, 8).toUpperCase()}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {order.itemCount} sản phẩm
                        {" · "}
                        {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-slate-900">{formatVND(order.totalAmount)}</p>
                      <span
                        className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                          order.status === "delivered"
                            ? "bg-emerald-50 text-emerald-700"
                            : order.status === "placed"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {order.status === "delivered"
                          ? "Hoàn thành"
                          : order.status === "placed"
                          ? "Đang xử lý"
                          : order.status === "confirmed"
                          ? "Đã xác nhận"
                          : order.status === "packed"
                          ? "Đã đóng gói"
                          : order.status === "shipped"
                          ? "Đang giao"
                          : order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
