'use client';
import React from 'react';
import { Keyboard, BrainCircuit, Box } from 'lucide-react';
import ScrollReveal from './scroll-reveal';

const steps = [
  {
    num: '01',
    title: 'Nhập yêu cầu',
    desc: 'Mô tả nhu cầu vật tư tự nhiên (qua text, file Excel liệt kê, hoặc kéo thả ảnh nhãn thông số chụp từ thực địa).',
    icon: Keyboard,
  },
  {
    num: '02',
    title: 'AI bóc tách thông số',
    desc: 'Hệ thống tự động tách lọc bước ren, đường kính lý thuyết, tiêu chuẩn thiết kế quốc tế (DIN, ISO, JIS).',
    icon: BrainCircuit,
  },
  {
    num: '03',
    title: 'Gợi ý sản phẩm phù hợp',
    desc: 'Tìm kiếm chính xác SKU sẵn có tại kho Mecsu hoặc nhà cung cấp đối tác trong 1.5 giây kèm báo giá chi tiết.',
    icon: Box,
  },
];

export default function HowItWorks() {
  return (
    <section className="pt-[46px] pb-[46px] bg-white relative overflow-hidden">
      <div className="absolute top-0 right-10 w-96 h-96 bg-indigo-50/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-8 relative z-10">

        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-xs font-bold tracking-[0.2em] text-indigo-600 uppercase">Quy trình vận hành tối giản</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-2 tracking-tight">Quy trình thông minh 3 Bước</h2>
            <p className="text-slate-500 mt-4">m.ai loại bỏ toàn bộ chu kỳ phản hồi kéo dài hàng giờ và thủ tục rườm rà của mua sắm B2B truyền thống.</p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-12 relative">
          <div className="absolute top-[40px] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-indigo-200 via-violet-200 to-indigo-100 hidden md:block -z-10" />

          {steps.map((st, i) => (
            <ScrollReveal key={i} delay={i * 150} className="w-full">
              <div className="flex flex-col items-center text-center group">

                <div className="w-20 h-20 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100/30 group-hover:border-indigo-500 group-hover:shadow-indigo-500/10 transition-all duration-300 relative">
                  <span className="absolute -top-3 -right-3 px-2 py-0.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-md text-[10px] font-black tracking-wide">
                    {st.num}
                  </span>
                  <st.icon className="w-8 h-8 text-indigo-600 group-hover:scale-110 transition-transform" />
                </div>

                <h3 className="text-xl font-bold mt-6 mb-3 text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {st.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
                  {st.desc}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
