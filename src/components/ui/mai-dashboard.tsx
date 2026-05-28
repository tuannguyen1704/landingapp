import React from 'react';
import { LogOut, User, ShieldCheck, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth-provider';

interface DashboardProps {
  currentUser: string;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ currentUser, onLogout }) => {
  const { user } = useAuth();

  const handleClearUsers = () => {
    localStorage.removeItem('mai-auth-v1');
    window.location.reload();
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
            <h1 className="text-3xl md:text-4xl font-display font-extrabold mt-2 tracking-tight">
              Xin chào, {currentUser}!
            </h1>
            <p className="text-indigo-100/90 text-sm mt-1 max-w-md">
              Bạn đã đăng nhập thành công vào hệ thống. Bản điều khiển tài khoản đang ở trạng thái hoạt động.
            </p>
          </div>
          <button
            id="btn-logout"
            onClick={onLogout}
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
              Thông tin phiên
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg uppercase shadow-inner">
                {currentUser.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-semibold text-slate-800 truncate">{currentUser}</h4>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Authorized
                </p>
              </div>
            </div>
            
            <div className="space-y-3.5 text-sm border-t border-slate-200/60 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Quyền truy cập</span>
                <span className="font-semibold text-slate-800 bg-indigo-50 text-indigo-600 text-xs px-2 py-0.5 rounded-md">User</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Mã hóa</span>
                <span className="font-mono text-xs text-slate-400">AES-256</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Thời gian:</span>
                <span className="text-xs text-slate-600">{new Date().toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100/50">
            <h4 className="font-semibold text-indigo-900 text-sm mb-1.5">Cách thức hoạt động</h4>
            <p className="text-xs text-indigo-800/80 leading-relaxed">
              Dự án này sử dụng <strong>Motion</strong> để xử lý hoạt ảnh trượt mượt mà giữa các góc phần tư. Tên người dùng và mật khẩu đăng ký được lưu trữ bảo mật cục bộ trên trình duyệt của bạn (LocalStorage).
            </p>
          </div>
        </div>

        {/* Right Columns: User Info */}
        <div className="md:col-span-2 bg-slate-50/70 p-6 rounded-2xl border border-slate-100 flex flex-col h-full min-h-[300px]">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="font-semibold text-slate-810 text-base">Thông tin tài khoản</h3>
              <p className="text-xs text-slate-500">Chi tiết tài khoản của bạn</p>
            </div>
          </div>

          <div className="flex-grow overflow-x-auto">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100">
                  <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-2xl uppercase shadow-inner">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800 text-lg">{user.name}</h4>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" /> Verified Account
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Email</p>
                    <p className="text-sm font-medium text-slate-800">{user.email}</p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">User ID</p>
                    <p className="text-sm font-medium text-slate-800 font-mono">{user.id}</p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Ngày tạo</p>
                    <p className="text-sm font-medium text-slate-800">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN', { 
                        day: '2-digit', 
                        month: 'long', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Trạng thái</p>
                    <p className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Hoạt động
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3">
                  <User className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-600">Không có thông tin người dùng</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
