#!/bin/bash

# Quick Deploy Script for doddl PM
# Run this from your doddl-dashboard repo

echo "🚀 Deploying doddl PM to GitHub..."

# Initialize git if needed
if [ ! -d ".git" ]; then
    git init
    git remote add origin https://github.com/D0DDL/doddl-dashboard.git
fi

# Add all files
git add .

# Commit
git commit -m "Deploy doddl Project Management app"

# Push to GitHub
git push -u origin main

echo "✅ Pushed to GitHub!"
echo ""
echo "Next steps:"
echo "1. Go to https://vercel.com"
echo "2. Click 'Import Project'"
echo "3. Select your GitHub repo: D0DDL/doddl-dashboard"
echo "4. Add environment variables (from DEPLOYMENT.md)"
echo "5. Click Deploy!"
