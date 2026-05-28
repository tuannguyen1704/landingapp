import React from 'react';
import { ArrowRight } from 'lucide-react';
import { SocialButtons } from './mai-social-buttons';

interface FormWrapperProps {
  idPrefix: string;
  title: string;
  subtitle?: React.ReactNode;
  linkText?: string;
  linkAction?: () => void;
  submitButtonText: string;
  isSubmitLoading?: boolean;
  onSubmit: (e: React.FormEvent) => void;
  socialTitle?: string;
  onSocialClick?: (platform: string) => void;
  footerText?: string;
  mobileToggle?: React.ReactNode;
  children: React.ReactNode;
}

export const FormWrapper: React.FC<FormWrapperProps> = ({
  idPrefix,
  title,
  subtitle,
  linkText,
  linkAction,
  submitButtonText,
  isSubmitLoading = false,
  onSubmit,
  socialTitle,
  onSocialClick,
  footerText = "BẢO MẬT BỞI HỆ THỐNG AETHER SECURE LAYER",
  mobileToggle,
  children,
}) => {
  return (
    <div className="w-full max-w-[380px] mx-auto flex flex-col justify-center px-4 py-8 h-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-[#0F1115] font-black text-4xl tracking-tight mb-3">
          {title}
        </h2>
        {subtitle && (
          <p className="text-slate-500 font-medium text-sm">
            {subtitle}
            {linkText && linkAction && (
              <button
                type="button"
                onClick={linkAction}
                className="text-[#4F46E5] font-bold hover:underline ml-1 cursor-pointer focus:outline-none"
              >
                {linkText}
              </button>
            )}
          </p>
        )}
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        {children}

        <button
          id={`btn-${idPrefix}-submit`}
          type="submit"
          disabled={isSubmitLoading}
          className="
            w-full h-14
            bg-[#0F1115] hover:bg-[#4F46E5]
            text-white font-sans font-bold
            rounded-2xl
            shadow-xl shadow-slate-200/50
            hover:shadow-lg hover:shadow-indigo-500/25
            active:scale-[0.98]
            transition-all duration-300
            flex items-center justify-center gap-2
            group
            focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2
            disabled:bg-slate-400 disabled:cursor-not-allowed disabled:hover:shadow-none
          "
        >
          {submitButtonText}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
        </button>
      </form>

      {/* Social Login */}
      {onSocialClick && (
        <div className="mt-6 text-center">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-[0.15em] block mb-4">
            {socialTitle}
          </span>
          <SocialButtons onSocialClick={onSocialClick} />
        </div>
      )}

      {/* Footer Security */}
      <div className="mt-6 pt-6 border-t border-slate-100 text-center">
        <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-[0.2em]">
          {footerText}
        </p>
      </div>

      {/* Mobile Toggle */}
      {mobileToggle && (
        <div className="mt-6 text-center md:hidden">
          {mobileToggle}
        </div>
      )}
    </div>
  );
};
