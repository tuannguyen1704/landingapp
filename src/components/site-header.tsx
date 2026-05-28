"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, CheckCircle2, FileText, CreditCard, Receipt, Check, Plus, User, LogOut, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { UserAvatar } from "@/components/user-avatar";
import { useRequest } from "@/components/request-provider";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "search",   label: "Tìm kiếm",   icon: Search,       paths: ["/", "/processing"] as const },
  { key: "match",    label: "Chốt mã",    icon: CheckCircle2, paths: ["/match"] as const },
  { key: "quote",    label: "Báo giá",    icon: FileText,     paths: ["/quote"] as const },
  { key: "checkout", label: "Thanh toán", icon: CreditCard,   paths: ["/checkout", "/payment", "/success"] as const },
] as const;

function activeIndex(pathname: string): number {
  // Trang /orders không nằm trong flow stepper → trả -1 (không có step active)
  const idx = STEPS.findIndex((s) =>
    s.paths.some((p) => {
      if (p === "/") {
        return pathname === "/" || pathname === "/processing";
      }
      return pathname.startsWith(p);
    })
  );
  return idx;
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { reset } = useRequest();
  const { user, openModal, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const activeIdx = activeIndex(pathname);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  const handleNewRequest = () => {
    reset();
    router.push("/app");
  };

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b">
      <div className="flex h-14 sm:h-16 items-center gap-3 sm:gap-6 px-3 sm:px-4 md:px-8 max-w-[1600px] mx-auto">
        <Link href="/app" className="flex items-center gap-2 shrink-0">
          <span
            aria-hidden
            className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-md brand-gradient text-white font-black text-sm sm:text-base shadow"
          >
            V
          </span>
          <span className="text-lg sm:text-xl font-black tracking-tight brand-gradient-text">MAI</span>
          <span className="hidden md:inline text-xs font-bold tracking-wider text-muted-foreground border-l pl-2 uppercase">
            Procurement
          </span>
        </Link>

        {/* Stepper — visual only, không clickable */}
        <ol
          aria-label="Quy trình 4 bước"
          className="flex-1 flex items-center justify-center gap-0.5 sm:gap-1 overflow-x-auto scrollbar-thin -mx-1 px-1"
        >
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isDone = activeIdx > -1 && i < activeIdx;
            const isCurrent = i === activeIdx;
            const isPending = activeIdx === -1 || i > activeIdx;
            return (
              <li key={s.key} className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                {/* Step pill */}
                <div
                  aria-current={isCurrent ? "step" : undefined}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-sm font-medium transition-all select-none",
                    isCurrent && "bg-gradient-to-r from-violet-50 to-blue-50 text-violet-700 border border-violet-200 shadow-sm",
                    isDone && "text-emerald-700",
                    isPending && "text-muted-foreground/70",
                  )}
                >
                  {/* Icon hoặc check */}
                  <span
                    className={cn(
                      "relative grid h-5 w-5 place-items-center rounded-full shrink-0 transition-colors",
                      isCurrent && "brand-gradient text-white shadow",
                      isDone && "bg-emerald-500 text-white",
                      isPending && "bg-muted text-muted-foreground border border-border",
                    )}
                  >
                    {isDone ? <Check className="h-3 w-3" strokeWidth={3} /> : <Icon className="h-3 w-3" />}
                    {isCurrent && (
                      <span className="absolute inset-0 rounded-full ring-2 ring-violet-300/60 animate-[border-glow_2.5s_ease-in-out_infinite]" />
                    )}
                  </span>
                  <span
                    className={cn(
                      "whitespace-nowrap",
                      isCurrent ? "inline font-semibold" : "hidden sm:inline",
                    )}
                  >
                    {s.label}
                  </span>
                </div>

                {/* Connector */}
                {i < STEPS.length - 1 && (
                  <span
                    aria-hidden
                    className={cn(
                      "block h-0.5 w-3 sm:w-5 md:w-8 rounded-full shrink-0 transition-colors",
                      i < activeIdx
                        ? "bg-emerald-400"
                        : i === activeIdx
                          ? "bg-gradient-to-r from-violet-400 to-border"
                          : "bg-border",
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>

        {/* Right cluster: [+ Thêm yêu cầu mới] [Lịch sử] [Đăng nhập / User] */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleNewRequest}
            title="Tạo yêu cầu báo giá mới"
            className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Thêm yêu cầu mới</span>
            <span className="sm:hidden">Mới</span>
          </button>
          <Link
            href="/app/orders"
            aria-label="Lịch sử đơn hàng"
            className={cn(
              "inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-sm font-medium transition-all",
              pathname.startsWith("/app/orders")
                ? "bg-gradient-to-r from-violet-50 to-blue-50 text-violet-700 border border-violet-200 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Lịch sử</span>
          </Link>

          {user ? (
            /* User dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-muted transition-colors"
              >
                <UserAvatar name={user.name} size="sm" />
                <span className="hidden sm:inline text-sm font-medium text-foreground max-w-[120px] truncate">
                  {user.name}
                </span>
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.12)" }}
                >
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <User className="h-4 w-4 text-slate-400" />
                      Tài khoản
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <Settings className="h-4 w-4 text-slate-400" />
                      Cài đặt
                    </Link>
                  </div>

                  {/* Divider + logout */}
                  <div className="border-t border-slate-100 pt-1 pb-1">
                    <button
                      onClick={() => { setDropdownOpen(false); logout(); }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Login button */
            <button
              onClick={() => openModal("login")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold text-white brand-gradient hover:shadow-md hover:shadow-violet-200 transition-all duration-200"
            >
              <User className="h-4 w-4" />
              <span>Đăng nhập</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
