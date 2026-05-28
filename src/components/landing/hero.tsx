'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Paperclip, Zap, Bot, Clock, Box } from 'lucide-react';
import { useRouter } from 'next/navigation';
import gsap from '@/lib/animations';
import { toast } from "sonner";
import { useRequest } from "@/components/request-provider";

export default function Hero() {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const processRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { loadSample } = useRequest();

  const [inputText, setInputText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    tl.fromTo(titleRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1.4 }
    )
    .fromTo(subtitleRef.current,
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 1.1 },
      '-=1.0'
    )
    .fromTo(panelRef.current,
      { opacity: 0, scale: 0.97, y: 40 },
      { opacity: 1, scale: 1, y: 0, duration: 1.3, ease: 'power3.out' },
      '-=0.8'
    );

    if (cardsRef.current) {
      tl.fromTo(cardsRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 },
        '-=0.7'
      );
    }

    if (processRef.current) {
      tl.fromTo(processRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1.0 },
        '-=0.6'
      );
    }

    tl.add(() => {
      gsap.to(panelRef.current, {
        y: 6,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    });

    return () => {
      tl.kill();
    };
  }, []);

  const handleAnalyze = () => {
    if (!inputText.trim()) {
      toast.error("Hãy nhập danh sách hoặc đính kèm tệp/ảnh");
      return;
    }
    loadSample("Yêu cầu từ landing page.txt");
    router.push('/app/processing');
  };

  return (
    <section className="relative min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] flex flex-col items-center pt-10 sm:pt-12 pb-8 bg-[#F8FAFF]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div
          className="absolute inset-y-0 -top-[10%] w-full h-[120%] transition-all duration-75 gsap-parallax"
          style={{
            backgroundImage: `url('/assets/banner_chat.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.95,
            filter: 'contrast(1.05) saturate(1.02)',
          }}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAFF] via-transparent to-[#F8FAFF] pointer-events-none opacity-85" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#F8FAFF]/50 via-transparent to-[#F8FAFF]/50 pointer-events-none" />
      <div className="absolute inset-0 bg-white/32 backdrop-blur-[1.5px] pointer-events-none" />

      <div className="relative w-full max-w-5xl px-6 flex flex-col items-center text-center">
        <h1
          ref={titleRef}
          className="text-3xl md:text-[38px] lg:text-[44px] font-black tracking-tight text-[#0F172A] mb-5 leading-tight select-none"
        >
          Tạo yêu cầu <span className="text-indigo-600 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600">báo giá</span> mới
        </h1>

        <p
          ref={subtitleRef}
          className="text-slate-500 text-xs md:text-sm mb-10 max-w-2xl px-2 -mt-1"
        >
          Gửi danh sách các vật phẩm cần báo giá, hệ thống tự bóc tách và kết nối các nhà cung cấp.
        </p>

        <div className="relative w-full max-w-4xl mx-auto">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
            <div className="bg-gradient-to-r from-[#4F46E5] to-[#4338CA] px-4 py-0.5 rounded-full shadow-md shadow-indigo-600/20 border border-white/25 flex items-center gap-1 whitespace-nowrap">
              <span className="text-white text-[10px] uppercase font-black tracking-widest">KHU VỰC XỬ LÝ AI</span>
            </div>
          </div>

          <div
            ref={panelRef}
            className="bg-white/95 backdrop-blur-sm border border-[#6366F1]/80 rounded-[24px] p-4 md:p-5 shadow-[0_15px_45px_rgba(99,102,241,0.06)] relative"
          >
            <div className="relative min-h-[100px] w-full text-left">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full min-h-[100px] bg-transparent text-slate-800 placeholder-transparent focus:outline-none resize-none relative z-10 text-sm md:text-base leading-relaxed"
                id="procurement-textarea"
              />

              {!inputText && (
                <div className="absolute inset-x-0 top-0 pointer-events-none flex flex-col gap-2 text-slate-400/80 text-xs md:text-sm z-0">
                  <p>Dán danh sách vật tư từ Excel, Word, Zalo hoặc gõ trực tiếp vào đây...</p>
                  <p className="text-slate-400/65">Ví dụ: 5 cái bạc đạn 6023, 100 con bulong M8 20, 10 mũi khoan 5 li, 1 máy khoan, 1 thùng RP7</p>
                  <p className="text-slate-400/50">— Hoặc bạn có thể dán (Ctrl+V) hình ảnh trực tiếp vào ô chat này.</p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3.5 border-t border-slate-100/90 z-10 relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF5FF] border border-violet-100 rounded-xl text-[#4F46E5] text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  Tệp đính kèm
                </button>
                <span className="text-[10px] md:text-xs text-slate-400 font-medium">
                  .xlsx • .csv • .pdf • .png • .jpg • paste Ctrl+V
                </span>
              </div>

              <button
                onClick={handleAnalyze}
                className="bg-gradient-to-r from-indigo-700 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-7 py-2.5 rounded-xl font-bold text-xs md:text-sm shadow-md shadow-indigo-600/15 hover:scale-[1.01] transform transition-all flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
              >
                <Zap className="w-4 h-4 fill-white" />
                Phân tích ngay
              </button>
            </div>
          </div>
        </div>

        <div className="w-full mt-4 space-y-3.5">
          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="bg-white/95 border border-slate-100/90 rounded-2xl p-3.5 flex items-center gap-3 text-left shadow-[0_4px_12px_rgba(99,102,241,0.02)] transition-all hover:-translate-y-0.5 hover:shadow-indigo-600/5">
              <div className="w-9 h-9 bg-indigo-50/70 rounded-xl flex items-center justify-center shrink-0">
                <Bot className="w-4.5 h-4.5 text-indigo-600" />
              </div>
              <div>
                <h4 className="font-bold text-xs md:text-sm text-slate-850 leading-normal">Bóc tách nhiều định dạng</h4>
                <p className="text-slate-400 text-[11px] mt-0.5">Excel, danh sách, hình ảnh.</p>
              </div>
            </div>

            <div className="bg-white/95 border border-slate-100/90 rounded-2xl p-3.5 flex items-center gap-3 text-left shadow-[0_4px_12px_rgba(99,102,241,0.02)] transition-all hover:-translate-y-0.5 hover:shadow-indigo-600/5">
              <div className="w-9 h-9 bg-indigo-50/70 rounded-xl flex items-center justify-center shrink-0">
                <Clock className="w-4.5 h-4.5 text-indigo-600" />
              </div>
              <div>
                <h4 className="font-bold text-xs md:text-sm text-slate-850 leading-normal">Báo giá trong 60 giây</h4>
                <p className="text-slate-400 text-[11px] mt-0.5">Kết nối tất cả NCC trên hệ thống.</p>
              </div>
            </div>

            <div className="bg-white/95 border border-slate-100/90 rounded-2xl p-3.5 flex items-center gap-3 text-left shadow-[0_4px_12px_rgba(99,102,241,0.02)] transition-all hover:-translate-y-0.5 hover:shadow-indigo-600/5">
              <div className="w-9 h-9 bg-amber-50/60 rounded-xl flex items-center justify-center shrink-0">
                <Box className="w-4.5 h-4.5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-bold text-xs md:text-sm text-slate-850 leading-normal">Đa dạng lựa chọn</h4>
                <p className="text-slate-400 text-[11px] mt-0.5">Đa dạng sản phẩm, nhiều lựa chọn hơn.</p>
              </div>
            </div>
          </div>

          <div ref={processRef} className="bg-[#F4F6FD]/85 border border-[#E2E8F0] rounded-[24px] p-4 md:p-5 tracking-tight flex flex-col gap-4 text-left w-full shadow-sm">
            <div className="flex items-center justify-between w-full border-b border-[#E4E9FB]/60 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[#4F46E5] flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4.5 h-4.5">
                    <path d="M12 1a1 1 0 0 1 .947.684l1.342 4.026a1 1 0 0 0 .632.632l4.026 1.342a1 1 0 0 1 0 1.894l-4.026 1.342a1 1 0 0 0-.632.632l-1.342 4.026a1 1 0 0 1-1.894 0l-1.342-4.026a1 1 0 0 0-.632-.632L6.335 9.578a1 1 0 0 1 0-1.894l4.026-1.342a1 1 0 0 0 .632-.632L11.053 1.684A1 1 0 0 1 12 1z" />
                    <path d="M5 13a1 1 0 0 1 .947.684l.658 1.974c.059.176.197.315.373.373l1.974.658a1 1 0 0 1 0 1.894l-1.974.658c-.176.059-.315.197-.373.373l-.658 1.974a1 1 0 0 1-1.894 0l-.658-1.974a1.002 1.002 0 0 0-.373-.373l-1.974-.658a1 1 0 0 1 0-1.894l1.974-.658c.176-.059.315-.197.373-.373l.658-1.974A1 1 0 0 1 5 13zm14 3a1 1 0 0 1 .947.684l.658 1.974c.059.176.197.315.373.373l1.974.658a1 1 0 0 1 0 1.894l-1.974.658c-.176.059-.315.197-.373.373l-.658 1.974a1 1 0 0 1-1.894 0l-.658-1.974a1.002 1.002 0 0 0-.373-.373l-1.974-.658a1 1 0 0 1 0-1.894l1.974-.658c.176-.059.315-.197.373-.373l.658-1.974A1 1 0 0 1 19 16z" />
                  </svg>
                </span>
                <h4 className="font-extrabold text-[#312E81] text-sm md:text-[15px] tracking-tight whitespace-nowrap bg-indigo-50 px-2 py-0.5 rounded-md">Quy trình 4 bước</h4>
              </div>
              <span className="text-[10px] md:text-xs text-slate-400 font-medium italic">
                Từ paste danh sách đến đặt hàng chỉ trong vòng 60 giây
              </span>
            </div>

            <div className="flex flex-row flex-nowrap items-center justify-start lg:justify-between gap-2 text-[11px] font-bold overflow-x-auto scrollbar-none w-full">
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-[12px] border border-[#E2E8F0] shadow-[0_1px_2px_rgba(0,0,0,0.02)] shrink-0">
                <span className="w-6 h-6 shrink-0 bg-[#4F46E5] text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span className="text-[#334155] whitespace-nowrap">Tìm kiếm & bóc tách</span>
              </div>

              <span className="text-[#A5B4FC] font-bold text-xs shrink-0">&gt;</span>

              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-[12px] border border-[#E2E8F0] shadow-[0_1px_2px_rgba(0,0,0,0.02)] shrink-0">
                <span className="w-6 h-6 shrink-0 bg-[#4F46E5] text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span className="text-[#334155] whitespace-nowrap">Chốt mã sản phẩm</span>
              </div>

              <span className="text-[#A5B4FC] font-bold text-xs shrink-0">&gt;</span>

              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-[12px] border border-[#E2E8F0] shadow-[0_1px_2px_rgba(0,0,0,0.02)] shrink-0">
                <span className="w-6 h-6 shrink-0 bg-[#4F46E5] text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span className="text-[#334155] whitespace-nowrap">Kết nối NCC</span>
              </div>

              <span className="text-[#A5B4FC] font-bold text-xs shrink-0">&gt;</span>

              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-[12px] border border-[#E2E8F0] shadow-[0_1px_2px_rgba(0,0,0,0.02)] shrink-0">
                <span className="w-6 h-6 shrink-0 bg-[#4F46E5] text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <span className="text-[#334155] whitespace-nowrap">Đặt hàng & thanh toán</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
