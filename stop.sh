#!/bin/bash

# 멘토-멘티 매칭 앱 종료 스크립트
# 백그라운드에서 실행 중인 서버들을 종료합니다

echo "🛑 멘토-멘티 매칭 앱 종료 중..."

# 백엔드 프로세스 종료
echo "📡 백엔드 서버 종료 중..."
pkill -f "node.*app.js" 2>/dev/null && echo "✅ 백엔드 서버 종료됨" || echo "ℹ️  실행 중인 백엔드 서버 없음"

# 프론트엔드 프로세스 종료
echo "🎨 프론트엔드 앱 종료 중..."
pkill -f "react-scripts start" 2>/dev/null && echo "✅ 프론트엔드 앱 종료됨" || echo "ℹ️  실행 중인 프론트엔드 앱 없음"

# 포트 확인
echo "🔍 포트 상태 확인 중..."
if lsof -ti:8080 > /dev/null 2>&1; then
    echo "⚠️  포트 8080이 여전히 사용 중입니다"
else
    echo "✅ 포트 8080 정리됨"
fi

if lsof -ti:3000 > /dev/null 2>&1; then
    echo "⚠️  포트 3000이 여전히 사용 중입니다"
else
    echo "✅ 포트 3000 정리됨"
fi

echo ""
echo "✅ 종료 완료!"
