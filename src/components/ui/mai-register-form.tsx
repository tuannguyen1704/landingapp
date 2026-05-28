import React, { useState } from 'react';
import { User, Mail, Lock } from 'lucide-react';
import { InputField } from './mai-input';
import { FormWrapper } from './mai-form-wrapper';

interface RegisterFormProps {
  onRegisterSuccess: (username: string, email: string) => void;
  onShowError: (message: string) => void;
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onRegisterSuccess,
  onShowError,
  onSwitchToLogin,
}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; email?: string; password?: string }>({});

  const validateEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  // Email validation on blur - must contain @gmail or @email
  const handleEmailBlur = () => {
    if (email && !/@(gmail|email)\./i.test(email)) {
      setErrors((prev) => ({ ...prev, email: 'Email phải có đuôi @gmail hoặc @email' }));
    } else {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

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
    const newErrors: { username?: string; email?: string; password?: string } = {};

    if (!username.trim()) {
      newErrors.username = 'Vui lòng nhập tên người dùng';
    } else if (username.trim().length < 3) {
      newErrors.username = 'Tên người dùng phải từ 3 ký tự';
    }

    if (!email.trim()) {
      newErrors.email = 'Vui lòng nhập địa chỉ email';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Địa chỉ email không hợp lệ';
    }

    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 3) {
      newErrors.password = 'Mật khẩu phải ít nhất 3 ký tự';
    } else if (!/@(gmail|email)\./i.test(email)) {
      newErrors.email = 'Email phải có đuôi @gmail hoặc @email';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      onShowError('Thông tin đăng ký chưa hợp lệ.');
      return;
    }

    setErrors({});

    // Save user to localStorage
    const usersJson = localStorage.getItem('mai-user-auth');
    const users = usersJson ? JSON.parse(usersJson) : [];

    // Check if user already exists
    const userExists = users.some(
      (u: any) => u.username.toLowerCase() === username.trim().toLowerCase()
    );
    const emailExists = users.some(
      (u: any) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (userExists) {
      setErrors({ username: 'Tên người dùng này đã tồn tại' });
      onShowError('Tên người dùng đã được đăng ký!');
      return;
    }

    if (emailExists) {
      setErrors({ email: 'Email này đã được sử dụng' });
      onShowError('Địa chỉ email đã được đăng ký!');
      return;
    }

    const newUser = {
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem('mai-user-auth', JSON.stringify(users));

    onRegisterSuccess(newUser.username, newUser.email);
  };

  const handleSocialClick = (platform: string) => {
    onRegisterSuccess(`${platform.charAt(0).toUpperCase() + platform.slice(1)} User`, `${platform}@example.com`);
  };

  return (
    <FormWrapper
      idPrefix="register"
      title="Tạo tài khoản"
      subtitle="Đã có tài khoản?"
      linkText="Đăng nhập ngay"
      linkAction={onSwitchToLogin}
      submitButtonText="Đăng ký tài khoản"
      onSubmit={handleSubmit}
      socialTitle="HOẶC ĐĂNG KÝ BẰNG"
      onSocialClick={handleSocialClick}
      footerText=""
    >
      <InputField
        id="register-username"
        type="text"
        label="TÊN HIỂN THỊ"
        placeholder="Tên hoặc biệt danh của bạn"
        icon={User}
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
          if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }));
        }}
        error={errors.username}
      />

      <InputField
        id="register-email"
        type="email"
        label="ĐỊA CHỈ EMAIL"
        placeholder="example@email.com"
        icon={Mail}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
        }}
        onBlur={handleEmailBlur}
        error={errors.email}
      />

      <InputField
        id="register-password"
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
    </FormWrapper>
  );
};
