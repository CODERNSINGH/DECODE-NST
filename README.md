# 🍪 Cookie-Licking Detector

A sophisticated GitHub issue management platform that helps open-source maintainers detect and manage "cookie-licking" - the practice of claiming issues but never delivering on them.

## 🚀 Features

### 🔍 **Smart Issue Detection**
- **Real-time GitHub API Integration**: Fetches live data from GitHub repositories
- **AI-Powered Analysis**: Uses Google Gemini AI to predict issue completion probability
- **Stale Issue Detection**: Automatically identifies issues that are assigned but show no progress
- **Risk Assessment**: Categorizes issues as low, medium, or high risk based on multiple factors

### 👥 **Advanced Contributor Analytics**
- **Activity Pattern Analysis**: Tracks contributor behavior patterns (high/medium/low activity)
- **Reliability Scoring**: Calculates contributor reliability based on PR merge rates and completion times
- **Real-time Status**: Shows if contributors are currently active, away, or offline
- **Performance Metrics**: Tracks average time to close, total PRs, merged PRs, and open issues

### 📊 **Comprehensive Dashboard**
- **Real-time Monitoring**: Live updates of repository health and issue progress
- **Visual Analytics**: Progress bars, charts, and metrics for easy understanding
- **AI Insights**: Smart recommendations based on repository patterns
- **Top Contributors**: Highlights most reliable and active contributors

### 🔔 **Intelligent Notifications**
- **Smart Alerts**: Notifications for stale issues, low activity contributors, and high-risk situations
- **Priority System**: Critical, warning, and info level notifications
- **Actionable Insights**: Direct links to issues and contributor profiles
- **Dismissible Alerts**: Easy management of notification preferences

### 🎯 **Enhanced User Experience**
- **Modern UI**: Beautiful, responsive design with smooth animations
- **Real-time Updates**: Auto-refreshing data every 5 minutes
- **Search & Filter**: Advanced filtering by status, activity level, and reliability
- **Tabbed Interface**: Organized view with Dashboard and Issues tabs

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **Animations**: Framer Motion
- **State Management**: TanStack Query (React Query)
- **API Integration**: GitHub REST API + Google Gemini AI
- **Icons**: Lucide React
- **Charts**: Recharts

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- GitHub repository access

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stale-spotter
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📖 Usage

### 1. **Repository Analysis**
- Enter a GitHub repository URL or `owner/repo` format
- The system will fetch and analyze all issues and contributors
- View real-time dashboard with key metrics

### 2. **Issue Management**
- Browse issues with AI-powered completion predictions
- Filter by status, assignee, or activity level
- View detailed issue timelines and contributor activity

### 3. **Contributor Insights**
- Analyze contributor reliability and activity patterns
- Identify top performers and potential bottlenecks
- Track contributor engagement over time

### 4. **Smart Notifications**
- Receive alerts for stale issues and low activity contributors
- Get AI-powered recommendations for issue management
- Take action directly from notification cards

## 🔧 Configuration

### GitHub API
The application uses GitHub's REST API. For higher rate limits, you can:
1. Add a GitHub Personal Access Token
2. Update the API headers in `src/lib/github-api.ts`

### Gemini AI Integration
The AI analysis uses Google's Gemini API:
- API Key is configured in `src/lib/github-api.ts`
- Customize prompts for different analysis types
- Fallback analysis available if AI is unavailable

## 📊 Key Metrics

### Issue Analysis
- **Completion Probability**: AI-predicted likelihood of issue completion (0-100%)
- **Estimated Days**: Predicted time to completion
- **Risk Level**: Low/Medium/High based on multiple factors
- **Staleness**: Days since last activity

### Contributor Metrics
- **Reliability Score**: Based on PR merge rate and completion time
- **Activity Pattern**: High/Medium/Low based on recent activity
- **Performance**: Average time to close, total contributions
- **Status**: Active/Away/Offline based on recent activity

## 🎨 UI Components

### Issue Cards
- Status badges with color coding
- AI prediction indicators
- Contributor activity status
- Risk assessment badges

### Contributor Cards
- Activity status indicators
- Reliability scores
- Performance metrics
- Activity pattern badges

### Dashboard
- Real-time metrics
- Progress indicators
- AI insights panel
- Top contributors list

## 🔮 AI Features

### Issue Analysis
The AI analyzes multiple factors:
- Issue complexity and labels
- Assignee's historical performance
- Recent activity patterns
- Repository-specific patterns

### Predictions Include:
- Completion probability percentage
- Estimated completion time
- Risk assessment
- Actionable recommendations

## 🚨 Stale Issue Detection

### Criteria for Stale Issues:
- Assigned to a contributor
- No linked pull request
- No activity for configurable days (default: 7)
- Open status

### Stale Issue Categories:
- **Critical**: 14+ days stale
- **Warning**: 7-13 days stale
- **Info**: Recently assigned but no activity

## 📈 Performance

- **Real-time Updates**: Data refreshes every 5 minutes
- **Caching**: Intelligent caching for better performance
- **Error Handling**: Graceful fallbacks for API failures
- **Responsive Design**: Works on all device sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- GitHub API for repository data
- Google Gemini for AI analysis
- shadcn/ui for beautiful components
- The open-source community for inspiration

---

**Built with ❤️ for the open-source community**

*Stop cookie-licking. Start real collaboration.* 🍪# Decode-Hackathon
# Hackathon-Decode
# DECODE-NST
