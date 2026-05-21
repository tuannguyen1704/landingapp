'use client';
import React, { useState, useEffect } from 'react';
import { Cpu, Factory, Wrench } from 'lucide-react';
import gsap from '@/lib/animations';

interface Metric {
  value: string;
  label: string;
}

interface SectorCase {
  id: string;
  name: string;
  description: string;
  buttonText: string;
  metrics: Metric[];
  tabLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  imageUrl: string;
}

const SECTOR_CASES: SectorCase[] = [
  {
    id: 'manufacturing',
    name: 'Nhà máy sản xuất',
    description: 'M.AI đồng hành bóc tách BOM tự động và chuẩn hóa RFQ nhanh gấp 10 lần cho các khu liên hợp nhà máy chế biến và sản xuất công nghiệp.',
    buttonText: 'Chi tiết giải pháp Nhà máy',
    metrics: [
      { value: '12 giờ', label: 'Báo giá RFQ khẩn cấp' },
      { value: '95%', label: 'Matching danh mục kỹ thuật' },
      { value: '5000+', label: 'NCC kỹ thuật liên kết' }
    ],
    tabLabel: 'Nhà máy sản xuất',
    icon: Factory,
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 'automation',
    name: 'Tự động hóa',
    description: 'Tự động hóa khâu tra cứu, đồng bộ hóa danh mục kỹ thuật giữa mã PLC, biến tần, động cơ, cảm biến của Siemens, Mitsubishi, Schneider, Omron.',
    buttonText: 'Giải pháp ngành Tự động hóa',
    metrics: [
      { value: '30 giây', label: 'Tra cứu mã tương đương' },
      { value: '99.8%', label: 'Độ chuẩn hóa kỹ thuật' },
      { value: '150K+', label: 'Danh mục linh kiện số hóa' }
    ],
    tabLabel: 'Tự động hóa',
    icon: Cpu,
    imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 'mro-maintenance',
    name: 'MRO & Bảo trì',
    description: 'Số hóa quản lý danh sách phụ tùng tiêu hao thường xuyên (MRO). Nhận diện các linh kiện tương đương, tối ưu lượng tồn kho dự phòng an toàn.',
    buttonText: 'Tìm hiểu quản trị MRO',
    metrics: [
      { value: '60%', label: 'Giảm tồn kho tồn đọng' },
      { value: '0%', label: 'Rủi ro sai lệch chủng loại' },
      { value: '24/7', label: 'Giám sát giao hàng real-time' }
    ],
    tabLabel: 'MRO & Bảo trì',
    icon: Wrench,
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1000&auto=format&fit=crop&q=80'
  }
];

const NarrativeCardsList = React.memo(() => {
  return (
    <div className="lg:col-span-7 flex flex-col gap-12 lg:gap-16 pb-16">
      {SECTOR_CASES.map((item, idx) => (
        <div
          key={item.id}
          id={`feature-card-${idx}`}
          className="bg-[#F8FAFC]/95 border border-slate-200/60 rounded-[32px] p-8 md:p-12 shadow-md relative overflow-hidden flex flex-col gap-8 text-left min-h-[480px] hover:border-indigo-100 hover:shadow-lg transition-all"
        >
          <div className="absolute top-0 right-0 w-[240px] h-[240px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="bg-indigo-50 text-indigo-600 p-2 rounded-xl border border-indigo-100/50">
                {React.createElement(item.icon, { className: "w-5 h-5" })}
              </span>
              <span className="text-xs font-black text-indigo-600 tracking-wider uppercase">LĨNH VỰC TIÊU BIỂU</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {item.name}
            </h3>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              {item.description}
            </p>
          </div>

          <div className="relative h-[220px] sm:h-[260px] w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200/40 select-none">
            <img
              src={item.imageUrl}
              alt={item.name}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover grayscale-[5%] contrast-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent" />
          </div>

          <div className="border-t border-slate-200/70 pt-6">
            <div className="grid grid-cols-3 gap-3">
              {item.metrics.map((m, mIdx) => (
                <div key={mIdx} className="flex flex-col gap-1">
                  <span className="text-xl sm:text-2xl font-black text-indigo-600 tracking-tight leading-none bg-gradient-to-r from-indigo-600 to-violet-700 bg-clip-text text-transparent select-none">
                    {m.value}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-normal leading-snug">
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      ))}
    </div>
  );
});
NarrativeCardsList.displayName = 'NarrativeCardsList';

export default function Features() {
  const [activeTab, setActiveTab] = useState<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let ctx = gsap.context(() => {
      SECTOR_CASES.forEach((item, idx) => {
        gsap.timeline({
          scrollTrigger: {
            trigger: `#feature-card-${idx}`,
            start: "top 45%",
            end: "bottom 55%",
            onEnter: () => setActiveTab(idx),
            onEnterBack: () => setActiveTab(idx),
          }
        });

        gsap.fromTo(`#progress-bar-${idx}`,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: `#feature-card-${idx}`,
              start: "top 75%",
              end: "bottom 35%",
              scrub: true,
            }
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    const targetEl = document.getElementById(`feature-card-${index}`);
    if (targetEl) {
      targetEl.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  return (
    <section
      id="features"
      className="pt-24 pb-[61px] bg-white relative overflow-visible scroll-mt-20 flex flex-col justify-center"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/2 left-[-10%] w-[450px] h-[450px] bg-indigo-100/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-[5%] right-[-10%] w-[450px] h-[450px] bg-indigo-50/30 rounded-full blur-[135px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 w-full">

        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-slate-900 tracking-tight leading-tight select-none">
            Đồng hành cùng đa dạng lĩnh vực công nghiệp
          </h2>
          <p className="text-slate-500 mt-[10px] text-sm md:text-base max-w-2xl leading-relaxed">
            Giải pháp M.AI được tinh chỉnh chuyên sâu để tối ưu hóa quy trình nghiệp vụ đặc thù của từng bộ phận.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-20 items-start">

          <div className="lg:col-span-5 lg:sticky lg:top-36 space-y-8 h-fit">
            <div className="space-y-4 bg-slate-50/50 border border-slate-100/80 p-5 rounded-[28px] backdrop-blur-md shadow-sm">
              <div className="px-3 pb-2 text-xs font-black uppercase tracking-widest text-slate-400">
                Lĩnh vực ứng dụng
              </div>

              {SECTOR_CASES.map((item, idx) => {
                const TabIcon = item.icon;
                const isActive = idx === activeTab;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(idx)}
                    className="w-full flex items-stretch gap-5 text-left cursor-pointer focus:outline-none group p-4 rounded-2xl transition-all duration-300 relative overflow-hidden"
                  >
                    <div
                      className={`absolute inset-0 bg-[#F4F6FD] border border-indigo-100/60 rounded-2xl z-0 transition-all duration-300 origin-center ${
                        isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                      }`}
                    />

                    <div className="w-1 shrink-0 flex flex-col items-center justify-center relative z-10">
                      <div className="h-full w-[2px] bg-slate-200/90 rounded-full overflow-hidden relative">
                        <div
                          id={`progress-bar-${idx}`}
                          className="absolute inset-x-0 top-0 w-full bg-indigo-600 rounded-full origin-top"
                          style={{ height: '100%' }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 items-center relative z-10">
                      <span className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-650/15 scale-105'
                          : 'bg-white text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600 border border-slate-100 shadow-sm'
                      }`}>
                        <TabIcon className="w-5 h-5" />
                      </span>
                      <div>
                        <span className={`block text-[15px] font-bold tracking-tight transition-colors ${
                          isActive
                            ? 'text-indigo-950 font-black'
                            : 'text-slate-500 group-hover:text-slate-800'
                        }`}>
                          {item.tabLabel}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5 block leading-none">
                          Chu trình cung ứng số
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="hidden lg:block bg-gradient-to-r from-indigo-50 to-violet-50/50 border border-indigo-100/30 p-5 rounded-2xl text-left select-none">
              <span className="text-xs font-black text-indigo-700 block mb-1">Thiết kế riêng cho B2B</span>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                Cuộn trang hoặc Click chọn danh mục để khám phá các chỉ số bóc tách kỹ thuật tương ứng từng ngành hàng.
              </p>
            </div>
          </div>

          <NarrativeCardsList />

        </div>

      </div>
    </section>
  );
}
