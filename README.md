# 멘토-멘티 매칭 웹앱

> **천하제일 입코딩 대회 2025 제출작**  
> 멘토와 멘티를 매칭하는 웹 애플리케이션

## 실행 방법

### 필요 환경
- Node.js 16+
- npm 8+

### 백엔드 실행
```bash
cd backend
npm install
npm start
```

### 프론트엔드 실행
```bash
cd frontend
npm install
npm start
```

### 백그라운드 실행 (자동화 평가용)
```bash
# 자동화 시스템용 (각 디렉토리에서 직접 실행)
npm install && npm run start:bg
```

### 수동 백그라운드 실행 (개발용)
```bash
# 루트 디렉토리에서 수동 실행
cd backend && npm install && npm run start:bg
cd frontend && npm install && npm run start:bg
```

### 원클릭 실행 스크립트
```bash
# 시작
./start.sh

# 종료
./stop.sh
```

### 수동 백그라운드 종료
```bash
pkill -f "node.*app.js" && pkill -f "react-scripts start"
```

## 자동화 평가 시스템 주의사항

### 실행 명령어 (자동화 시스템용)
자동화 시스템이 각 디렉토리로 이동한 후 실행하는 명령어:
- **백엔드**: `npm install && npm run start:bg` (backend 디렉토리에서)
- **프론트엔드**: `npm install && npm run start:bg` (frontend 디렉토리에서)

⚠️ **중요**: `cd backend` 없이 바로 `npm install && npm run start:bg` 실행

### 확인 방법  
- 백엔드: http://localhost:8080/health (200 OK 응답)
- 프론트엔드: http://localhost:3000 (React 앱 로딩)
- 로그 파일: `server.log` (백엔드), `app.log` (프론트엔드)
- PID 파일: `server.pid` (백엔드), `app.pid` (프론트엔드)

## 테스트 계정

앱 실행 시 다음 테스트 계정들이 자동으로 생성됩니다:

### 멘토 계정
- **이메일**: `mentor@test.com`
- **비밀번호**: `test123`
- **이름**: 김멘토
- **기술스택**: React, Node.js, Python, MongoDB, PostgreSQL

- **이메일**: `mentor2@test.com`
- **비밀번호**: `test123`
- **이름**: 박멘토
- **기술스택**: Python, TensorFlow, PyTorch, Jupyter, Docker

### 멘티 계정
- **이메일**: `mentee@test.com`
- **비밀번호**: `test123`
- **이름**: 이멘티
- **기술스택**: HTML, CSS, JavaScript

- **이메일**: `mentee2@test.com`
- **비밀번호**: `test123`
- **이름**: 최멘티
- **기술스택**: Python, Basic ML

### 로그인 예시
1. http://localhost:3000 접속
2. 상단 네비게이션에서 "로그인" 클릭
3. 위 테스트 계정 중 하나로 로그인
4. 대시보드에서 매칭 요청 및 관리 기능 사용

### API 테스트 예시
```bash
# 1. 멘티 로그인
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "mentee@test.com", "password": "test123"}'

# 2. 멘토 목록 조회 (응답으로 받은 토큰 사용)
curl -X GET http://localhost:8080/api/users/mentors \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. 매칭 요청 보내기
curl -X POST http://localhost:8080/api/matches/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"mentor_id": 1, "message": "멘토링을 받고 싶습니다!"}'

# 4. 멘토 로그인 후 요청 승인
curl -X PUT http://localhost:8080/api/matches/requests/1/accept \
  -H "Authorization: Bearer MENTOR_TOKEN"
```

### 접속 주소
- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:8080/api
- Swagger UI: http://localhost:8080/swagger-ui

## 구현 완료 기능

### 기능 요구사항
- 회원가입 및 로그인 (JWT 인증)
- 사용자 프로필 관리 (이미지 업로드 포함)
- 멘토 목록 조회 및 검색 (기술스택 필터링, 정렬)
- 매칭 요청 생성 (메시지 포함)
- 요청 관리 (수락/거절/취소)
- 매칭 제한사항 (중복 요청 방지, 1:1 매칭)

### 기술 요구사항
- JWT 클레임 (RFC 7519 준수: iss, sub, aud, exp, nbf, iat, jti + name, email, role)
- OpenAPI 문서 및 Swagger UI
- SQLite 데이터베이스 (자동 초기화)
- 보안 기능 (SQL 인젝션 방지, XSS 방지, Rate Limiting)
- 프로필 이미지 (JPG/PNG, 500x500-1000x1000, 최대 1MB)
- 기본 플레이스홀더 이미지

## 기술 스택

### Frontend
- React 18 + TypeScript
- React Router
- JWT Authentication

### Backend  
- Node.js + Express.js
- SQLite Database
- JWT Authentication (RFC 7519)
- Swagger UI / OpenAPI 3.0
- Security Middleware

## 프로젝트 구조

```
mentor-mentee-app/
├── backend/
│   ├── src/
│   │   ├── config/      # 설정 파일 (DB, JWT, Swagger)
│   │   ├── middleware/  # 인증, 에러 처리 미들웨어
│   │   ├── models/      # User, MatchRequest 모델
│   │   ├── routes/      # auth, users, matches 라우트
│   │   └── app.js       # Express 앱 메인 파일
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Navbar, ProtectedRoute
│   │   ├── pages/       # 각종 페이지 컴포넌트
│   │   ├── services/    # API 호출 서비스
│   │   ├── utils/       # AuthContext
│   │   └── styles/      # CSS 파일들
│   ├── public/
│   └── package.json
├── start.sh             # 자동 실행 스크립트
└── README.md
```

## 테스트 엔드포인트

### API 테스트
- POST /api/auth/signup - 회원가입
- POST /api/auth/login - 로그인
- GET /api/users/me - 사용자 정보 조회
- PUT /api/users/profile - 프로필 수정
- GET /api/users/mentors - 멘토 목록 조회
- POST /api/matches/requests - 매칭 요청 생성
- GET /api/matches/my-requests - 내 요청 목록
- PUT /api/matches/{id}/accept - 요청 수락
- PUT /api/matches/{id}/reject - 요청 거절
- DELETE /api/matches/{id} - 요청 삭제

### URL 확인
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- Swagger UI: http://localhost:8080/swagger-ui
- OpenAPI JSON: http://localhost:8080/openapi.json
- Health Check: http://localhost:8080/health

### 핵심 비즈니스 로직
- 멘티는 대기중인 요청이 있으면 다른 요청 불가
- 같은 멘토에게 재요청 불가 (DB UNIQUE 제약)
- 멘토는 한 명의 멘티만 수락 가능
- 요청 상태: pending → accepted/rejected → cancelled

### 보안 검증
- JWT 토큰: 모든 필수 클레임 (iss, sub, aud, exp, nbf, iat, jti)
- 커스텀 클레임: name, email, role (mentor/mentee)  
- 토큰 만료: 1시간 유효기간
- SQL 인젝션, XSS 방지, Rate Limiting
