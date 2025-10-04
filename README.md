# 🍪 GIT BUDDY - Cookie-Licking Detector  
### _Stop cookie-licking. Start real collaboration._  

A sophisticated, AI-powered GitHub issue management platform that helps open-source maintainers detect and manage **“cookie-licking”** — the act of claiming issues but never delivering on them.  

---

## 🧩 Problem Statement

In open source, contributors often comment “I’ll work on this” but never follow through. This leads to:
- Frustrated newcomers who see issues as “taken”
- Maintainers blocked by inactive claims
- Reduced project velocity and collaboration quality

**GIT BUDDY** solves this by automatically detecting, analyzing, and resolving these stale issue claims — empowering maintainers to manage their repositories more efficiently.  

---

## 🚀 Quick Start Guide

### Option 1: Fix npm and Install Dependencies
```bash
cd "/Users/ranajeetroy/Desktop/Decode Hackthon/stale-spotter"
sudo chown -R $(whoami) ~/.npm
npm cache clean --force
npm install
npm run dev
````

### Option 2: Use the Setup Script

```bash
cd "/Users/ranajeetroy/Desktop/Decode Hackthon/stale-spotter"
./start-dev.sh
```

### Option 3: Manual Installation

```bash
rm -f package-lock.json
rm -rf node_modules
npm install --legacy-peer-deps --no-optional --force
# or
yarn install
npm run dev
```

Once running, open your browser at **[http://localhost:5173](http://localhost:5173)**

---

## 🎯 What You'll See

### 🏠 **Home Page**

* Animated cookie hero section 🍪
* Repository search bar
* Feature showcase with icons and smooth transitions

### 📊 **Dashboard**

* Real-time repository health metrics
* Stale issue rate progress bar
* AI insights and recommendations
* Top contributors panel

### 📋 **Issues Tab**

* AI-powered issue completion prediction
* Risk assessment badges
* Contributor activity visualization

### 👥 **Contributors Page**

* Detailed contributor analytics
* Reliability scores
* Performance metrics and live activity

### 🔔 **Smart Notifications**

* Alerts for stale issues or low activity
* Success notifications for reliable contributors
* Dismissible alert system

---

## 🎨 Key Features

### 🤖 **AI-Powered Analysis**

* **Gemini AI Integration** – Smart issue predictions
* **Completion Probability** – 0–100% likelihood
* **Risk Assessment** – Low / Medium / High
* **Smart Recommendations** – Maintain repository health

### ⏱️ **Real-time Monitoring**

* Auto-refresh every 5 minutes
* Detects inactive issues
* Tracks contributor behavior

### 💻 **Beautiful UI**

* Built with **React + Tailwind + Framer Motion**
* Fully responsive and modern
* Dark/Light theme support

---

## 🛠️ Technology Stack

| Category             | Tools / Frameworks                       |
| -------------------- | ---------------------------------------- |
| **Frontend**         | React 18 + TypeScript + Vite             |
| **UI**               | Tailwind CSS + shadcn/ui + Framer Motion |
| **State Management** | TanStack Query (React Query)             |
| **API Integration**  | GitHub REST API + Google Gemini AI       |
| **Visualization**    | Recharts + Lucide Icons                  |

---

## 🔧 Configuration

### GitHub API

To increase rate limits:

1. Create a **GitHub Personal Access Token**
2. Add it to your environment variables
3. Update headers in `src/lib/github-api.ts`

### Gemini AI

* API Key configured in `src/lib/github-api.ts`
* Customizable prompts for various analysis types
* Fallback system if AI is unavailable

---

## 🧭 Usage

1. **Search Repository** → Enter `owner/repo` or full URL
2. **View Dashboard** → See live analytics
3. **Browse Issues** → AI-based risk & completion insights
4. **Check Contributors** → View reliability and patterns
5. **Manage Notifications** → Respond to stale activity

---

## 📊 Key Metrics

### **Issue Analysis**

* Completion probability (0–100%)
* Estimated completion days
* Risk level (Low / Medium / High)
* Days since last activity

### **Contributor Metrics**

* Reliability score
* Activity pattern (High / Medium / Low)
* Average PR merge time
* Real-time status (Active / Away / Offline)

---

## 🔮 AI Features

### **AI Predictions Include**

* Completion probability
* Estimated completion time
* Risk assessment
* Actionable recommendations

### **Stale Issue Detection**

| Category     | Condition                      |
| ------------ | ------------------------------ |
| **Critical** | 14+ days inactive              |
| **Warning**  | 7–13 days inactive             |
| **Info**     | Recently assigned, no progress |

---

## ⚙️ Troubleshooting

### npm Permission Issues

```bash
sudo chown -R $(whoami) ~/.npm
npm config set cache ~/.npm-cache
```

### Dependencies Error

```bash
npm install --legacy-peer-deps
npm install --force
```

### Port in Use

```bash
lsof -ti:5173 | xargs kill -9
npm run dev -- --port 3000
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests (if applicable)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.
See the LICENSE file for details.

---

## 🙏 Acknowledgments

* **GitHub API** for data integration
* **Google Gemini** for AI analysis
* **shadcn/ui** for clean design components
* The **open-source community** for inspiration

---

**Built with ❤️ at Decode Hackathon**

> Empowering maintainers to detect stale issues and promote real collaboration in open source.
> 🍪✨

---
