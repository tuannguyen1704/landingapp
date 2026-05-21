'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import gsap from '@/lib/animations';

interface Testimonial {
  name: string;
  review: string;
  stars: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Samsung Factory",
    review: "M.AI giúp chúng tôi rút ngắn đáng kể thời gian xử lý RFQ và tìm nhà cung cấp phù hợp nhanh hơn trước rất nhiều.",
    stars: 5,
  },
  {
    name: "LS Electric",
    review: "Khả năng tìm thiết bị tương đương của M.AI cực kỳ hữu ích cho đội ngũ automation khi cần thay thế linh kiện khẩn cấp.",
    stars: 5,
  },
  {
    name: "THACO",
    review: "Tính năng nhận diện vật tư từ hình ảnh giúp đội bảo trì tìm đúng linh kiện chỉ trong vài phút.",
    stars: 5,
  },
  {
    name: "Doosan",
    review: "Dữ liệu được chuẩn hóa rõ ràng và dễ đối chiếu. M.AI giúp tối ưu đáng kể quy trình mua hàng nội bộ.",
    stars: 5,
  },
  {
    name: "Hyosung",
    review: "Giao diện trực quan, dễ sử dụng và phù hợp với môi trường sản xuất công nghiệp thực tế.",
    stars: 5,
  },
  {
    name: "Yaskawa",
    review: "Khả năng bóc tách BOM và tổng hợp vật tư giúp đội ngũ kỹ thuật tiết kiệm hàng giờ làm việc mỗi tuần.",
    stars: 5,
  },
  {
    name: "VinFast",
    review: "M.AI hỗ trợ xử lý nhanh các yêu cầu vật tư khẩn cấp và giảm đáng kể thời gian tìm kiếm thủ công.",
    stars: 5,
  }
];

const StoryGrid = React.memo(() => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-stretch">
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="group relative overflow-hidden rounded-2xl bg-slate-900 border border-white/10 h-[240px] shadow-xl hover:shadow-2xl transition-all duration-300">
          <img
            src="https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=650&q=80"
            alt="SentriLock"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-75 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent rounded-2xl" />
          <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
            <h3 className="text-white font-extrabold text-base md:text-md lg:text-lg leading-snug tracking-tight group-hover:text-blue-100 transition-colors">
              Tự động hóa chuỗi cung ứng cho nhà máy sản xuất
            </h3>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-slate-900 border border-white/10 h-[240px] shadow-xl hover:shadow-2xl transition-all duration-300">
          <img
            src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=650&q=80"
            alt="Electric Motorcycle"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-75 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent rounded-2xl" />
          <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
            <h3 className="text-white font-extrabold text-base md:text-md lg:text-lg leading-snug tracking-tight group-hover:text-blue-100 transition-colors">
              Tối ưu tìm kiếm linh kiện cho hệ thống automation
            </h3>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 flex">
        <div className="group relative overflow-hidden rounded-2xl bg-slate-900 border border-white/10 w-full min-h-[350px] lg:h-[504px] shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-end">
          <img
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80"
            alt="Moon Lander Spacecraft"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-75 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent rounded-2xl" />
          <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
            <h3 className="text-white font-black text-lg md:text-xl lg:text-2xl leading-snug tracking-tight group-hover:text-blue-100 transition-colors">
              AI hỗ trợ xử lý vật tư cho dự án công nghiệp quy mô lớn
            </h3>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="group relative overflow-hidden rounded-2xl bg-slate-900 border border-white/10 h-[240px] shadow-xl hover:shadow-2xl transition-all duration-300">
          <img
            src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=650&q=80"
            alt="Laser Tube Cutting"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-75 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent rounded-2xl" />
          <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
            <h3 className="text-white font-extrabold text-base md:text-md lg:text-lg leading-snug tracking-tight group-hover:text-blue-100 transition-colors">
              Kết nối nhanh nhà cung cấp cho nhu cầu vật tư khẩn cấp
            </h3>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-slate-900 border border-white/10 h-[240px] shadow-xl hover:shadow-2xl transition-all duration-300">
          <img
            src="https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=650&q=80"
            alt="Core Science Laboratory"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-75 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent rounded-2xl" />
          <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
            <h3 className="text-white font-extrabold text-base md:text-md lg:text-lg leading-snug tracking-tight group-hover:text-blue-100 transition-colors">
              M.AI giúp đội bảo trì giảm downtime vận hành
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
});
StoryGrid.displayName = 'StoryGrid';

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const layer1Ref = useRef<HTMLDivElement>(null);
  const layer2Ref = useRef<HTMLDivElement>(null);
  const layer3Ref = useRef<HTMLDivElement>(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const el1 = layer1Ref.current;
    const el2 = layer2Ref.current;
    const el3 = layer3Ref.current;
    const trigger = sectionRef.current;

    if (!el1 || !el2 || !el3 || !trigger) return;

    let ctx = gsap.context(() => {
      gsap.fromTo(el1,
        { y: -30, scale: 0.95 },
        {
          y: 60,
          scale: 1.05,
          ease: "none",
          scrollTrigger: {
            trigger: trigger,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          }
        }
      );

      gsap.fromTo(el2,
        { y: 50, rotation: -4 },
        {
          y: -50,
          rotation: 4,
          ease: "none",
          scrollTrigger: {
            trigger: trigger,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          }
        }
      );

      gsap.fromTo(el3,
        { y: -80 },
        {
          y: 80,
          ease: "none",
          scrollTrigger: {
            trigger: trigger,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          }
        }
      );
    });

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="pt-[70px] pb-[70px] pl-[1px] bg-[#090d16] text-white relative overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1.5px,transparent_1.5px)] bg-[size:2rem_2rem] opacity-90 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d403_1px,transparent_1px),linear-gradient(to_bottom,#06b6d403_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-60" />

        <div
          ref={layer1Ref}
          className="absolute -top-[25%] -left-[10%] w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[160px] will-change-transform"
        />

        <div
          ref={layer2Ref}
          className="absolute -bottom-[20%] -right-[10%] w-[750px] h-[750px] bg-fuchsia-600/10 rounded-full blur-[170px] will-change-transform"
        />

        <div
          ref={layer3Ref}
          className="absolute inset-0 will-change-transform pointer-events-none opacity-90 hidden sm:block"
        >
          <div className="absolute top-[15%] left-[18%] w-3 h-3 bg-cyan-400 rounded-full animate-pulse blur-xs" />
          <div className="absolute top-[40%] right-[12%] w-4 h-4 bg-fuchsia-400/70 rounded-full animate-ping" />
          <div className="absolute bottom-[25%] left-[8%] w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <div className="absolute bottom-[12%] right-[22%] w-1.5 h-1.5 bg-cyan-300 rounded-full" />

          <div className="absolute top-[30%] left-[15%] w-32 h-32 rounded-full border border-cyan-500/10 flex items-center justify-center animate-[spin_50s_linear_infinite]">
            <div className="w-24 h-24 rounded-full border border-dashed border-cyan-500/5 flex items-center justify-center">
              <div className="w-2 h-2 bg-cyan-500/20 rounded-full" />
            </div>
          </div>

          <div className="absolute bottom-[15%] right-[20%] w-48 h-48 rounded-full border border-fuchsia-500/5 flex items-center justify-center animate-[spin_80s_linear_infinite_reverse]">
            <div className="w-40 h-40 rounded-full border border-dotted border-fuchsia-500/5" />
          </div>

          <span className="absolute top-[25%] right-[28%] text-cyan-500/20 font-mono text-lg select-none">+</span>
          <span className="absolute bottom-[35%] left-[25%] text-fuchsia-500/20 font-mono text-lg select-none">+</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">

        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-[38px] font-extrabold text-white tracking-tight leading-[49px]">
            Real Stories, Real Impact
          </h2>
        </div>

        <StoryGrid />

        <div className="relative mt-2 py-4">

          <div className="hidden md:block absolute top-[40%] -left-8 z-20">
            <button
              onClick={prevSlide}
              aria-label="Previous Testimonial"
              className="bg-white/10 hover:bg-white/20 hover:scale-105 text-white p-3.5 rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>

          <div className="hidden md:block absolute top-[40%] -right-8 z-20">
            <button
              onClick={nextSlide}
              aria-label="Next Testimonial"
              className="bg-white/10 hover:bg-white/20 hover:scale-105 text-white p-3.5 rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="overflow-hidden px-2 rounded-2xl">
            <div
              className="flex gap-6 transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 280}px)` }}
            >
              {TESTIMONIALS.map((t, index) => (
                <div
                  key={index}
                  className={`bg-white text-slate-900 p-6 rounded-2xl w-[260px] md:w-[320px] shrink-0 shadow-lg border border-slate-100 hover:border-slate-200 transition-all duration-300 flex flex-col justify-between h-[230px] ${currentIndex === index ? 'ring-2 ring-white/40 scale-100' : 'opacity-90'}`}
                >
                  <div>
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: t.stars }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-[#EAB308] text-[#EAB308]"
                        />
                      ))}
                    </div>

                    <p className="text-slate-600 font-medium text-xs md:text-sm leading-relaxed line-clamp-4">
                      "{t.review}"
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="font-bold text-slate-900 text-xs md:text-sm tracking-wide block">
                      {t.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
