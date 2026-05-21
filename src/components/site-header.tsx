"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, CheckCircle2, FileText, CreditCard, Receipt, Check, Plus } from "lucide-react";
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
  const idx = STEPS.findIndex((s) => s.paths.some((p) => p === "/" ? pathname === p || pathname === "/processing" : pathname.startsWith(p)));
  return idx;
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { reset } = useRequest();
  const activeIdx = activeIndex(pathname);

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

        {/* Right cluster: [+ Thêm yêu cầu mới]  [Lịch sử]  — Lịch sử sát mép phải */}
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
            href="/orders"
            aria-label="Lịch sử đơn hàng"
            className={cn(
              "inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-sm font-medium transition-all",
              pathname.startsWith("/orders")
                ? "bg-gradient-to-r from-violet-50 to-blue-50 text-violet-700 border border-violet-200 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Lịch sử</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
