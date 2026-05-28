"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  ShoppingCart,
  FileText,
  Receipt,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Item = {
  key: string;
  icon: typeof Home;
  label: string;
  path: string;
  /** Đánh dấu mục chưa hoàn thiện — click toast "sắp ra mắt" */
  soon?: boolean;
};

const ITEMS: Item[] = [
  { key: "home", icon: Home, label: "Trang chủ", path: "/app" },
  { key: "catalog", icon: Package, label: "Sản phẩm", path: "/app/catalog", soon: true },
  { key: "orders", icon: ShoppingCart, label: "Đơn đặt hàng", path: "/app/orders" },
  { key: "quote", icon: FileText, label: "Báo giá", path: "/app/quote" },
  { key: "invoice", icon: Receipt, label: "Hoá đơn", path: "/app/invoice", soon: true },
  { key: "docs", icon: BookOpen, label: "Tài liệu bán hàng", path: "/app/docs", soon: true },
];

function isItemActive(item: Item, pathname: string): boolean {
  // Exact match hoặc match chính xác với sub-path
  if (pathname === item.path) return true;
  // Nếu pathname là sub-path của item.path (VD: /app/catalog thuộc về /app/catalog)
  // Nhưng không match nhầm parent path (VD: /app không thuộc /app/catalog)
  if (pathname.startsWith(item.path + "/")) return true;
  return false;
}

export function SidebarNav() {
  const pathname = usePathname();

  const handleItemClick = (e: React.MouseEvent, item: Item) => {
    // Handle "soon" items
    if (item.soon) {
      e.preventDefault();
      toast.message(`${item.label} — sắp ra mắt`, {
        description: "Tính năng đang trong giai đoạn phát triển.",
      });
    }
  };

  return (
    <aside
      aria-label="Điều hướng chính"
      className="hidden md:flex fixed left-0 top-14 sm:top-16 bottom-0 w-14 z-20 bg-card border-r flex-col items-center py-3 gap-1"
    >
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isItemActive(item, pathname);
        return (
          <Link
            key={item.key}
            href={item.path}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
            onClick={(e) => handleItemClick(e, item)}
            className={cn(
              "group relative grid h-10 w-10 place-items-center rounded-lg transition-all",
              active
                ? "brand-gradient text-white shadow-md"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              item.soon && !active && "opacity-60",
            )}
          >
            <Icon className="h-5 w-5" />
            {/* Tooltip on hover (desktop) */}
            <span
              role="tooltip"
              className="pointer-events-none absolute left-full ml-2 px-2 py-1 rounded bg-foreground text-background text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-lg"
            >
              {item.label}
              {item.soon && <span className="ml-1 text-[10px] opacity-70">(sắp ra)</span>}
            </span>
          </Link>
        );
      })}
    </aside>
  );
}
