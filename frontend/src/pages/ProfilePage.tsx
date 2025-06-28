import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext.tsx';
import { userAPI } from '../services/api.ts';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    techStack: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        techStack: user.tech_stack ? user.tech_stack.join(', ') : '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
        setError('JPG 또는 PNG 파일만 업로드 가능합니다.');
        return;
      }
      
      // Validate file size (1MB)
      if (file.size > 1024 * 1024) {
        setError('파일 크기는 1MB 이하여야 합니다.');
        return;
      }
      
      setAvatarFile(file);
      setError('');
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;

    try {
      setIsUploadingAvatar(true);
      setError('');
      await userAPI.uploadAvatar(avatarFile);
      
      // Reload user profile to get updated avatar URL
      const updatedProfile = await userAPI.getProfile();
      updateUser(updatedProfile);
      
      setSuccess('프로필 이미지가 성공적으로 업데이트되었습니다.');
      setAvatarFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('avatar') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      setError(
        err.response?.data?.error || 
        '프로필 이미지 업로드에 실패했습니다.'
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const techStackArray = formData.techStack
        ? formData.techStack.split(',').map(tech => tech.trim()).filter(tech => tech)
        : [];

      const updatedUser = await userAPI.updateProfile({
        name: formData.name || undefined,
        bio: formData.bio || undefined,
        tech_stack: techStackArray.length > 0 ? techStackArray : undefined,
      });

      updateUser(updatedUser);
      setIsEditing(false);
      setSuccess('프로필이 성공적으로 업데이트되었습니다.');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(
        err.response?.data?.error || 
        '프로필 업데이트에 실패했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        techStack: user.tech_stack ? user.tech_stack.join(', ') : '',
      });
    }
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  if (!user) return null;

  return (
    <div className="container">
      <div style={{ marginTop: '30px', maxWidth: '600px', margin: '30px auto' }}>
        <h1>프로필</h1>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        <div className="card">
          {/* Profile Image Section */}
          <div className="text-center mb-3">
            <img
              src={user.profile_image_url}
              alt="Profile"
              className="profile-image"
              style={{ width: '150px', height: '150px' }}
            />
            
            <div style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label htmlFor="avatar" className="form-label">
                  프로필 이미지 변경
                </label>
                <input
                  type="file"
                  id="avatar"
                  className="form-control"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleAvatarChange}
                  disabled={isUploadingAvatar}
                />
                <small style={{ color: '#6c757d' }}>
                  JPG 또는 PNG 파일, 최대 1MB
                </small>
              </div>
              
              {avatarFile && (
                <button
                  onClick={handleUploadAvatar}
                  className="btn btn-primary"
                  disabled={isUploadingAvatar}
                  style={{ marginTop: '10px' }}
                >
                  {isUploadingAvatar ? '업로드 중...' : '이미지 업로드'}
                </button>
              )}
            </div>
          </div>

          {/* Profile Info Section */}
          {!isEditing ? (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <strong>이메일:</strong> {user.email}
              </div>
              <div style={{ marginBottom: '20px' }}>
                <strong>역할:</strong> {user.role === 'mentor' ? '멘토' : '멘티'}
              </div>
              <div style={{ marginBottom: '20px' }}>
                <strong>이름:</strong> {user.name || '설정되지 않음'}
              </div>
              <div style={{ marginBottom: '20px' }}>
                <strong>소개:</strong> {user.bio || '설정되지 않음'}
              </div>
              {user.role === 'mentor' && (
                <div style={{ marginBottom: '20px' }}>
                  <strong>기술 스택:</strong>
                  {user.tech_stack && user.tech_stack.length > 0 ? (
                    <div className="tech-stack" style={{ marginTop: '5px' }}>
                      {user.tech_stack.map((tech, index) => (
                        <span key={index} className="tech-tag">
                          {tech}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ marginLeft: '10px' }}>설정되지 않음</span>
                  )}
                </div>
              )}
              <div style={{ marginBottom: '20px' }}>
                <strong>가입일:</strong> {new Date(user.created_at).toLocaleDateString()}
              </div>
              
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary"
              >
                프로필 수정
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
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
                  rows={4}
                  placeholder="간단한 자기소개를 작성해주세요"
                />
              </div>

              {user.role === 'mentor' && (
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

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? '저장 중...' : '저장'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-secondary"
                  disabled={isLoading}
                >
                  취소
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
