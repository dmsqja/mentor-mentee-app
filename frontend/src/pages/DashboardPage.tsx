import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext.tsx';
import { matchAPI, MatchRequest } from '../services/api.ts';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MatchRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const data = await matchAPI.getMyRequests();
      setRequests(data);
    } catch (err: any) {
      console.error('Error loading requests:', err);
      setError('요청 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: number, status: 'accepted' | 'rejected') => {
    try {
      await matchAPI.updateRequestStatus(requestId, status);
      await loadRequests(); // Reload requests
    } catch (err: any) {
      console.error('Error updating status:', err);
      setError('상태 업데이트에 실패했습니다.');
    }
  };

  const handleDeleteRequest = async (requestId: number) => {
    if (!window.confirm('정말로 이 요청을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await matchAPI.deleteRequest(requestId);
      await loadRequests(); // Reload requests
    } catch (err: any) {
      console.error('Error deleting request:', err);
      setError('요청 삭제에 실패했습니다.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: 'status-pending',
      accepted: 'status-accepted',
      rejected: 'status-rejected',
    };

    const statusTexts = {
      pending: '대기중',
      accepted: '수락됨',
      rejected: '거절됨',
    };

    return (
      <span className={`request-status ${statusClasses[status as keyof typeof statusClasses]}`}>
        {statusTexts[status as keyof typeof statusTexts]}
      </span>
    );
  };

  if (!user) return null;

  return (
    <div className="container">
      <div style={{ marginTop: '30px' }}>
        <h1>대시보드</h1>
        <p>안녕하세요, {user.name || user.email}님! ({user.role})</p>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <div className="card">
          <h2>
            {user.role === 'mentee' ? '내가 보낸 매칭 요청' : '받은 매칭 요청'}
          </h2>

          {isLoading ? (
            <div className="loading">
              <p>로딩중...</p>
            </div>
          ) : requests.length === 0 ? (
            <p>
              {user.role === 'mentee' 
                ? '아직 보낸 매칭 요청이 없습니다.' 
                : '아직 받은 매칭 요청이 없습니다.'
              }
            </p>
          ) : (
            <div>
              {requests.map((request) => (
                <div key={request.id} className="mentor-card">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h4>
                        {user.role === 'mentee' 
                          ? request.mentor_name || '멘토' 
                          : request.mentee_name || '멘티'
                        }
                      </h4>
                      {request.message && (
                        <p><strong>메시지:</strong> {request.message}</p>
                      )}
                      {request.mentor_tech_stack && user.role === 'mentee' && (
                        <div className="tech-stack">
                          <strong>기술 스택:</strong>
                          {request.mentor_tech_stack.map((tech, index) => (
                            <span key={index} className="tech-tag">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                      <p>
                        <strong>요청일:</strong> {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {getStatusBadge(request.status)}
                      
                      <div style={{ marginTop: '10px' }}>
                        {user.role === 'mentor' && request.status === 'pending' && (
                          <div>
                            <button
                              onClick={() => handleStatusUpdate(request.id, 'accepted')}
                              className="btn btn-success"
                              style={{ marginRight: '10px' }}
                            >
                              수락
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(request.id, 'rejected')}
                              className="btn btn-danger"
                            >
                              거절
                            </button>
                          </div>
                        )}
                        
                        {user.role === 'mentee' && (
                          <button
                            onClick={() => handleDeleteRequest(request.id)}
                            className="btn btn-danger"
                            style={{ marginTop: '10px' }}
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {user.role === 'mentee' && (
          <div className="text-center mt-3">
            <a href="/mentors" className="btn btn-primary">
              멘토 찾아보기
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
