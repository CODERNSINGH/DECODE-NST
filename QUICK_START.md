# 🍪 Cookie-Licking Detector - Quick Start Guide

## 🚀 Getting Started

Your enhanced Cookie-Licking Detector is ready! Here's how to get it running:

### Option 1: Fix npm and Install Dependencies

```bash
# Navigate to the project directory
cd "/Users/ranajeetroy/Desktop/Decode Hackthon/stale-spotter"

# Fix npm cache permissions (run this in terminal)
sudo chown -R $(whoami) ~/.npm

# Clean npm cache
npm cache clean --force

# Install dependencies
npm install

# Start development server
npm run dev
```

### Option 2: Use the Setup Script

```bash
# Navigate to the project directory
cd "/Users/ranajeetroy/Desktop/Decode Hackthon/stale-spotter"

# Run the setup script
./start-dev.sh
```

### Option 3: Manual Installation

If npm continues to have issues:

```bash
# Remove existing lock files
rm -f package-lock.json
rm -rf node_modules

# Try installing with different flags
npm install --legacy-peer-deps --no-optional --force

# Or try with yarn (if available)
yarn install

# Start the development server
npm run dev
```

## 🎯 What You'll See

Once running, you'll have access to:

### 🏠 **Home Page**
- Beautiful hero section with animated cookie
- Repository search functionality
- Feature showcase with icons and descriptions

### 📊 **Dashboard Tab**
- Real-time repository metrics
- Stale issue rate progress bar
- Completion rate tracking
- AI insights and recommendations
- Top contributors list

### 📋 **Issues Tab**
- AI-powered issue analysis
- Completion probability predictions
- Risk assessment badges
- Contributor activity status
- Smart filtering and search

### 👥 **Contributors Page**
- Detailed contributor analytics
- Reliability scores and activity patterns
- Performance metrics
- Real-time status indicators

### 🔔 **Smart Notifications**
- Critical alerts for stale issues
- Warning notifications for low activity
- Success notifications for reliable contributors
- Dismissible alert system

## 🎨 **Key Features**

### **AI-Powered Analysis**
- **Gemini AI Integration**: Smart predictions using Google's AI
- **Completion Probability**: 0-100% likelihood of issue completion
- **Risk Assessment**: Low/Medium/High risk categorization
- **Smart Recommendations**: Actionable insights for maintainers

### **Real-time Monitoring**
- **Live Updates**: Data refreshes every 5 minutes
- **Activity Tracking**: Real-time contributor status
- **Stale Detection**: Automatic identification of inactive issues
- **Performance Metrics**: Comprehensive analytics

### **Beautiful UI**
- **Modern Design**: Clean, professional interface
- **Smooth Animations**: Framer Motion powered transitions
- **Responsive Layout**: Works on all device sizes
- **Dark/Light Theme**: Automatic theme detection

## 🔧 **Configuration**

### **GitHub API**
The app uses GitHub's REST API. For higher rate limits:
1. Create a GitHub Personal Access Token
2. Add it to your environment variables
3. Update the API headers in `src/lib/github-api.ts`

### **Gemini AI**
AI analysis uses Google's Gemini API:
- API Key is configured in `src/lib/github-api.ts`
- Customize prompts for different analysis types
- Fallback analysis available if AI is unavailable

## 📱 **Usage**

1. **Search Repository**: Enter GitHub repo URL or `owner/repo` format
2. **View Dashboard**: See real-time metrics and AI insights
3. **Browse Issues**: Filter and analyze issues with AI predictions
4. **Check Contributors**: Review contributor reliability and activity
5. **Manage Notifications**: Handle alerts and take action

## 🎯 **Example Repositories to Try**

- `facebook/react` - Large, active repository
- `microsoft/vscode` - Popular open-source project
- `vercel/next.js` - Modern web framework
- `tailwindlabs/tailwindcss` - CSS framework

## 🚨 **Troubleshooting**

### **npm Permission Issues**
```bash
# Fix npm cache permissions
sudo chown -R $(whoami) ~/.npm

# Or use a different cache location
npm config set cache ~/.npm-cache
```

### **Dependencies Issues**
```bash
# Try different installation methods
npm install --legacy-peer-deps
npm install --force
npm install --no-optional
```

### **Port Already in Use**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use a different port
npm run dev -- --port 3000
```

## 🎉 **Success!**

Once running, you'll have a sophisticated, AI-powered GitHub issue management platform that:

- ✅ Detects cookie-licking (claimed but inactive issues)
- ✅ Predicts issue completion probability
- ✅ Tracks contributor reliability and activity
- ✅ Provides smart notifications and recommendations
- ✅ Offers beautiful, modern UI with real-time updates

**Your Cookie-Licking Detector is now ready to help maintainers manage their open-source projects more effectively!** 🍪✨

---

*Need help? Check the console for any error messages or refer to the README.md file for detailed documentation.*
