#!/bin/bash

# PulseLoop - Initialize Git and Push to GitHub
# Run this script to prepare your code for deployment

echo "🚀 PulseLoop Deployment Initializer"
echo "===================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
__pycache__/
*.pyc
venv/
.venv/

# Environment
.env
.env.local
.env.production

# Build
dist/
build/

# IDE
.vscode/
.idea/
.DS_Store

# Logs
*.log
EOF
    echo "✅ .gitignore created"
fi

# Stage all files
echo ""
echo "📦 Staging files..."
git add .

# Check if there are changes to commit
if git diff-index --quiet HEAD --; then
    echo "⚠️  No changes to commit"
else
    echo "💾 Committing changes..."
    git commit -m "Prepare PulseLoop for deployment

- Complete MVP implementation
- Backend API with 15 models
- ML Service with 3 pattern detection algorithms
- Frontend with full demo flow
- Comprehensive documentation
- Deployment configs for Vercel and Render"
    echo "✅ Changes committed"
fi

echo ""
echo "======================================"
echo "✅ Repository ready for deployment!"
echo "======================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Create GitHub repository:"
echo "   Go to: https://github.com/new"
echo "   Name: pulseloop"
echo "   Click 'Create repository'"
echo ""
echo "2. Push to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/pulseloop.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Follow DEPLOYMENT.md for:"
echo "   - MongoDB Atlas setup"
echo "   - Render deployment (backend + ML)"
echo "   - Vercel deployment (frontend)"
echo ""
echo "📚 Documentation:"
echo "   - DEPLOYMENT.md - Full deployment guide"
echo "   - DEPLOY_CHECKLIST.md - Step-by-step checklist"
echo ""
echo "🎯 Expected deployment time: ~25 minutes"
echo ""
