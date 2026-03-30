#!/bin/bash

# doddl PM - Automated GitHub Deployment Script
# This script pushes the complete codebase to GitHub using the API

GITHUB_TOKEN="$1"
REPO_OWNER="D0DDL"
REPO_NAME="doddl-dashboard"
BRANCH="main"

if [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: GitHub token required"
    echo "Usage: ./github-deploy.sh YOUR_GITHUB_TOKEN"
    exit 1
fi

echo "🚀 Deploying doddl PM to GitHub..."
echo "Repository: $REPO_OWNER/$REPO_NAME"
echo ""

cd /home/claude/doddl-pm-app

# Initialize git
git init
git config user.name "Claude"
git config user.email "claude@anthropic.com"

# Add remote with token
git remote add origin https://$GITHUB_TOKEN@github.com/$REPO_OWNER/$REPO_NAME.git

# Add all files
git add .

# Commit
git commit -m "Deploy doddl Project Management app - Full stack Next.js + Supabase"

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin $BRANCH --force

echo ""
echo "✅ Successfully deployed to GitHub!"
echo "Next steps:"
echo "1. Set up Supabase: https://supabase.com"
echo "2. Deploy to Vercel: https://vercel.com"
echo "3. Follow instructions in DEPLOYMENT.md"
