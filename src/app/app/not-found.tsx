import Link from "next/link";
import { Compass, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container max-w-md py-16 text-center">
      <div className="grid h-16 w-16 mx-auto place-items-center rounded-full bg-violet-50 text-violet-600 mb-4">
        <Compass className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold mb-1">Không tìm thấy trang</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Đường dẫn này không tồn tại trong hệ thống MECSU. Có thể đã bị xoá hoặc URL sai.
      </p>
      <div className="flex items-center justify-center gap-2">
        <Button asChild className="brand-gradient text-white border-0 hover:opacity-90">
          <Link href="/">
            <Home className="h-4 w-4" /> Về trang chủ
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/app/orders">
            <Search className="h-4 w-4" /> Tra cứu đơn hàng
          </Link>
        </Button>
      </div>
    </div>
  );
}
