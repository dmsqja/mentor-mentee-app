#!/bin/bash

# 멘토-멘티 매칭 앱 실행 스크립트
# 백엔드와 프론트엔드를 동시에 실행합니다

echo "🚀 멘토-멘티 매칭 앱 실행 중..."
echo ""

# 백엔드 실행
echo "📡 백엔드 서버 실행 중..."
cd backend
npm install > /dev/null 2>&1
npm start &
BACKEND_PID=$!
cd ..

# 잠시 대기 (백엔드 시작 시간)
sleep 3

# 프론트엔드 실행  
echo "🎨 프론트엔드 앱 실행 중..."
cd frontend
npm install > /dev/null 2>&1
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ 실행 완료!"
echo "📍 백엔드 서버: http://localhost:8080"
echo "📍 Swagger UI: http://localhost:8080/swagger-ui"
echo "📍 프론트엔드 앱: http://localhost:3000"
echo ""
echo "⏹️  종료하려면 Ctrl+C를 누르세요"

# 종료 시그널 처리
trap "echo ''; echo '🛑 서버 종료 중...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

# 백그라운드 프로세스 대기
wait
