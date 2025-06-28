#!/bin/bash

# 멘토-멘티 매칭 앱 실행 스크립트
# 백엔드와 프론트엔드를 백그라운드에서 실행합니다

echo "🚀 멘토-멘티 매칭 앱 실행 중..."
echo ""

# 기존 프로세스 정리
echo "🧹 기존 프로세스 정리 중..."
pkill -f "node.*app.js" 2>/dev/null || true
pkill -f "react-scripts start" 2>/dev/null || true

# 백엔드 실행
echo "📡 백엔드 서버 실행 중..."
cd backend
npm install > ../backend-install.log 2>&1
nohup npm start > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
cd ..

# 백엔드 시작 대기
echo "⏳ 백엔드 시작 대기 중..."
sleep 5

# 프론트엔드 실행  
echo "🎨 프론트엔드 앱 실행 중..."
cd frontend
npm install > ../frontend-install.log 2>&1
nohup npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
cd ..

# 서버 시작 확인
echo "🔍 서버 상태 확인 중..."
sleep 10

# 백엔드 상태 확인
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ 백엔드 서버 정상 실행: http://localhost:8080"
else
    echo "❌ 백엔드 서버 실행 실패"
fi

# 프론트엔드 상태 확인  
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ 프론트엔드 앱 정상 실행: http://localhost:3000"
else
    echo "❌ 프론트엔드 앱 실행 실패"
fi

echo ""
echo "✅ 실행 완료!"
echo "📍 백엔드 서버: http://localhost:8080"
echo "📍 Swagger UI: http://localhost:8080/swagger-ui"
echo "📍 프론트엔드 앱: http://localhost:3000"
echo ""
echo "📊 로그 파일:"
echo "   - 백엔드: backend.log"
echo "   - 프론트엔드: frontend.log"
echo ""
echo "🛑 종료하려면: pkill -f 'node.*app.js' && pkill -f 'react-scripts start'"
