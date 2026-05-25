"use client";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  email?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

const SIZE_MAP = {
  sm: "h-8 w-8 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-16 w-16 text-xl",
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = [
    "from-violet-500 to-indigo-500",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-amber-500",
    "from-pink-500 to-rose-500",
    "from-purple-500 to-violet-500",
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

export function UserAvatar({ name, size = "md", className, onClick }: UserAvatarProps) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      className={cn(
        "rounded-full brand-gradient flex items-center justify-center font-bold text-white shadow-md select-none cursor-default shrink-0",
        SIZE_MAP[size],
        onClick && "cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200",
        className
      )}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}
