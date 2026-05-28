'use client';
import { useCallback } from 'react';
import { useAuth } from '@/components/auth-provider';

interface UseAuthPromptOptions {
  purpose?: string;
  redirectTo?: string;
  onSuccess?: () => void;
}

export function useAuthPrompt(options: UseAuthPromptOptions = {}) {
  const { user, openModal } = useAuth();

  const promptLogin = useCallback(
    (opts?: UseAuthPromptOptions) => {
      const mergedOpts = { ...options, ...opts };
      openModal('login');
      return new Promise<boolean>((resolve) => {
        const checkUser = setInterval(() => {
          const currentUser = JSON.parse(
            localStorage.getItem('mai-auth-v1') || 'null'
          );
          if (currentUser) {
            clearInterval(checkUser);
            mergedOpts.onSuccess?.();
            resolve(true);
          }
        }, 100);

        setTimeout(() => {
          clearInterval(checkUser);
          resolve(false);
        }, 30000);
      });
    },
    [openModal, options]
  );

  const promptRegister = useCallback(() => {
    openModal('register');
    return new Promise<boolean>((resolve) => {
      const checkUser = setInterval(() => {
        const currentUser = JSON.parse(
          localStorage.getItem('mai-auth-v1') || 'null'
        );
        if (currentUser) {
          clearInterval(checkUser);
          options.onSuccess?.();
          resolve(true);
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkUser);
        resolve(false);
      }, 30000);
    });
  }, [openModal, options]);

  const requireLogin = useCallback(() => {
    if (!user) {
      openModal('login');
      return false;
    }
    return true;
  }, [user, openModal]);

  return {
    user,
    isAuthenticated: !!user,
    promptLogin,
    promptRegister,
    requireLogin,
  };
}
