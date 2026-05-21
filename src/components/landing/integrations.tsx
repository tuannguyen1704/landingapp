'use client';
import React from 'react';
import ScrollReveal from './scroll-reveal';

const BoschLogo = () => (
  <div className="flex items-center gap-2">
    <svg className="w-8 h-8 shrink-0 text-[#4B5563]" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="20" cy="20" r="8" stroke="currentColor" strokeWidth="1.5" />
      <rect x="18" y="11" width="4" height="18" rx="1" fill="currentColor" />
      <rect x="11" y="18" width="18" height="4" rx="1" fill="currentColor" />
    </svg>
    <span className="text-xl font-black text-[#E31B23] tracking-tight">BOSCH</span>
  </div>
);

const SataLogo = () => (
  <div className="flex items-center gap-1">
    <svg className="w-7 h-7 shrink-0" viewBox="0 0 40 40" fill="none">
      <polygon points="20,4 34,12 34,28 20,36 6,28 6,12" stroke="#005C33" strokeWidth="3" fill="none" />
      <polygon points="20,10 29,15 29,25 20,30 11,25 11,15" fill="#005C33" opacity="0.15" />
      <line x1="20" y1="4" x2="20" y2="36" stroke="#005C33" strokeWidth="2" />
      <line x1="6" y1="12" x2="34" y2="28" stroke="#005C33" strokeWidth="2" />
      <line x1="6" y1="28" x2="34" y2="12" stroke="#005C33" strokeWidth="2" />
    </svg>
    <div className="flex flex-col items-start leading-none pl-0.5">
      <span className="text-[18px] font-extrabold text-[#005C33] tracking-tighter">SATA</span>
      <span className="text-[5px] font-bold text-[#005C33] opacity-80 self-end -mt-0.5">TM</span>
    </div>
  </div>
);

const PiscoLogo = () => (
  <div className="relative flex items-center justify-center px-4 py-2">
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 120 40" fill="none">
      <ellipse cx="60" cy="20" rx="46" ry="11" stroke="#0A4EA3" strokeWidth="1.5" transform="rotate(-5 60 20)" />
    </svg>
    <span className="text-[17px] font-extrabold text-[#0A4EA3] tracking-tight relative z-10 bg-white px-1 select-none">
      PISCO<span className="text-[8px] align-super font-bold">&#174;</span>
    </span>
  </div>
);

const CdcLogo = () => (
  <div className="flex flex-col items-center justify-center leading-none text-center">
    <div className="flex items-center gap-1 relative py-1">
      <span className="text-[20px] font-black italic text-[#00529C] tracking-tighter relative z-10">CDC</span>
    </div>
    <span className="text-[5.5px] font-black text-slate-400 tracking-tighter uppercase">PNEUMATICS CORP.</span>
  </div>
);

const SelleysLogo = () => (
  <div className="bg-[#0F2C59] px-4 py-1.5 rounded-[4px] border border-[#0F2C59] shadow-inner flex items-center justify-center scale-95">
    <span className="text-white text-[15px] font-black italic tracking-wider">
      SELLEYS<span className="text-[8px] align-super font-bold opacity-85 pl-0.5">&#174;</span>
    </span>
  </div>
);

const KstLogo = () => (
  <div className="flex items-center justify-center leading-none">
    <span className="text-2xl font-black text-[#EA1E24] tracking-tight flex items-center">
      K
      <span className="relative inline-block mx-0.5 select-none text-[#EA1E24]">
        S
        <span className="absolute inset-x-0 top-1.5 h-[1.5px] bg-white opacity-90" />
        <span className="absolute inset-x-0 bottom-1.5 h-[1.5px] bg-white opacity-90" />
      </span>
      T
      <span className="text-[8px] font-bold align-super ml-0.5">TM</span>
    </span>
  </div>
);

const NachiLogo = () => (
  <div className="flex items-center justify-center">
    <span className="text-2xl font-black italic text-[#E2181A] tracking-tighter flex items-end">
      NACH
      <span className="relative inline-block w-3 text-center -ml-0.5">
        <span className="absolute top-1.5 left-1 w-1.5 h-1.5 bg-[#E2181A] rounded-full" />
        <span className="text-[20px] font-black lowercase leading-none">i</span>
      </span>
    </span>
  </div>
);

const SkfLogo = () => (
  <div className="flex items-center justify-center">
    <span className="text-2xl font-extrabold italic text-[#005EA6] tracking-tighter">
      SKF<span className="text-[8px] align-super font-bold ml-0.5">&#174;</span>
    </span>
  </div>
);

export default function Integrations() {
  const row1 = [
    <BoschLogo key="bosch" />,
    <SataLogo key="sata" />,
    <PiscoLogo key="pisco" />,
    <CdcLogo key="cdc" />,
    <SelleysLogo key="selleys" />,
    <KstLogo key="kst" />,
    <NachiLogo key="nachi" />,
    <SkfLogo key="skf" />,
  ];

  const row2 = [
    <SelleysLogo key="selleys" />,
    <KstLogo key="kst" />,
    <NachiLogo key="nachi" />,
    <SkfLogo key="skf" />,
    <BoschLogo key="bosch" />,
    <SataLogo key="sata" />,
    <PiscoLogo key="pisco" />,
    <CdcLogo key="cdc" />,
  ];

  return (
    <section className="pt-[33px] pb-[33px] pl-0 bg-slate-900 text-white relative overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee-ltr {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .animate-marquee-ltr {
          display: flex;
          width: max-content;
          gap: 1.5rem;
          animation: marquee-ltr 28s linear infinite;
        }
        .animate-marquee-ltr-slower {
          display: flex;
          width: max-content;
          gap: 1.5rem;
          animation: marquee-ltr 34s linear infinite;
        }
      `}} />

      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 text-center">

        <ScrollReveal>
          <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-6">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
            INTEGRATIONS
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto mb-[8px]">
            Khong thay the. Co san tich hop.
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto mb-[27px] leading-relaxed">
            Chung toi thau hieu ap luc va kho khan khi mua le tung linh kien thay the. Do la ly do m.ai chuan hoa danh muc truc tuyen tich hop voi nguon cung chinh hang hang dau the gioi de dinh vi ngay thu ban can.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <div className="space-y-6 overflow-hidden py-4 select-none">

            <div className="relative w-full overflow-hidden flex">
              <div className="animate-marquee-ltr">
                {row1.map((Comp, idx) => (
                  <div
                    key={`r1-d1-${idx}`}
                    className="w-[115px] h-[115px] md:w-[130px] md:h-[130px] rounded-[24px] bg-white flex items-center justify-center p-3.5 shadow-xl border border-slate-100 hover:scale-[1.04] hover:-translate-y-1 transition-all duration-300 transition-transform shrink-0"
                  >
                    {Comp}
                  </div>
                ))}
                {row1.map((Comp, idx) => (
                  <div
                    key={`r1-d2-${idx}`}
                    className="w-[115px] h-[115px] md:w-[130px] md:h-[130px] rounded-[24px] bg-white flex items-center justify-center p-3.5 shadow-xl border border-slate-100 hover:scale-[1.04] hover:-translate-y-1 transition-all duration-300 transition-transform shrink-0"
                  >
                    {Comp}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative w-full overflow-hidden flex">
              <div className="animate-marquee-ltr-slower">
                {row2.map((Comp, idx) => (
                  <div
                    key={`r2-d1-${idx}`}
                    className="w-[115px] h-[115px] md:w-[130px] md:h-[130px] rounded-[24px] bg-white flex items-center justify-center p-3.5 shadow-xl border border-slate-100 hover:scale-[1.04] hover:-translate-y-1 transition-all duration-300 transition-transform shrink-0"
                  >
                    {Comp}
                  </div>
                ))}
                {row2.map((Comp, idx) => (
                  <div
                    key={`r2-d2-${idx}`}
                    className="w-[115px] h-[115px] md:w-[130px] md:h-[130px] rounded-[24px] bg-white flex items-center justify-center p-3.5 shadow-xl border border-slate-100 hover:scale-[1.04] hover:-translate-y-1 transition-all duration-300 transition-transform shrink-0"
                  >
                    {Comp}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </ScrollReveal>

        <div className="mt-14">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors group cursor-pointer"
          >
            Tat ca danh muc lien ket
            <span className="group-hover:translate-x-1.5 transition-transform duration-300 font-extrabold text-base">&#8594;</span>
          </a>
        </div>

      </div>
    </section>
  );
}
