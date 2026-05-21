'use client';
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import gsap from '@/lib/animations';

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    gsap.fromTo(
      '#navbar',
      { y: -100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power4.out',
        onComplete: () => {
          gsap.set('#navbar', { clearProps: 'y,opacity' });
        }
      }
    );

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-indigo-50/50 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
                <span className="text-white font-bold text-base sm:text-lg">m</span>
            </div>
            <div className="flex flex-col -space-y-1">
                <span className="text-lg sm:text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">m.ai</span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-400 font-semibold select-none leading-none">Powered by Mecsu</span>
            </div>
        </Link>

        <div className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-600">
          {['Trang chủ', 'Tính năng', 'Demo AI', 'Danh mục', 'Giải pháp'].map((item) => (
            <a key={item} href="#" className="hover:text-indigo-600 transition-colors py-1 hover:border-b-2 border-indigo-600">
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2.5 sm:gap-4">
          <button className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors py-1.5 px-1">Đăng nhập</button>
          <Link href="/app" className="bg-indigo-600 text-white px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold shadow-md shadow-indigo-200 hover:scale-[1.03] active:scale-[0.97] transition-all inline-block">
            Dùng thử m.ai
          </Link>
        </div>
      </div>
    </nav>
  );
}
