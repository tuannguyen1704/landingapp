"use client";
import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    if (process.env.NODE_ENV === "development") console.error(error);
  }, [error]);

  return (
    <div className="container max-w-md py-16 text-center">
      <div className="grid h-16 w-16 mx-auto place-items-center rounded-full bg-red-50 text-red-600 mb-4">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold mb-1">Đã xảy ra lỗi</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Hệ thống gặp sự cố khi xử lý yêu cầu. Vui lòng thử lại hoặc về trang chủ.
      </p>
      <div className="flex items-center justify-center gap-2">
        <Button onClick={reset} className="brand-gradient text-white border-0 hover:opacity-90">
          <RotateCcw className="h-4 w-4" /> Thử lại
        </Button>
        <Button asChild variant="outline">
          <Link href="/app">
            <Home className="h-4 w-4" /> Về trang chủ
          </Link>
        </Button>
      </div>
    </div>
  );
}
