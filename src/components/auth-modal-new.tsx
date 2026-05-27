"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";

export function AuthModalNew() {
  const { isOpen, mode, closeModal, login, register } = useAuth();
  const [currentMode, setCurrentMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });

  useEffect(() => {
    if (mode !== "welcome") {
      setCurrentMode(mode);
    }
  }, [mode]);

  useEffect(() => {
    if (isOpen && mode !== "welcome") {
      setError(null);
      setForm({ name: "", email: "", password: "", confirm: "" });
      setShowPassword(false);
      setShowConfirm(false);
    }
  }, [isOpen, mode]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, closeModal]);

  if (!isOpen || mode === "welcome") return null;

  const toggleMode = () => {
    setCurrentMode((m) => (m === "login" ? "register" : "login"));
    setError(null);
    setForm({ name: "", email: "", password: "", confirm: "" });
    setShowPassword(false);
    setShowConfirm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (currentMode === "login") {
        const result = await login(form.email, form.password);
        if (!result.success) {
          setError(result.error ?? "Đăng nhập thất bại.");
        }
      } else {
        if (form.password !== form.confirm) {
          setError("Mật khẩu xác nhận không khớp.");
          setLoading(false);
          return;
        }
        const result = await register(form.name, form.email, form.password);
        if (!result.success) {
          setError(result.error ?? "Đăng ký thất bại.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={closeModal}
      />

      {/* Modal Container */}
      <motion.div
        className="relative w-full max-w-[960px] h-auto max-h-[92vh] md:h-[660px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
        initial={{ opacity: 0, scale: 0.95, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 24 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{
          boxShadow:
            "0 0 0 1px rgba(99, 102, 241, 0.08), 0 32px 64px -16px rgba(0, 0, 0, 0.25), 0 0 120px rgba(99, 102, 241, 0.12)",
        }}
      >
        {/* ===================== */}
        {/* LEFT PANEL - Visual */}
        {/* ===================== */}
        <div className="hidden md:block md:w-[42%] h-full relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMode}
              className="absolute inset-0"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: "url('/assets/signup.png')",
                }}
              />

              {/* Premium Gradient Overlays - 3D Fluid Effect */}
              <div
                className="absolute inset-0"
                style={{
                  background: `
                    radial-gradient(ellipse 80% 60% at 20% 80%, rgba(99, 102, 241, 0.85) 0%, transparent 60%),
                    radial-gradient(ellipse 60% 80% at 80% 20%, rgba(139, 92, 246, 0.75) 0%, transparent 55%),
                    radial-gradient(ellipse 100% 100% at 50% 50%, rgba(79, 70, 229, 0.9) 0%, rgba(99, 102, 241, 0.7) 40%, transparent 70%),
                    linear-gradient(180deg, rgba(30, 27, 75, 0.4) 0%, rgba(67, 56, 202, 0.6) 50%, rgba(79, 70, 229, 0.85) 100%)
                  `,
                }}
              />

              {/* 3D Light Effects */}
              <div
                className="absolute top-0 left-0 w-full h-full"
                style={{
                  background: `
                    radial-gradient(circle 300px at 25% 75%, rgba(139, 92, 246, 0.4) 0%, transparent 70%),
                    radial-gradient(circle 250px at 75% 25%, rgba(59, 130, 246, 0.3) 0%, transparent 70%)
                  `,
                }}
              />

              {/* Glassmorphism Overlay */}
              <div
                className="absolute inset-0 backdrop-blur-[1px]"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)",
                }}
              />

              {/* Subtle Grid Pattern */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
                  `,
                  backgroundSize: "50px 50px",
                }}
              />

              {/* Animated Floating Elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Glowing orb 1 */}
                <motion.div
                  className="absolute w-40 h-40 rounded-full opacity-20 blur-3xl"
                  style={{
                    background: "radial-gradient(circle, hsl(258, 90%, 65%) 0%, transparent 70%)",
                    top: "15%",
                    right: "10%",
                  }}
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.2, 0.35, 0.2],
                  }}
                  transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Glowing orb 2 */}
                <motion.div
                  className="absolute w-32 h-32 rounded-full opacity-15 blur-2xl"
                  style={{
                    background: "radial-gradient(circle, hsl(238, 85%, 60%) 0%, transparent 70%)",
                    bottom: "25%",
                    left: "15%",
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.15, 0.25, 0.15],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                />

                {/* Small floating particles */}
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-white/25"
                    style={{
                      left: `${20 + i * 15}%`,
                      top: `${25 + (i % 3) * 20}%`,
                    }}
                    animate={{
                      y: [0, -15, 0],
                      opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                      duration: 4 + i * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.3,
                    }}
                  />
                ))}
              </div>

              {/* Content Container */}
              <div className="absolute inset-0 flex flex-col justify-end p-10">
                {/* Brand Logo */}
                <div className="absolute top-8 left-8">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div
                        className="h-12 w-12 rounded-2xl flex items-center justify-center backdrop-blur-md"
                        style={{
                          background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          boxShadow: "0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
                        }}
                      >
                        <span className="text-white font-black text-xl">M</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center shadow-lg">
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-base tracking-tight">M.AI Procurement</h3>
                      <p className="text-white/50 text-xs">Powered by MECSU</p>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="space-y-4">
                  <motion.h2
                    className="text-2xl md:text-3xl font-bold text-white leading-tight tracking-tight"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.5 }}
                  >
                    Accelerate purchasing
                    <br />
                    with AI
                  </motion.h2>
                  <motion.p
                    className="text-sm text-white/80 leading-relaxed max-w-[300px]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.5 }}
                  >
                    Automatically extract materials, find suppliers and generate quotes in seconds.
                  </motion.p>
                </div>

                {/* Subtle indicator dots */}
                <motion.div
                  className="flex items-center gap-2 mt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <div
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-500",
                      currentMode === "login" ? "w-8 bg-white" : "w-1.5 bg-white/40"
                    )}
                  />
                  <div
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-500",
                      currentMode === "register" ? "w-8 bg-white" : "w-1.5 bg-white/40"
                    )}
                  />
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-6 pt-6 pb-5 border-b border-slate-100/80">
          <div className="flex items-center gap-3">
            <div
              className="h-11 w-11 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, hsl(258, 90%, 65%) 0%, hsl(275, 70%, 60%) 100%)",
                boxShadow: "0 4px 16px rgba(99, 102, 241, 0.3)",
              }}
            >
              <span className="text-white font-black text-lg">M</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">M.AI Procurement</h2>
              <p className="text-xs text-slate-500">
                {currentMode === "login" ? "Sign in to continue" : "Create your account"}
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ===================== */}
        {/* RIGHT PANEL - Form */}
        {/* ===================== */}
        <motion.div
          className="relative w-full md:w-[58%] bg-white flex flex-col flex-1"
          layoutId="rightPanel"
        >
          {/* Close button (desktop) */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all z-20 hidden md:flex"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Form Content */}
          <div className="flex-1 flex flex-col px-6 md:px-10 py-4 md:py-6 overflow-y-auto">
            <div className="w-full max-w-[320px] mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMode}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Heading - Always visible */}
                <div className="mb-4">
                  <motion.h1
                    className="text-lg md:text-xl font-bold text-slate-900 tracking-tight"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08, duration: 0.2 }}
                  >
                    {currentMode === "login" ? "Welcome back" : "Create account"}
                  </motion.h1>
                  <motion.p
                    className="mt-1 text-xs md:text-sm text-slate-500"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                  >
                    {currentMode === "login"
                      ? "Sign in to continue managing your procurement requests."
                      : "Get started with AI-powered procurement today."}
                  </motion.p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Name (register only) */}
                  {currentMode === "register" && (
                    <motion.div className="space-y-1" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                      <label htmlFor="auth-name" className="text-xs md:text-sm font-medium text-slate-700">Full name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input id="auth-name" type="text" placeholder="Nguyen Van A" autoComplete="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" required />
                      </div>
                    </motion.div>
                  )}

                  {/* Email */}
                  <div className="space-y-1">
                    <label htmlFor="auth-email" className="text-xs md:text-sm font-medium text-slate-700">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input id="auth-email" type="email" placeholder="you@company.com" autoComplete="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" required />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label htmlFor="auth-password" className="text-xs md:text-sm font-medium text-slate-700">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input id="auth-password" type={showPassword ? "text" : "password"} placeholder="Enter your password" autoComplete={currentMode === "login" ? "current-password" : "new-password"} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className="w-full pl-9 pr-9 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" required minLength={6} />
                      <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" tabIndex={-1}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm password (register only) */}
                  {currentMode === "register" && (
                    <motion.div className="space-y-1" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                      <label htmlFor="auth-confirm" className="text-xs md:text-sm font-medium text-slate-700">Confirm password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input id="auth-confirm" type={showConfirm ? "text" : "password"} placeholder="Confirm your password" autoComplete="new-password" value={form.confirm} onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))} className="w-full pl-9 pr-9 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" required minLength={6} />
                        <button type="button" onClick={() => setShowConfirm((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" tabIndex={-1}>
                          {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Error message */}
                  {error && (
                    <motion.div
                      className="rounded-2xl bg-red-50/80 border border-red-200/80 px-4 py-3 text-sm text-red-600"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Forgot password (login only) */}
                  {currentMode === "login" && (
                    <div className="flex justify-end -mt-1">
                      <button
                        type="button"
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {/* Submit button */}
                  <motion.button type="submit" disabled={loading} className={cn("w-full py-2.5 rounded-xl text-xs md:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-600 hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2", "bg-[length:200%_100%] hover:bg-right")} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    {loading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /><span>{currentMode === "login" ? "Signing in..." : "Creating..."}</span></> : <span>{currentMode === "login" ? "Sign in" : "Create account"}</span>}
                  </motion.button>

                  {/* Divider */}
                  <div className="relative flex items-center gap-2">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-[10px] md:text-xs text-slate-400 font-medium">or continue</span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  {/* Google button */}
                  <motion.button type="button" disabled={loading} className={cn("w-full py-2 rounded-xl text-xs md:text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2", "disabled:opacity-60 disabled:cursor-not-allowed")} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Google
                  </motion.button>
                </form>

                {/* Toggle link */}
                <p className="mt-4 text-center text-xs md:text-sm text-slate-500">
                  {currentMode === "login" ? "Don't have an account? " : "Already have an account? "}
                  <button type="button" onClick={toggleMode} className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                    {currentMode === "login" ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </motion.div>
            </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
