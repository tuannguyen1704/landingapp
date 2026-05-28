import React from 'react';

interface SocialButtonsProps {
  onSocialClick: (platform: string) => void;
}

export const SocialButtons: React.FC<SocialButtonsProps> = ({ onSocialClick }) => {
  const platforms = [
    { id: 'google', label: 'G', style: 'font-display font-bold text-lg' },
    { id: 'facebook', label: 'f', style: 'font-sans font-bold text-lg' },
  ];

  return (
    <div className="flex gap-4 justify-center">
      {platforms.map((platform) => (
        <button
          key={platform.id}
          id={`btn-social-${platform.id}`}
          onClick={() => onSocialClick(platform.id)}
          className="
            w-12 h-12
            bg-white border border-slate-200 rounded-xl
            hover:border-indigo-500 hover:bg-indigo-50/30 hover:-translate-y-0.5
            hover:shadow-md hover:shadow-indigo-500/10
            active:scale-95
            transition-all duration-200
            flex items-center justify-center
            text-slate-700 hover:text-indigo-600
            cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
          "
          title={`Sign in with ${platform.id}`}
        >
          <span className={platform.style}>{platform.label}</span>
        </button>
      ))}
    </div>
  );
};
