import React, { useState } from 'react';
import { Eye, EyeOff, LucideIcon, AlertCircle } from 'lucide-react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  placeholder: string;
  icon: LucideIcon;
  error?: string;
  isPassword?: boolean;
  label?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  id,
  placeholder,
  icon: Icon,
  error,
  isPassword = false,
  type = 'text',
  className = '',
  label,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 select-none"
        >
          {label}
        </label>
      )}

      <div className="relative w-full group">
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          aria-invalid={!!error}
          className={`
            w-full h-14 pl-5 pr-14
            bg-[#F8FAFC] border border-slate-100 rounded-2xl
            text-[#0F1115] placeholder-slate-400
            font-sans text-sm outline-none
            transition-all duration-200
            hover:bg-slate-100/50
            focus:bg-white focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent focus:shadow-md focus:shadow-indigo-500/10
            ${error ? 'bg-rose-50/40 border-rose-400/80 focus:ring-rose-400' : ''}
          `}
          {...props}
        />

        {/* Right Icons - Password toggle + Main icon */}
        <div className={`absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 transition-colors ${error ? 'text-rose-400' : 'text-slate-400 group-focus-within:text-indigo-600'}`}>
          {isPassword ? (
            <button
              id={`${id}-toggle-visibility`}
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 hover:bg-slate-200/60 rounded-lg cursor-pointer focus:outline-none transition-colors"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          ) : null}
          <Icon className="w-5 h-5 opacity-90" />
        </div>
      </div>

      {/* Error message with fade-in animation */}
      {error && (
        <span
          id={`${id}-error`}
          className="text-xs text-rose-500 font-semibold ml-1 flex items-center gap-1.5 animate-fade-in"
        >
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </span>
      )}
    </div>
  );
};
