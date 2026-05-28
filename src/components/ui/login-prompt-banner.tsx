"use client";
import { Lock, LogIn } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";

interface LoginPromptBannerProps {
  purpose?: string;
  title?: string;
  description?: string;
  variant?: "card" | "inline" | "banner";
  showOnlyButton?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function LoginPromptBanner({
  purpose = "xem nội dung này",
  title,
  description,
  variant = "card",
  showOnlyButton = false,
  onDismiss,
  className,
}: LoginPromptBannerProps) {
  const { openModal } = useAuth();

  const handleLogin = () => {
    openModal("login");
  };

  const defaultTitle = "Bạn chưa đăng nhập";
  const defaultDescription = `Vui lòng đăng nhập để ${purpose}.`;

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground">
          {showOnlyButton ? (
            <>
              <button
                onClick={handleLogin}
                className="text-indigo-600 hover:text-indigo-700 font-medium underline-offset-2 hover:underline"
              >
                Đăng nhập
              </button>{" "}
              để {purpose}
            </>
          ) : (
            defaultDescription
          )}
        </span>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100",
          className
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
            <Lock className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-slate-900 truncate">
              {title || defaultTitle}
            </p>
            <p className="text-xs text-slate-600">
              {description || defaultDescription}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="px-3 py-2 rounded-lg text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              Đóng
            </button>
          )}
          <button
            onClick={handleLogin}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  // Default: card variant
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[50vh] text-center px-4 py-12",
        className
      )}
    >
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-6">
        <Lock className="h-10 w-10 text-indigo-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">
        {title || defaultTitle}
      </h2>
      <p className="text-slate-500 max-w-sm mb-8">
        {description || defaultDescription}
      </p>
      <button
        onClick={handleLogin}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        <LogIn className="h-5 w-5" />
        Đăng nhập ngay
      </button>
      <p className="mt-4 text-xs text-slate-400">
        Chưa có tài khoản?{" "}
        <button
          onClick={() => openModal("register")}
          className="text-indigo-600 hover:underline font-medium"
        >
          Đăng ký miễn phí
        </button>
      </p>
    </div>
  );
}
