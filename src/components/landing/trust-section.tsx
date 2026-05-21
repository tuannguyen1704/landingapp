'use client';
import React from 'react';
import {
  Search,
  Tag,
  Link2,
  ShoppingCart,
} from 'lucide-react';

interface FeatureCard {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  image: string;
}

const FEATURES: FeatureCard[] = [
  {
    id: 'tim-kiem',
    icon: Search,
    title: 'Tìm kiếm & bóc tách thông minh',
    description: 'Tự động nhận diện bản vẽ, bóc tách vật tư chính xác chỉ trong vài giây.',
    image: '/assets/timkiem.png',
  },
  {
    id: 'chot-ma',
    icon: Tag,
    title: 'Chốt mã & báo giá siêu nhanh',
    description: 'Gợi ý mã sản phẩm phù hợp, tự động tính giá và tạo báo giá chuyên nghiệp chỉ trong vài phút.',
    image: '/assets/chotma.png',
  },
  {
    id: 'ket-noi',
    icon: Link2,
    title: 'Kết nối NCC đáng tin cậy',
    description: 'Kết nối hàng nghìn nhà cung cấp uy tín, so sánh giá & thời gian giao hàng tức thì.',
    image: '/assets/ketnoi.png',
  },
  {
    id: 'dat-hang',
    icon: ShoppingCart,
    title: 'Đặt hàng & thanh toán dễ dàng',
    description: 'Đặt hàng, theo dõi tiến độ và thanh toán minh bạch trên một nền tảng duy nhất.',
    image: '/assets/dathang.png',
  },
];

const FeatureCardComponent = React.memo(({ feature }: { feature: FeatureCard }) => {
  const Icon = feature.icon;

  return (
    <div className="group relative flex flex-col bg-white border border-[#E8E4FF] rounded-[28px] p-8 transition-all duration-300 hover:shadow-[0_8px_40px_-12px_rgba(91,77,255,0.15)] hover:border-[#7B6DFF] hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-[#F8F7FF] to-white rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">
        <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#F3F0FF] to-[#EDE8FF] border border-[#DDD8FF] rounded-2xl mb-6 group-hover:from-[#5B4DFF] group-hover:to-[#7B6DFF] group-hover:border-[#5B4DFF] group-hover:shadow-[0_4px_20px_-4px_rgba(91,77,255,0.4)] transition-all duration-300">
          <Icon className="w-5 h-5 text-[#5B4DFF] group-hover:text-white transition-colors duration-300" />
        </span>

        <h3 className="text-lg font-bold text-slate-900 mb-3 leading-snug">
          {feature.title}
        </h3>

        <div className="w-12 h-[2px] bg-gradient-to-r from-[#5B4DFF] to-[#7B6DFF] rounded-full mb-4 group-hover:w-16 transition-all duration-300" />

        <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-1">
          {feature.description}
        </p>

        <div className="relative w-full h-[180px] rounded-2xl overflow-hidden bg-white border border-[#F3F0FF] group-hover:border-transparent transition-all duration-300">
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={feature.image}
              alt={feature.title}
              className="w-full h-full object-contain p-4"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
});

FeatureCardComponent.displayName = 'FeatureCardComponent';

export default function TrustSection() {
  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#F8F7FF] to-transparent pointer-events-none" />
      <div className="absolute top-20 left-1/4 -translate-x-1/2 w-72 h-72 bg-[#5B4DFF]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 translate-x-1/2 w-72 h-72 bg-[#7B6DFF]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        <div className="text-center mb-16 md:mb-20">
          <span className="inline-block px-4 py-1.5 bg-[#F3F0FF] border border-[#E8E4FF] rounded-full text-xs font-bold text-[#5B4DFF] uppercase tracking-wider mb-6">
            Tính năng nổi bật
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-slate-900 tracking-tight leading-tight mb-5">
            Giải pháp toàn diện cho mua sắm B2B
          </h2>
          <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            M.AI đồng hành cùng doanh nghiệp từ bóc tách vật tư đến thanh toán,
            tối ưu hóa mọi bước trong chuỗi cung ứng công nghiệp.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
          {FEATURES.map((feature) => (
            <FeatureCardComponent key={feature.id} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
