#!/bin/bash

# PulseLoop - Start All Services
# This script starts backend, ML service, and frontend in separate terminal tabs/windows

echo "🚀 Starting PulseLoop Services..."
echo ""

# Check if we're on macOS (for Terminal.app automation)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📱 Detected macOS - Opening in separate Terminal tabs..."
    
    # Backend
    osascript -e 'tell application "Terminal" to do script "cd \"'$(pwd)'/backend\" && echo \"🔧 Starting Backend...\" && npm run dev"'
    
    # ML Service
    osascript -e 'tell application "Terminal" to do script "cd \"'$(pwd)'/ml-service\" && echo \"🤖 Starting ML Service...\" && source venv/bin/activate && python main.py"'
    
    # Frontend
    osascript -e 'tell application "Terminal" to do script "cd \"'$(pwd)'/frontend\" && echo \"💻 Starting Frontend...\" && npm run dev"'
    
    echo ""
    echo "✅ All services started in separate Terminal tabs!"
    echo ""
    echo "📍 Services will be available at:"
    echo "   Backend:    http://localhost:5000"
    echo "   ML Service: http://localhost:8000"
    echo "   Frontend:   http://localhost:5173"
    echo ""
    echo "🎯 Open http://localhost:5173 to access PulseLoop"
    echo ""
    echo "📝 Demo credentials:"
    echo "   Email:    ramesh@demo.com"
    echo "   Password: password123"
    echo ""

else
    echo "⚠️  Auto-start only supported on macOS"
    echo ""
    echo "📖 Manual start instructions:"
    echo ""
    echo "Terminal 1 (Backend):"
    echo "  cd backend"
    echo "  npm run dev"
    echo ""
    echo "Terminal 2 (ML Service):"
    echo "  cd ml-service"
    echo "  source venv/bin/activate"
    echo "  python main.py"
    echo ""
    echo "Terminal 3 (Frontend):"
    echo "  cd frontend"
    echo "  npm run dev"
    echo ""
fi
