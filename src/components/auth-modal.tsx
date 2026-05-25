"use client";
import { useEffect, useRef, useState } from "react";
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, ChevronRight } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";

export function AuthModal() {
  const { isOpen, mode, user, closeModal, login, register, setWelcomeMode, logout } = useAuth();
  const [currentMode, setCurrentMode] = useState<"login" | "register" | "welcome">(mode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    // Clear autofilled password values after render
    const timer = setTimeout(() => {
      if (passwordRef.current) passwordRef.current.value = form.password;
      if (confirmRef.current) confirmRef.current.value = form.confirm;
    }, 50);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    setCurrentMode(mode);
    if (mode !== "welcome") {
      setError(null);
      setForm({ name: "", email: "", password: "", confirm: "" });
      setShowPassword(false);
      setShowConfirm(false);
    }
  }, [mode, isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, closeModal]);

  if (!isOpen) return null;

  const toggleMode = () => {
    setCurrentMode((m) => (m === "login" ? "register" : "login"));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentMode === "welcome") {
      closeModal();
      return;
    }
    setError(null);
    setLoading(true);
    try {
      if (currentMode === "login") {
        const result = await login(form.email, form.password);
        if (!result.success) setError(result.error ?? "Đăng nhập thất bại.");
      } else {
        if (form.password !== form.confirm) {
          setError("Mật khẩu xác nhận không khớp.");
          setLoading(false);
          return;
        }
        const result = await register(form.name, form.email, form.password);
        if (!result.success) setError(result.error ?? "Đăng ký thất bại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={closeModal}
      />

      {/* Modal */}
      <div
        className={cn(
          "relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden",
          "animate-modal-in"
        )}
        style={{
          boxShadow: "0 0 0 1px rgba(124,58,237,0.08), 0 25px 50px -12px rgba(0,0,0,0.25), 0 0 80px rgba(124,58,237,0.12)",
        }}
      >
        {/* Floating glow accent top */}
        <div
          aria-hidden
          className="absolute -top-24 -right-24 h-48 w-48 rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(258 65% 60%) 0%, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(217 91% 60%) 0%, transparent 70%)" }}
        />

        {/* ========== WELCOME VIEW ========== */}
        {currentMode === "welcome" && user && (
          <div className="relative pt-8 pb-6 px-8 text-center">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Đóng"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Logo */}
            <div className="mx-auto mb-5 h-14 w-14 rounded-2xl brand-gradient flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-2xl">V</span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
            <p className="mt-1.5 text-sm text-slate-500">Choose an account to continue</p>

            {/* Account card */}
            <div className="mt-6">
              <button
                onClick={closeModal}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 text-left",
                  "bg-white border-violet-200 hover:border-violet-400",
                  "hover:shadow-lg hover:shadow-violet-100",
                  "group"
                )}
              >
                <UserAvatar name={user.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-violet-500 transition-colors shrink-0" />
              </button>

              {/* Previously signed in note */}
              <p className="mt-3 text-xs text-slate-400">
                Bạn đã đăng nhập trên thiết bị này trước đó
              </p>
            </div>

            {/* Continue button */}
            <button
              onClick={closeModal}
              className={cn(
                "mt-5 w-full py-2.5 rounded-xl text-sm font-semibold text-white",
                "bg-gradient-to-r from-indigo-600 to-violet-500",
                "hover:from-indigo-700 hover:to-violet-600",
                "shadow-md hover:shadow-lg hover:shadow-violet-200",
                "transition-all duration-200"
              )}
            >
              Tiếp tục với tài khoản này
            </button>

            {/* Other options */}
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() => { logout(); setCurrentMode("login"); }}
                className="text-sm text-slate-600 hover:text-violet-600 transition-colors py-1"
              >
                Đăng nhập bằng tài khoản khác
              </button>
              <button
                onClick={() => setCurrentMode("register")}
                className="text-sm text-slate-600 hover:text-violet-600 transition-colors py-1"
              >
                Tạo tài khoản mới
              </button>
            </div>
          </div>
        )}

        {/* ========== LOGIN / REGISTER VIEWS ========== */}
        {currentMode !== "welcome" && (
          <>
        {/* Header */}
        <div className="relative pt-8 pb-6 px-8 text-center border-b border-slate-100">
          {/* Close button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Logo */}
          <div className="mx-auto mb-4 h-14 w-14 rounded-2xl brand-gradient flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-2xl">V</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {currentMode === "login" ? "Welcome Back" : "Tạo tài khoản"}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
            {currentMode === "login"
              ? "Đăng nhập để tiếp tục quản lý yêu cầu mua hàng"
              : "Đăng ký để bắt đầu sử dụng nền tảng mua hàng"}
          </p>
        </div>

        {/* Form */}
        <div className="relative px-8 py-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name (register only) */}
            {currentMode === "register" && (
              <div className="space-y-1.5">
                <label htmlFor="auth-name" className="text-sm font-medium text-slate-700">
                  Họ và tên
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="auth-name"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className={cn(
                      "w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200",
                      "text-sm text-slate-900 placeholder:text-slate-400",
                      "focus:outline-none focus:ring-2 focus:ring-violet-400/60 focus:border-violet-400",
                      "transition-all duration-200"
                    )}
                    required
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="auth-email" className="text-sm font-medium text-slate-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="auth-email"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="off"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className={cn(
                    "w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200",
                    "text-sm text-slate-900 placeholder:text-slate-400",
                    "focus:outline-none focus:ring-2 focus:ring-violet-400/60 focus:border-violet-400",
                    "transition-all duration-200"
                  )}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="auth-password" className="text-sm font-medium text-slate-700">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  ref={passwordRef}
                  autoComplete="off"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className={cn(
                    "w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200",
                    "text-sm text-slate-900 placeholder:text-slate-400",
                    "focus:outline-none focus:ring-2 focus:ring-violet-400/60 focus:border-violet-400",
                    "transition-all duration-200"
                  )}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password (register only) */}
            {currentMode === "register" && (
              <div className="space-y-1.5">
                <label htmlFor="auth-confirm" className="text-sm font-medium text-slate-700">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="auth-confirm"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    ref={confirmRef}
                    autoComplete="off"
                    value={form.confirm}
                    onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                    className={cn(
                      "w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200",
                      "text-sm text-slate-900 placeholder:text-slate-400",
                      "focus:outline-none focus:ring-2 focus:ring-violet-400/60 focus:border-violet-400",
                      "transition-all duration-200"
                    )}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Forgot password (login only) */}
            {currentMode === "login" && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-violet-600 hover:text-violet-700 hover:underline transition-colors"
                >
                  Quên mật khẩu?
                </button>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full py-2.5 rounded-xl text-sm font-semibold text-white",
                "bg-gradient-to-r from-indigo-600 to-violet-500",
                "hover:from-indigo-700 hover:to-violet-600",
                "shadow-md hover:shadow-lg hover:shadow-violet-200",
                "transition-all duration-200",
                "disabled:opacity-60 disabled:cursor-not-allowed",
                "flex items-center justify-center gap-2"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{currentMode === "login" ? "Đang đăng nhập..." : "Đang đăng ký..."}</span>
                </>
              ) : (
                <span>{currentMode === "login" ? "Đăng nhập" : "Tạo tài khoản"}</span>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-medium">hoặc</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Google */}
            <button
              type="button"
              disabled={loading}
              className={cn(
                "w-full py-2.5 rounded-xl text-sm font-medium text-slate-700",
                "bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300",
                "shadow-sm hover:shadow transition-all duration-200",
                "flex items-center justify-center gap-2.5",
                "disabled:opacity-60 disabled:cursor-not-allowed"
              )}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Tiếp tục với Google
            </button>
          </form>

          {/* Toggle */}
          <p className="mt-5 text-center text-sm text-slate-500">
            {currentMode === "login" ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
            <button
              type="button"
              onClick={toggleMode}
              className="font-semibold text-violet-600 hover:text-violet-700 hover:underline transition-colors"
            >
              {currentMode === "login" ? "Đăng ký ngay" : "Đăng nhập"}
            </button>
          </p>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
