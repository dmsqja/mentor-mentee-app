import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext.tsx';

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'mentee' as 'mentor' | 'mentee',
    name: '',
    bio: '',
    techStack: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);

    try {
      const techStackArray = formData.techStack
        ? formData.techStack.split(',').map(tech => tech.trim()).filter(tech => tech)
        : [];

      await signup({
        email: formData.email,
        password: formData.password,
        role: formData.role,
        name: formData.name || undefined,
        bio: formData.bio || undefined,
        tech_stack: techStackArray.length > 0 ? techStackArray : undefined,
      });

      navigate('/dashboard');
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(
        err.response?.data?.error || 
        '회원가입에 실패했습니다. 다시 시도해주세요.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="auth-container" style={{ maxWidth: '500px' }}>
        <h2 className="auth-title">회원가입</h2>
        
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              이메일 *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              비밀번호 *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              비밀번호 확인 *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-control"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="role" className="form-label">
              역할 *
            </label>
            <select
              id="role"
              name="role"
              className="form-control"
              value={formData.role}
              onChange={handleChange}
              required
              disabled={isLoading}
            >
              <option value="mentee">멘티 (배우고 싶어요)</option>
              <option value="mentor">멘토 (가르치고 싶어요)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="name" className="form-label">
              이름
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio" className="form-label">
              자기소개
            </label>
            <textarea
              id="bio"
              name="bio"
              className="form-control"
              value={formData.bio}
              onChange={handleChange}
              disabled={isLoading}
              rows={3}
              placeholder="간단한 자기소개를 작성해주세요"
            />
          </div>

          {formData.role === 'mentor' && (
            <div className="form-group">
              <label htmlFor="techStack" className="form-label">
                기술 스택
              </label>
              <input
                type="text"
                id="techStack"
                name="techStack"
                className="form-control"
                value={formData.techStack}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="React, Node.js, Python (쉼표로 구분)"
              />
              <small style={{ color: '#6c757d' }}>
                쉼표(,)로 구분하여 입력해주세요
              </small>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={isLoading}
          >
            {isLoading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <div className="text-center mt-3">
          <p>
            이미 계정이 있으신가요?{' '}
            <Link to="/login">로그인</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
