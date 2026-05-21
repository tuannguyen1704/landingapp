'use client';
import React, { useState } from 'react';
import { Mail, Phone, Building2, User, Briefcase, ChevronDown, ArrowRight } from 'lucide-react';
import AnimatedCounter from './animated-counter';

export default function Contact() {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    companyName: '',
    jobTitle: '',
    phoneCode: '+84',
    phoneFlag: 'VN',
    phoneNumber: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [showCodeDropdown, setShowCodeDropdown] = useState(false);

  const phoneCodes = [
    { code: '+84', flag: 'VN', country: 'Vietnam' },
    { code: '+1', flag: 'US', country: 'United States' },
    { code: '+65', flag: 'SG', country: 'Singapore' },
    { code: '+82', flag: 'KR', country: 'South Korea' },
    { code: '+81', flag: 'JP', country: 'Japan' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        companyName: '',
        jobTitle: '',
        phoneCode: '+84',
        phoneFlag: 'VN',
        phoneNumber: '',
        message: ''
      });
    }, 4500);
  };

  return (
    <section id="contact" className="py-28 bg-white text-slate-900 relative overflow-hidden scroll-mt-20">

      <div className="absolute top-1/3 -left-1/4 w-[700px] h-[700px] bg-indigo-50 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-1/4 w-[700px] h-[700px] bg-violet-50 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-stretch">

          <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-between">
            <div className="relative overflow-hidden rounded-[24px] lg:rounded-[32px] p-8 md:p-12 lg:p-14 flex flex-col justify-between h-full min-h-[580px] bg-slate-900 border border-slate-800 shadow-2xl">

              <div className="absolute inset-0 overflow-hidden rounded-[24px] lg:rounded-[32px] pointer-events-none z-0">
                <img
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80"
                  alt="Modern Warehouse Industrial Supply Chain Operations"
                  className="absolute inset-y-0 -top-[10%] w-full h-[120%] object-cover opacity-45 mix-blend-multiply pointer-events-none transition-filter duration-700 select-none grayscale-[15%] contrast-[1.05]"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-950/80 rounded-[24px] lg:rounded-[32px] pointer-events-none z-0" />

              <div className="relative z-10 flex flex-col justify-between h-full space-y-12">

                <div className="space-y-6">
                  <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1 rounded-full text-[11px] font-bold tracking-widest text-indigo-300 uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                    LIEN HE VOI M.AI
                  </div>

                  <h2 className="text-3xl md:text-4xl lg:text-[42px] font-black text-white tracking-tight leading-tight select-none">
                    Giai phap AI toi uu mua hang cong nghiep
                  </h2>

                  <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                    M.AI dong hanh cung doanh nghiep trong toan bo quy trinh mua sam cong nghiep: tu tim kiem vat tu, boc tach BOM, de xuat thiet bi tuong duong den ket noi nha cung cap phu hop.
                  </p>
                </div>

                <div id="contact-metrics" className="space-y-6 pt-8 border-t border-white/10">
                  <div className="grid grid-cols-3 gap-4">

                    <div className="flex flex-col">
                      <span className="text-2xl md:text-3xl font-black text-white tracking-tight select-none bg-gradient-to-r from-indigo-200 via-white to-white bg-clip-text text-transparent">
                        <AnimatedCounter target={10000} suffix="+" />
                      </span>
                      <span className="text-[10.5px] font-semibold text-slate-400 leading-snug mt-1.5 uppercase tracking-wide">
                        Nha cung cap dang hop tac
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-2xl md:text-3xl font-black text-white tracking-tight select-none bg-gradient-to-r from-indigo-200 via-white to-white bg-clip-text text-transparent">
                        <AnimatedCounter target={60} suffix="s" />
                      </span>
                      <span className="text-[10.5px] font-semibold text-slate-400 leading-snug mt-1.5 uppercase tracking-wide">
                        Xu ly RFQ trung binh
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-2xl md:text-3xl font-black text-white tracking-tight select-none bg-gradient-to-r from-indigo-200 via-white to-white bg-clip-text text-transparent">
                        <AnimatedCounter target={95} suffix="%" />
                      </span>
                      <span className="text-[10.5px] font-semibold text-slate-400 leading-snug mt-1.5 uppercase tracking-wide">
                        Matching ky thuat chinh xac
                      </span>
                    </div>

                  </div>
                </div>

                <div className="pt-4">
                  <a
                    href="#features"
                    className="inline-flex items-center gap-2 group text-sm font-bold text-indigo-300 hover:text-indigo-200 transition-colors cursor-pointer"
                  >
                    <span>Tìm hieu giai phap cua M.AI</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </a>
                </div>

              </div>

            </div>
          </div>

          <div className="lg:col-span-7 xl:col-span-7">
            <div className="bg-white text-slate-900 border border-slate-200/50 rounded-[28px] lg:rounded-[32px] shadow-2xl p-7 md:p-10 lg:p-12 relative overflow-hidden transition-all duration-500 hover:shadow-indigo-900/5">

              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700" />

              {submitted ? (
                <div className="text-center py-16 flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border-2 border-emerald-100 shadow-md">
                    <span className="text-emerald-500 text-4xl leading-none">&#10003;</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Gui thong tin thanh cong!</h3>
                  <p className="text-slate-500 mt-4 text-[14px] max-w-md mx-auto leading-relaxed">
                    Cam on ban da lien he voi M.AI. Chuyen vien tu doi ngu ky su cua <strong>M.AI</strong> se phan tich va truc tiep lien he tu van giai phap trong thoi gian som nhat.
                  </p>
                </div>
              ) : (
                <div className="space-y-8">

                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      Ket noi voi chuyen gia M.AI
                    </h3>
                    <p className="text-slate-500 mt-2.5 text-[14px] leading-relaxed">
                      Doi ngu cua chung toi se lien he va tu van giai phap phu hop nhat cho doanh nghiep cua ban.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">

                    <div>
                      <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider mb-2" htmlFor="email">
                        Company Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                          <Mail className="w-4 h-4" />
                        </span>
                        <input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="name@company.com"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all text-[14px] outline-none font-medium shadow-sm hover:border-slate-350"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider mb-2" htmlFor="firstName">
                          First Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative group">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                            <User className="w-4 h-4" />
                          </span>
                          <input
                            id="firstName"
                            type="text"
                            required
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            placeholder="Ten"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all text-[14px] outline-none font-medium shadow-sm hover:border-slate-350"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider mb-2" htmlFor="lastName">
                          Last Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative group">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                            <User className="w-4 h-4" />
                          </span>
                          <input
                            id="lastName"
                            type="text"
                            required
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            placeholder="Ho"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all text-[14px] outline-none font-medium shadow-sm hover:border-slate-350"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider mb-2" htmlFor="companyName">
                          Company Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative group">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                            <Building2 className="w-4 h-4" />
                          </span>
                          <input
                            id="companyName"
                            type="text"
                            required
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            placeholder="Ten doanh nghiep"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all text-[14px] outline-none font-medium shadow-sm hover:border-slate-350"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider mb-2" htmlFor="jobTitle">
                          Job Title <span className="text-slate-400 font-normal lowercase">(optional)</span>
                        </label>
                        <div className="relative group">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                            <Briefcase className="w-4 h-4" />
                          </span>
                          <input
                            id="jobTitle"
                            type="text"
                            value={formData.jobTitle}
                            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                            placeholder="Truong phong thu mua"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all text-[14px] outline-none font-medium shadow-sm hover:border-slate-350"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider mb-2" htmlFor="phoneNumber">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex gap-3">
                        <div className="relative shrink-0">
                          <button
                            type="button"
                            onClick={() => setShowCodeDropdown(!showCodeDropdown)}
                            className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-slate-900 hover:bg-slate-100 transition-colors text-[14px] font-bold h-full min-w-[90px] justify-center"
                          >
                            <span className="text-sm">{formData.phoneCode}</span>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                          </button>
                          {showCodeDropdown && (
                            <div className="absolute left-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl py-1 w-48 z-30">
                              {phoneCodes.map((item) => (
                                <button
                                  key={item.code}
                                  type="button"
                                  onClick={() => {
                                    setFormData({ ...formData, phoneCode: item.code, phoneFlag: item.flag });
                                    setShowCodeDropdown(false);
                                  }}
                                  className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm my-0.5 hover:bg-slate-50 text-slate-800 font-semibold"
                                >
                                  <span>{item.code}</span>
                                  <span className="text-slate-400 font-normal text-xs">({item.country})</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="relative flex-1 group">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                            <Phone className="w-4 h-4" />
                          </span>
                          <input
                            id="phoneNumber"
                            type="tel"
                            required
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            placeholder="091 234 567"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all text-[14px] outline-none font-medium shadow-sm hover:border-slate-350"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider mb-2" htmlFor="message">
                        Message <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Hay cho chung toi biet ve nhu cau vat tu hoac bai toan chuoi cung ung can giai quyet cua doanh nghiep ban..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-[18px] py-4 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all text-[14px] outline-none font-medium resize-none leading-relaxed hover:border-slate-350"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold text-[15px] shadow-lg shadow-indigo-600/15 hover:scale-[1.005] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 select-none"
                      >
                        Ket noi voi chuyen gia M.AI
                      </button>
                    </div>

                  </form>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
