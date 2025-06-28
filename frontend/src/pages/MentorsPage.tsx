import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../utils/AuthContext.tsx';
import { userAPI, matchAPI, User } from '../services/api.ts';

const MentorsPage: React.FC = () => {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    techStack: '',
    sortBy: 'created_at',
  });
  const [requestModal, setRequestModal] = useState<{
    show: boolean;
    mentorId: number | null;
    mentorName: string;
  }>({
    show: false,
    mentorId: null,
    mentorName: '',
  });
  const [requestMessage, setRequestMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadMentors = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await userAPI.getMentors({
        techStack: filters.techStack || undefined,
        sortBy: filters.sortBy,
      });
      setMentors(data);
    } catch (err: any) {
      console.error('Error loading mentors:', err);
      setError('멘토 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadMentors();
  }, [loadMentors]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openRequestModal = (mentorId: number, mentorName: string) => {
    setRequestModal({
      show: true,
      mentorId,
      mentorName,
    });
    setRequestMessage('');
  };

  const closeRequestModal = () => {
    setRequestModal({
      show: false,
      mentorId: null,
      mentorName: '',
    });
    setRequestMessage('');
  };

  const handleSendRequest = async () => {
    if (!requestModal.mentorId) return;

    try {
      setIsSubmitting(true);
      await matchAPI.createRequest({
        mentor_id: requestModal.mentorId,
        message: requestMessage || undefined,
      });
      
      alert('매칭 요청을 성공적으로 보냈습니다!');
      closeRequestModal();
    } catch (err: any) {
      console.error('Error sending request:', err);
      alert(
        err.response?.data?.error || 
        '매칭 요청을 보내는데 실패했습니다.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user?.role !== 'mentee') {
    return (
      <div className="container">
        <div className="alert alert-danger">
          멘티만 이 페이지에 접근할 수 있습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginTop: '30px' }}>
        <h1>멘토 찾기</h1>
        <p>원하는 멘토를 찾아 매칭 요청을 보내보세요!</p>

        {/* Filters */}
        <div className="card">
          <h3>검색 필터</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label htmlFor="techStack" className="form-label">
                기술 스택 검색
              </label>
              <input
                type="text"
                id="techStack"
                name="techStack"
                className="form-control"
                value={filters.techStack}
                onChange={handleFilterChange}
                placeholder="예: React, Python"
              />
            </div>
            <div className="form-group">
              <label htmlFor="sortBy" className="form-label">
                정렬 기준
              </label>
              <select
                id="sortBy"
                name="sortBy"
                className="form-control"
                value={filters.sortBy}
                onChange={handleFilterChange}
              >
                <option value="created_at">최신순</option>
                <option value="name">이름순</option>
                <option value="tech_stack">기술스택순</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {/* Mentors List */}
        {isLoading ? (
          <div className="loading">
            <p>멘토 목록을 불러오는 중...</p>
          </div>
        ) : mentors.length === 0 ? (
          <div className="card">
            <p className="text-center">검색 조건에 맞는 멘토가 없습니다.</p>
          </div>
        ) : (
          <div>
            {mentors.map((mentor) => (
              <div key={mentor.id} className="mentor-card">
                <div className="d-flex justify-content-between align-items-center">
                  <div style={{ flex: 1 }}>
                    <div className="d-flex align-items-center mb-3">
                      <img
                        src={mentor.profile_image_url}
                        alt="Profile"
                        className="profile-image"
                        style={{ marginRight: '15px' }}
                      />
                      <div>
                        <h3>{mentor.name || mentor.email}</h3>
                        <p style={{ color: '#6c757d', margin: 0 }}>
                          가입일: {new Date(mentor.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {mentor.bio && (
                      <p style={{ marginBottom: '15px' }}>
                        <strong>소개:</strong> {mentor.bio}
                      </p>
                    )}
                    
                    {mentor.tech_stack && mentor.tech_stack.length > 0 && (
                      <div className="tech-stack">
                        <strong>기술 스택:</strong>
                        {mentor.tech_stack.map((tech, index) => (
                          <span key={index} className="tech-tag">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <button
                      onClick={() => openRequestModal(mentor.id, mentor.name || mentor.email)}
                      className="btn btn-primary"
                    >
                      매칭 요청
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Modal */}
      {requestModal.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            maxWidth: '500px',
            width: '90%',
          }}>
            <h3>매칭 요청 보내기</h3>
            <p>
              <strong>{requestModal.mentorName}</strong>님에게 매칭 요청을 보내시겠습니까?
            </p>
            
            <div className="form-group">
              <label htmlFor="requestMessage" className="form-label">
                메시지 (선택사항)
              </label>
              <textarea
                id="requestMessage"
                className="form-control"
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                rows={4}
                placeholder="멘토에게 전달할 메시지를 작성해주세요"
                disabled={isSubmitting}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={closeRequestModal}
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                취소
              </button>
              <button
                onClick={handleSendRequest}
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? '전송 중...' : '요청 보내기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorsPage;
