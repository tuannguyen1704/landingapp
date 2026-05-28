"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAuth, type AuthUser } from "@/components/auth-provider";
import { LoginForm } from "./ui/mai-login-form";
import { RegisterForm } from "./ui/mai-register-form";
import { ToastContainer, ToastMessage } from "./ui/mai-toast";

export function AuthModalNew() {
  const { isOpen, mode, closeModal, user, updateUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    if (mode !== "welcome") {
      setIsLogin(mode === "login");
    }
  }, [mode]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, closeModal]);

  if (!isOpen || mode === "welcome") return null;

  const showToast = (
    text: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSwitchToRegister = () => {
    if (isFlipping || !isLogin) return;
    setIsFlipping(true);
    setTimeout(() => setIsLogin(false), 280);
    setTimeout(() => setIsFlipping(false), 560);
  };

  const handleSwitchToLogin = () => {
    if (isFlipping || isLogin) return;
    setIsFlipping(true);
    setTimeout(() => setIsLogin(true), 280);
    setTimeout(() => setIsFlipping(false), 560);
  };

  const handleLoginSuccess = (username: string, userData?: { email: string }) => {
    // Get user from localStorage and update auth context
    const usersJson = localStorage.getItem('mai-user-auth');
    const users = usersJson ? JSON.parse(usersJson) : [];
    const loggedInUser = users.find(
      (u: any) => u.username.toLowerCase() === username.toLowerCase() ||
                  (userData?.email && u.email?.toLowerCase() === userData.email.toLowerCase())
    );

    if (loggedInUser) {
      const authUser: AuthUser = {
        id: `user-${loggedInUser.username}`,
        name: loggedInUser.username,
        email: loggedInUser.email || loggedInUser.username,
        createdAt: loggedInUser.createdAt,
      };
      updateUser(authUser);
    }

    showToast(`Đăng nhập thành công! Chào mừng ${username}`, "success");
  };

  const handleRegisterSuccess = (username: string, email?: string) => {
    // Create user in auth context
    const authUser: AuthUser = {
      id: `user-${username}`,
      name: username,
      email: email || username,
      createdAt: new Date().toISOString(),
    };
    updateUser(authUser);

    showToast(`Tài khoản ${username} đã được tạo thành công!`, "success");
    setTimeout(() => handleSwitchToLogin(), 1500);
  };

  const handleShowError = (message: string) => {
    showToast(message, "error");
  };

  const handleForgotPassword = (email: string) => {
    showToast(
      `Liên kết đặt lại mật khẩu đã được gửi đến ${email || "email của bạn"}.`,
      "info",
    );
  };

  // Calculate panel position
  const getPanelStyle = () => {
    if (isFlipping) {
      return {
        left: "0%",
        right: "0%",
        borderTopLeftRadius: "2.5rem",
        borderTopRightRadius: "2.5rem",
        borderBottomLeftRadius: "2.5rem",
        borderBottomRightRadius: "2.5rem",
      };
    }
    // isLogin=true: panel covers LEFT side (shows Login on RIGHT)
    // isLogin=false: panel covers RIGHT side (shows Register on LEFT)
    if (isLogin) {
      return {
        left: "0%",
        right: "50%",
        borderTopLeftRadius: "2.5rem",
        borderTopRightRadius: "100px",
        borderBottomLeftRadius: "2.5rem",
        borderBottomRightRadius: "100px",
      };
    } else {
      return {
        left: "50%",
        right: "0%",
        borderTopLeftRadius: "100px",
        borderTopRightRadius: "2.5rem",
        borderBottomLeftRadius: "100px",
        borderBottomRightRadius: "2.5rem",
      };
    }
  };

  const panelStyle = getPanelStyle();

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-50 bg-[#0F1115]/80 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={closeModal}
      />

      {/* Main Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 pointer-events-none">
        <motion.div
          className="relative w-full max-w-[940px] h-[620px] bg-white rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden pointer-events-auto"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{
            duration: 0.4,
            type: "spring",
            stiffness: 300,
            damping: 25,
          }}
        >
          {/* Close Button */}
          <button
            onClick={closeModal}
            className="absolute top-5 right-5 z-30 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-slate-500 hover:text-slate-700 shadow-lg transition-all cursor-pointer focus:outline-none"
          >
            <X className="w-4 h-4" />
          </button>

          {/* LEFT SIDE - Register Form (always visible behind panel) */}
          <div className="absolute left-0 top-0 bottom-0 w-1/2 flex items-center justify-center p-8">
            <div className="w-full max-w-[380px] flex flex-col justify-center mt-8">
              <RegisterForm
                onRegisterSuccess={handleRegisterSuccess}
                onShowError={handleShowError}
                onSwitchToLogin={handleSwitchToLogin}
              />
            </div>
          </div>

          {/* RIGHT SIDE - Login Form (always visible behind panel) */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-center p-8">
            <div className="w-full max-w-[380px]">
              <LoginForm
                onLoginSuccess={handleLoginSuccess}
                onShowError={handleShowError}
                onForgotPassword={handleForgotPassword}
                onSwitchToRegister={handleSwitchToRegister}
              />
            </div>
          </div>

          {/* SLIDING OVERLAY PANEL */}
          <motion.div
            className="absolute top-0 bottom-0 z-20 overflow-hidden bg-gradient-to-br from-[#6366F1] via-[#8B5CF6] to-[#A855F7]"
            animate={{
              left: panelStyle.left,
              right: panelStyle.right,
              borderTopLeftRadius: panelStyle.borderTopLeftRadius,
              borderTopRightRadius: panelStyle.borderTopRightRadius,
              borderBottomLeftRadius: panelStyle.borderBottomLeftRadius,
              borderBottomRightRadius: panelStyle.borderBottomRightRadius,
            }}
            transition={{
              left: { type: "spring", stiffness: 95, damping: 18, mass: 1 },
              right: { type: "spring", stiffness: 95, damping: 18, mass: 1 },
              borderTopLeftRadius: {
                type: "spring",
                stiffness: 95,
                damping: 18,
                mass: 1,
              },
              borderTopRightRadius: {
                type: "spring",
                stiffness: 95,
                damping: 18,
                mass: 1,
              },
              borderBottomLeftRadius: {
                type: "spring",
                stiffness: 95,
                damping: 18,
                mass: 1,
              },
              borderBottomRightRadius: {
                type: "spring",
                stiffness: 95,
                damping: 18,
                mass: 1,
              },
            }}
          >
            {/* Ambient Glow Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />

            {/* Panel Content */}
            <div className="relative w-full h-full text-white px-10 py-12 flex flex-col justify-between">
              {/* Top: Logo */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-white/20 rotate-45 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <span className="absolute -rotate-45 font-black text-xl text-white">
                      V
                    </span>
                  </div>
                </div>
                <span className="text-white font-black text-xl tracking-tight uppercase">
                  MAI PROCUREMENT
                </span>
              </div>

              {/* Middle: Animated Content */}
              <div className="my-auto">
                <AnimatePresence mode="wait">
                  {isLogin ? (
                    // Panel covering LEFT - Shows "Start Journey" + Create Account button
                    <motion.div
                      key="to-register"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="flex flex-col"
                    >
                      <h1 className="text-white text-5xl font-black leading-none tracking-tight uppercase mb-6">
                        TRẢI NGHIỆM
                        <br />
                        MUA HÀNG THÔNG MINH.
                      </h1>
                      <p className="text-white/80 text-base font-medium leading-relaxed mb-8 max-w-sm">
                        Tham gia cùng hàng nghìn doanh nghiệp đang tối ưu quy
                        trình mua sắm và quản lý vật tư với M.ai
                      </p>
                      <button
                        onClick={handleSwitchToRegister}
                        className="self-start bg-transparent border-2 border-white/40 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-white hover:text-[#6366F1] transition-all duration-300 cursor-pointer focus:outline-none"
                      >
                        Tạo tài khoản
                      </button>
                    </motion.div>
                  ) : (
                    // Panel covering RIGHT - Shows "Welcome Back" + Login button
                    <motion.div
                      key="to-login"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="flex flex-col"
                    >
                      <h1 className="text-white text-5xl font-black leading-none tracking-tight uppercase mb-6">
                        CHÀO MỪNG
                        <br />
                        BẠN TRỞ LẠI.
                      </h1>
                      <p className="text-white/80 text-base font-medium leading-relaxed mb-8 max-w-sm">
                        Truy cập nền tảng M.ai để tiếp tục tìm kiếm và mua sắm
                        sản phẩm phù hợp cho doanh nghiệp của bạn
                      </p>
                      <button
                        onClick={handleSwitchToLogin}
                        className="self-start bg-transparent border-2 border-white/40 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-white hover:text-[#6366F1] transition-all duration-300 cursor-pointer focus:outline-none"
                      >
                        Đăng nhập ngay
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom: Social Proof */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop"
                      className="w-10 h-10 rounded-full border-2 border-indigo-300 object-cover"
                      alt="Creator 1"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop"
                      className="w-10 h-10 rounded-full border-2 border-indigo-300 object-cover"
                      alt="Creator 2"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop"
                      className="w-10 h-10 rounded-full border-2 border-indigo-300 object-cover"
                      alt="Creator 3"
                    />
                  </div>
                  <span className="text-white/70 text-sm font-medium">
                    Tin dùng bởi nhiều doanh nghiệp trên toàn quốc
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
