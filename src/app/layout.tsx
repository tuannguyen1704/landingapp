import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { RequestProvider } from "@/components/request-provider";
import { AuthProvider } from "@/components/auth-provider";
import { AuthModalNew } from "@/components/auth-modal-new";

export const metadata: Metadata = {
  title: {
    default: "MECSU — Procurement AI",
    template: "%s · MECSU",
  },
  description:
    "Hệ thống tự động bóc tách yêu cầu, ép giá NCC và tạo đơn mua hàng MRO.",
  applicationName: "MECSU Procurement AI",
  openGraph: {
    title: "MECSU — Procurement AI",
    description:
      "Bóc tách danh sách vật tư MRO, ép giá realtime nhiều NCC, đặt hàng & thanh toán đa kênh.",
    type: "website",
    locale: "vi_VN",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased bg-white">
        <RequestProvider>
          <AuthProvider>
            {children}
            <AuthModalNew />
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </RequestProvider>
      </body>
    </html>
  );
}
