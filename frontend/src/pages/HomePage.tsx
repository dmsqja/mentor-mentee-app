import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext.tsx';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <h1>멘토와 멘티를 연결하는 최고의 플랫폼</h1>
          <p>
            전문가와 배우고 싶은 사람들을 연결하여 성장의 기회를 제공합니다.
            지금 바로 시작해보세요!
          </p>
          {!user ? (
            <div>
              <Link to="/signup" className="btn btn-primary" style={{ marginRight: '10px' }}>
                시작하기
              </Link>
              <Link to="/login" className="btn btn-secondary">
                로그인
              </Link>
            </div>
          ) : (
            <Link to="/dashboard" className="btn btn-primary">
              대시보드로 이동
            </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="text-center" style={{ marginBottom: '20px' }}>
            왜 MentorMatch를 선택해야 할까요?
          </h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>전문가 멘토</h3>
              <p>다양한 분야의 전문가들이 여러분의 성장을 도와드립니다.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>맞춤형 매칭</h3>
              <p>기술 스택과 관심사를 바탕으로 최적의 멘토를 찾아드립니다.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>빠른 성장</h3>
              <p>1:1 멘토링을 통해 더 빠르고 효과적으로 성장할 수 있습니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '80px 0', background: '#f8f9fa', textAlign: 'center' }}>
        <div className="container">
          <h2>지금 바로 시작하세요!</h2>
          <p style={{ marginTop: '20px', marginBottom: '30px' }}>
            멘토가 되어 지식을 공유하거나, 멘티가 되어 새로운 것을 배워보세요.
          </p>
          {!user && (
            <div>
              <Link to="/signup" className="btn btn-primary" style={{ marginRight: '10px' }}>
                멘토로 가입하기
              </Link>
              <Link to="/signup" className="btn btn-success">
                멘티로 가입하기
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
