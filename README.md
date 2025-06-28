# 멘토-멘티 매칭 웹앱

> **천하제일 입코딩 대회 2025 제출작**  
> 멘토와 멘티를 매칭하는 웹 애플리케이션

## 🚀 빠른 실행 가이드

### 1️⃣ 백엔드 API 서버 실행
```bash
cd backend
npm install
npm start
```
- **서버 주소**: http://localhost:8080
- **API 문서**: http://localhost:8080/swagger-ui  
- **OpenAPI**: http://localhost:8080/openapi.json

### 2️⃣ 프론트엔드 앱 실행
```bash
cd frontend  
npm install
npm start
```
- **앱 주소**: http://localhost:3000

## ✅ 구현 완료 기능

### 필수 기능
- ✅ **회원가입/로그인** (JWT 인증)
- ✅ **프로필 관리** (이미지 업로드 포함)
- ✅ **멘토 검색** (기술스택 필터링, 정렬)
- ✅ **매칭 요청** (메시지 포함)
- ✅ **요청 관리** (수락/거절/취소)
- ✅ **제한사항** (중복 요청 방지, 1:1 매칭)

### 기술 요구사항
- ✅ **JWT 클레임** (RFC 7519 준수: iss, sub, aud, exp, nbf, iat, jti + name, email, role)
- ✅ **OpenAPI 문서** 및 **Swagger UI**
- ✅ **SQLite 데이터베이스** (자동 초기화)
- ✅ **보안 기능** (SQL 인젝션 방지, XSS 방지, Rate Limiting)
- ✅ **프로필 이미지** (JPG/PNG, 500x500-1000x1000, 최대 1MB)
- ✅ **기본 플레이스홀더** 이미지

## 🛠 기술 스택

### Frontend
- React 18 + TypeScript
- React Router
- CSS3
- JWT Authentication

### Backend  
- Node.js + Express.js
- SQLite Database
- JWT Authentication
- Swagger UI
- Rate Limiting & Security

## 프로젝트 구조

```
mentor-mentee-app/
├── frontend/           # React 프론트엔드 앱 (포트 3000)
│   ├── src/
│   │   ├── components/ # 재사용 가능한 컴포넌트
│   │   ├── pages/      # 페이지 컴포넌트
│   │   ├── services/   # API 호출 서비스
│   │   ├── utils/      # 유틸리티 함수
│   │   └── styles/     # CSS 스타일
│   └── public/         # 정적 파일
├── backend/            # Node.js/Express 백엔드 API (포트 8080)
│   └── src/
│       ├── controllers/ # 컨트롤러
│       ├── models/      # 데이터 모델
│       ├── routes/      # API 라우트
│       ├── middleware/  # 미들웨어
│       ├── services/    # 비즈니스 로직
│       ├── utils/       # 유틸리티
│       └── config/      # 설정 파일
├── database/           # 데이터베이스 스키마 및 초기화 스크립트
└── docs/              # 문서
```

## 🛠 기술 스택

### Frontend
- **React 18** + **TypeScript**
- React Router, CSS3
- JWT Authentication

### Backend  
- **Node.js** + **Express.js**
- **SQLite** Database (자동 초기화)
- **JWT** Authentication (RFC 7519 준수)
- **Swagger UI** / OpenAPI 3.0
- Rate Limiting & Security Middleware

## 📋 평가 체크리스트

### 🌐 URL 접근성
- ✅ 프론트엔드: http://localhost:3000
- ✅ 백엔드 API: http://localhost:8080/api
- ✅ Swagger UI: http://localhost:8080/swagger-ui
- ✅ 루트 URL → Swagger UI 리다이렉트

### 🔧 실행 명령어
```bash
# 백엔드 (터미널 1)
cd backend && npm install && npm start

# 프론트엔드 (터미널 2)  
cd frontend && npm install && npm start
```

### 🎯 핵심 비즈니스 로직
- ✅ **매칭 제한**: 멘티는 대기중인 요청이 있으면 다른 요청 불가
- ✅ **중복 방지**: 같은 멘토에게 재요청 불가 (DB UNIQUE 제약)
- ✅ **1:1 매칭**: 멘토는 한 명의 멘티만 수락 가능
- ✅ **상태 관리**: pending → accepted/rejected → cancelled

### 🔐 보안 & 인증
- ✅ **JWT 토큰**: 모든 필수 클레임 (iss, sub, aud, exp, nbf, iat, jti)
- ✅ **커스텀 클레임**: name, email, role (mentor/mentee)  
- ✅ **토큰 만료**: 1시간 유효기간
- ✅ **보안 미들웨어**: SQL 인젝션, XSS 방지, Rate Limiting
