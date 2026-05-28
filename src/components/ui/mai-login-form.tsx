import React, { useState } from 'react';
import { User, Lock } from 'lucide-react';
import { InputField } from './mai-input';
import { FormWrapper } from './mai-form-wrapper';

interface LoginFormProps {
  onLoginSuccess: (username: string, userData?: { email: string }) => void;
  onShowError: (message: string) => void;
  onForgotPassword: (email: string) => void;
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLoginSuccess,
  onShowError,
  onForgotPassword,
  onSwitchToRegister,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  // Password validation on blur - minimum 3 characters
  const handlePasswordBlur = () => {
    if (password && password.length < 3) {
      setErrors((prev) => ({ ...prev, password: 'Mật khẩu phải ít nhất 3 ký tự' }));
    } else {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { username?: string; password?: string } = {};

    if (!username.trim()) {
      newErrors.username = 'Vui lòng nhập tên đăng nhập';
    }
    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 3) {
      newErrors.password = 'Mật khẩu phải ít nhất 3 ký tự';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      onShowError('Thông tin đăng nhập chưa đầy đủ hoặc không hợp lệ.');
      return;
    }

    setErrors({});

    // Check local storage for user - support both username and email
    const usersJson = localStorage.getItem('mai-user-auth');
    const users = usersJson ? JSON.parse(usersJson) : [];

    const matchedUser = users.find(
      (u: any) =>
        (u.username.toLowerCase() === username.trim().toLowerCase() ||
         u.email.toLowerCase() === username.trim().toLowerCase()) &&
        u.password === password
    );

    if (matchedUser) {
      onLoginSuccess(matchedUser.username, { email: matchedUser.email });
    } else {
      // Check demo credentials
      if (username.trim().toLowerCase() === 'demo@mai-procure.com' && password === 'demo123') {
        onLoginSuccess('Demo User');
        return;
      }
      if (username.trim().toLowerCase() === 'admin' && password === 'admin') {
        onLoginSuccess('Admin Account');
        return;
      }
      onShowError('Tài khoản hoặc mật khẩu không chính xác!');
    }
  };

  const handleForgotClick = () => {
    if (!username.trim()) {
      onForgotPassword('');
    } else {
      onForgotPassword(username);
    }
  };

  const handleSocialClick = (platform: string) => {
    onLoginSuccess(`${platform.charAt(0).toUpperCase() + platform.slice(1)} User`);
  };

  return (
    <FormWrapper
      idPrefix="login"
      title="Đăng nhập"
      subtitle="Chưa có tài khoản?"
      linkText="Đăng ký ngay"
      linkAction={onSwitchToRegister}
      submitButtonText="Đăng nhập vào hệ thống"
      onSubmit={handleSubmit}
      socialTitle="HOẶC ĐĂNG NHẬP BẰNG"
      onSocialClick={handleSocialClick}
    >
      <InputField
        id="login-username"
        type="text"
        label="TÊN ĐĂNG NHẬP"
        placeholder="Tên đăng nhập hoặc email"
        icon={User}
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
          if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }));
        }}
        error={errors.username}
      />

      <InputField
        id="login-password"
        isPassword
        label="MẬT KHẨU"
        placeholder="Nhập mật khẩu của bạn"
        icon={Lock}
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
        }}
        onBlur={handlePasswordBlur}
        error={errors.password}
      />

      <div className="flex justify-between items-center -mt-1">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            defaultChecked
            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <span className="text-xs text-slate-600 font-medium font-sans">Ghi nhớ tôi</span>
        </label>
        <button
          id="btn-forgot-password"
          type="button"
          onClick={handleForgotClick}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors focus:outline-none cursor-pointer"
        >
          Quên mật khẩu?
        </button>
      </div>
    </FormWrapper>
  );
};
