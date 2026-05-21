"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, FileSearch, Sparkles, Boxes, Check } from "lucide-react";

const STEPS = [
  { icon: FileSearch, label: "Đọc & nhận diện file", sub: "OCR ảnh + parse Excel" },
  { icon: Sparkles,   label: "Bóc tách bằng AI",     sub: "Tách số lượng, đơn vị, mô tả" },
  { icon: Boxes,      label: "Chuẩn hoá mã sản phẩm", sub: "So khớp với 500.000+ mã SKU MRO" },
];

export default function ProcessingPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 700),
      setTimeout(() => setStep(2), 1500),
      setTimeout(() => setStep(3), 2400),
      setTimeout(() => router.push("/app/match"), 3000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [router]);

  return (
    <div className="container max-w-2xl py-8 sm:py-12 md:py-24">
      <div className="rounded-2xl bg-card border shadow-xl p-5 sm:p-8 md:p-10 text-center">
        {/* Big spinner */}
        <div className="relative inline-grid place-items-center mb-6">
          <div className="absolute inset-0 -m-4 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
          <div className="grid h-16 w-16 place-items-center rounded-full bg-blue-50">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">Đang bóc tách yêu cầu...</h1>
        <p className="text-muted-foreground text-sm">
          Hệ thống đang chuẩn hoá mã sản phẩm.
        </p>

        {/* steps */}
        <ul className="mt-8 space-y-2 text-left">
          {STEPS.map((s, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <li
                key={i}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-300 ${
                  active ? "border-blue-300 bg-blue-50/60 shadow-sm" : "border-transparent bg-muted/40"
                } ${done ? "opacity-60" : ""}`}
              >
                <div
                  className={`grid h-9 w-9 place-items-center rounded-full transition-colors ${
                    done
                      ? "bg-emerald-500 text-white"
                      : active
                        ? "bg-blue-600 text-white"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : active ? <Loader2 className="h-4 w-4 animate-spin" /> : <s.icon className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{s.label}</div>
                  <div className="text-xs text-muted-foreground">{s.sub}</div>
                </div>
                {active && (
                  <div className="flex gap-0.5">
                    <span className="step-dot" />
                    <span className="step-dot" />
                    <span className="step-dot" />
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mt-6 text-xs text-muted-foreground">
          Trung bình mất 8-15 giây cho 50 dòng. Đừng đóng tab này.
        </div>
      </div>
    </div>
  );
}
