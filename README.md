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
# 백엔드 백그라운드 실행
cd backend && npm install && npm run start:bg

# 프론트엔드 백그라운드 실행
cd frontend && npm install && npm run start:bg

# 또는 로그 출력과 함께
cd backend && npm install && npm start > backend.log 2>&1 &
cd frontend && npm install && npm start > frontend.log 2>&1 &
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
