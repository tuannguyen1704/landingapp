'use client';
import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useRouter, usePathname } from 'next/navigation';

export type AuthGuardMode = 'modal' | 'soft-prompt' | 'redirect';

interface AuthGuardProps {
  children: ReactNode;
  mode?: AuthGuardMode;
  redirectTo?: string;
  purpose?: string;
}

export function AuthGuard({
  children,
  mode = 'modal',
  redirectTo,
  purpose,
}: AuthGuardProps) {
  const { user, openModal } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user) return;

    if (mode === 'redirect' && redirectTo) {
      router.push(redirectTo);
    } else if (mode === 'modal') {
      openModal('login');
    }
  }, [user, mode, redirectTo, router, openModal]);

  if (user) {
    return <>{children}</>;
  }

  if (mode === 'soft-prompt') {
    return <>{children}</>;
  }

  return null;
}

interface RequireAuthProps {
  children: ReactNode;
  fallback?: ReactNode;
  purpose?: string;
  onTriggerLogin?: () => void;
}

export function RequireAuth({
  children,
  fallback,
  purpose = 'thực hiện hành động này',
  onTriggerLogin,
}: RequireAuthProps) {
  const { user, openModal } = useAuth();

  const handleLogin = () => {
    openModal('login');
    onTriggerLogin?.();
  };

  if (user) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <svg
          className="h-8 w-8 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-slate-900">Chưa đăng nhập</h2>
      <p className="mt-2 text-slate-500 max-w-sm">
        Bạn cần đăng nhập để {purpose}.
      </p>
      <button
        onClick={handleLogin}
        className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white brand-gradient hover:shadow-md hover:shadow-violet-200 transition-all"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
        Đăng nhập ngay
      </button>
    </div>
  );
}
