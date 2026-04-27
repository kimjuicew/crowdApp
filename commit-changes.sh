#!/bin/bash

# สคริปต์สำหรับ commit การเปลี่ยนแปลงทั้งหมด

echo "🚀 CrowdWatch - Git Commit Script"
echo "=================================="
echo ""

# Check if in git repository
if [ ! -d .git ]; then
    echo "❌ Error: Not a git repository"
    echo "💡 Run: git init"
    exit 1
fi

# Check git config
if [ -z "$(git config user.name)" ]; then
    echo "⚙️  Setting git user config..."
    git config user.email "crowdwatch@thammasat.ac.th"
    git config user.name "CrowdWatch Team"
fi

echo "📋 Current changes:"
git status --short | head -20
echo ""

# Add all changes
echo "➕ Adding all changes..."
git add -A

# Show what will be committed
echo ""
echo "📝 Files to commit:"
git status --short | head -20
echo ""

# Commit
echo "💾 Creating commit..."
git commit -m "Fix chart duplicate keys and add comprehensive setup guides

- Fix React duplicate keys warning in LocationDetail chart gradient
- Add QUICK_START.md with step-by-step setup guide
- Add START_HERE.md for quick reference
- Add commit-changes.sh script for easy git commits
- Update documentation for production readiness

All features working:
✅ Supabase integration
✅ Login/Sign up
✅ Favorite locations
✅ Notifications
✅ Profile editing
✅ Real-time crowd monitoring

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

echo ""
echo "✅ Committed successfully!"
echo ""
echo "📤 Next steps:"
echo "1. Create a new repository on GitHub/GitLab"
echo "2. Run: git remote add origin YOUR_REPO_URL"
echo "3. Run: git branch -M main"
echo "4. Run: git push -u origin main"
echo ""
echo "💡 See GIT_SETUP.md for detailed instructions"
