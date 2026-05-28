import React from "react";
import {
  LogOut,
  User,
  Mail,
  Calendar,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/components/auth-provider";

interface DashboardViewProps {
  onLogout: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onLogout }) => {
  const { user, logout } = useAuth();

  // Get all registered users from localStorage
  const getAllUsers = () => {
    try {
      const usersJson = localStorage.getItem('mai-user-auth');
      return usersJson ? JSON.parse(usersJson) : [];
    } catch {
      return [];
    }
  };

  const allUsers = getAllUsers();

  const handleClearUsers = () => {
    localStorage.removeItem('mai-user-auth');
    window.location.reload();
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-4xl bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden"
    >
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-8 py-10 text-white relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-[circle_at_bottom_right,_var(--tw-gradient-stops)] from-white/20 via-transparent to-transparent opacity-60 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="bg-white/10 text-white/90 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
              Secure Session
            </span>
            <h1 className="text-3xl md:text-4xl font-black mt-2 tracking-tight">
              Xin chào, {user?.name || "Người dùng"}!
            </h1>
            <p className="text-indigo-100/90 text-sm mt-1 max-w-md">
              Bạn đã đăng nhập thành công vào hệ thống. Bạn điều khiển tài khoản
              đang ở trạng thái hoạt động.
            </p>
          </div>
          <button
            id="btn-logout"
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white text-indigo-600 font-semibold px-5 py-3 rounded-xl hover:bg-slate-100 shadow-md hover:shadow-lg active:scale-95 cursor-pointer transition-all focus:outline-none"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Stats & Profile Card */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-100">
            <h3 className="font-semibold text-slate-800 text-sm tracking-wide uppercase mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-500" />
              Thong tin phien
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg uppercase shadow-inner">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-semibold text-slate-800 truncate">
                  {user?.name || "Người dùng"}
                </h4>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Đã
                  được xác thực
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-sm border-t border-slate-200/60 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Email</span>
                <span className="font-medium text-slate-800 text-xs truncate max-w-[120px]">
                  {user?.email || "-"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Quyền truy cập</span>
                <span className="font-semibold bg-indigo-50 text-indigo-600 text-xs px-2 py-0.5 rounded-md">
                  User
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Mã hóa</span>
                <span className="font-mono text-xs text-slate-400">
                  AES-256
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Thời gian:</span>
                <span className="text-xs text-slate-600">
                  {new Date().toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100/50">
            <h4 className="font-semibold text-indigo-900 text-sm mb-1.5">
              Cách thức hoạt động
            </h4>
            <p className="text-xs text-indigo-800/80 leading-relaxed">
              Dự án sử dụng <strong>Framer Motion</strong> để xử lý hoạt ảnh
              trượt mềm giữa các góc phần tử. Thông tin người dùng được lưu trữ
              an toàn trên trình duyệt của bạn (LocalStorage).
            </p>
          </div>
        </div>

        {/* Right Columns: Registered Accounts List */}
        <div className="md:col-span-2 bg-slate-50/70 p-6 rounded-2xl border border-slate-100 flex flex-col h-full min-h-[300px]">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="font-semibold text-slate-800 text-base">
                Danh sach nguoi dung da dang ky
              </h3>
              <p className="text-xs text-slate-500">
                Tất cả tài khoản hiện có trong localStorage của trình duyệt
              </p>
            </div>
            {allUsers.length > 0 && (
              <button
                id="btn-clear-users"
                onClick={handleClearUsers}
                className="text-xs text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-transparent px-2.5 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1 font-medium"
              >
                <RefreshCw className="w-3 h-3" />
                Đổi phiên
              </button>
            )}
          </div>

          <div className="flex-grow overflow-x-auto">
            {allUsers.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3">
                  <User className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-600">
                  Chưa có người dùng mới được đăng ký
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
                  Đăng xuất và tạo tài khoản mới để danh sách này được cập nhật.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap mt-2">
                <thead>
                  <tr className="text-xs text-slate-400 uppercase border-b border-slate-200/80">
                    <th className="pb-2.5 font-semibold">Tên tài khoản</th>
                    <th className="pb-2.5 font-semibold">Email</th>
                    <th className="pb-2.5 font-semibold text-right">
                      Ngày khởi tạo
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allUsers.map((u: any, index: number) => (
                    <tr
                      key={index}
                      className="group hover:bg-white/50 transition-colors"
                    >
                      <td className="py-3 font-medium text-slate-800 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 group-hover:scale-125 transition-transform" />
                        {u.username || u.name}
                      </td>
                      <td className="py-3 text-slate-600">{u.email}</td>
                      <td className="py-3 text-right text-xs text-slate-400">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString("vi-VN")
                          : "Mặc định"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
