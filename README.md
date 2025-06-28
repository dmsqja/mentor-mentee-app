# 멘토-멘티 매칭 웹앱

멘토와 멘티를 매칭하는 웹 애플리케이션입니다.

## 🚀 주요 기능

- **사용자 인증**: JWT 기반 회원가입/로그인
- **프로필 관리**: 프로필 정보 수정, 이미지 업로드
- **멘토 검색**: 기술 스택별 필터링, 정렬
- **매칭 요청**: 멘토에게 매칭 요청 전송/관리
- **요청 관리**: 수락/거절, 상태 확인
- **API 문서**: Swagger UI 제공

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

## 기능

- 회원가입 및 로그인 (JWT 인증)
- 사용자 프로필 관리 (멘토/멘티)
- 멘토 목록 조회 및 검색
- 매칭 요청 기능
- 요청 수락/거절
- 요청 상태 조회

## 기술 스택

- **Frontend**: React.js
- **Backend**: Node.js + Express.js
- **Database**: SQLite (로컬 개발용)
- **Authentication**: JWT
- **API Documentation**: Swagger/OpenAPI

## 실행 방법

### 1. 백엔드 실행
```bash
cd backend
npm install
npm start
```
- 백엔드 서버: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui

### 2. 프론트엔드 실행
```bash
cd frontend
npm install
npm start
```
- 프론트엔드 앱: http://localhost:3000

## API 명세

- OpenAPI 문서: `http://localhost:8080/openapi.json`
- Swagger UI: `http://localhost:8080/swagger-ui`

## 보안

- JWT 토큰 기반 인증
- SQL 인젝션 방지
- XSS 공격 방지
- OWASP TOP 10 보안 기준 준수
