import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            MentorMatch
          </Link>
          
          <div className="navbar-menu">
            {user ? (
              <>
                <Link to="/dashboard" className="nav-link">
                  대시보드
                </Link>
                {user.role === 'mentee' && (
                  <Link to="/mentors" className="nav-link">
                    멘토 찾기
                  </Link>
                )}
                <Link to="/profile" className="nav-link">
                  프로필
                </Link>
                <div className="nav-user">
                  <span className="user-name">
                    {user.name || user.email}
                    <span className="user-role">({user.role})</span>
                  </span>
                  <button onClick={handleLogout} className="btn btn-secondary">
                    로그아웃
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  로그인
                </Link>
                <Link to="/signup" className="btn btn-primary">
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
