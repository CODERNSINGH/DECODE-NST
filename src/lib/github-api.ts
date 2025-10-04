// import axios from 'axios';

// const GITHUB_API_BASE = 'https://api.github.com';
// const GEMINI_API_KEY = '';
// const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// export interface GitHubIssue {
//   id: number;
//   number: number;
//   title: string;
//   state: 'open' | 'closed';
//   html_url: string;
//   created_at: string;
//   updated_at: string;
//   closed_at: string | null;
//   user: {
//     login: string;
//     avatar_url: string;
//     html_url: string;
//   };
//   assignee: {
//     login: string;
//     avatar_url: string;
//     html_url: string;
//   } | null;
//   assignees: Array<{
//     login: string;
//     avatar_url: string;
//     html_url: string;
//   }>;
//   labels: Array<{
//     name: string;
//     color: string;
//   }>;
//   body: string | null;
//   pull_request?: {
//     url: string;
//     html_url: string;
//     merged_at: string | null;
//   };
//   comments: number;
// }

// export interface GitHubRepository {
//   id: number;
//   name: string;
//   full_name: string;
//   owner: {
//     login: string;
//     avatar_url: string;
//   };
//   description: string;
//   html_url: string;
//   stargazers_count: number;
//   open_issues_count: number;
//   forks_count: number;
// }

// export interface GitHubContributor {
//   login: string;
//   avatar_url: string;
//   html_url: string;
//   contributions: number;
//   type: string;
//   site_admin: boolean;
//   id: number;
// }

// export interface GitHubUser {
//   login: string;
//   id: number;
//   avatar_url: string;
//   html_url: string;
//   type: string;
//   site_admin: boolean;
//   name?: string;
//   company?: string;
//   blog?: string;
//   location?: string;
//   email?: string;
//   bio?: string;
//   twitter_username?: string;
//   public_repos: number;
//   public_gists: number;
//   followers: number;
//   following: number;
//   created_at: string;
//   updated_at: string;
// }

// export interface UserActivityData {
//   login: string;
//   avatar_url: string;
//   html_url: string;
//   lastActivity: string;
//   totalCommits: number;
//   totalPRs: number;
//   mergedPRs: number;
//   openIssues: number;
//   closedIssues: number;
//   avgTimeToClose: number;
//   reliabilityScore: number;
//   activityPattern: 'high' | 'medium' | 'low';
//   lastSeen: string;
//   isActive: boolean;
// }

// export interface IssueTimeline {
//   event: string;
//   created_at: string;
//   actor?: {
//     login: string;
//     avatar_url: string;
//   };
//   assignee?: {
//     login: string;
//     avatar_url: string;
//   };
//   label?: {
//     name: string;
//     color: string;
//   };
// }

// class GitHubAPI {
//   private getHeaders() {
//     return {
//       'Accept': 'application/vnd.github.v3+json',
//     };
//   }

//   private async callGeminiAI(prompt: string): Promise<string> {
//     try {
//       const response = await axios.post(GEMINI_API_URL, {
//         contents: [{
//           parts: [{
//             text: prompt
//           }]
//         }]
//       }, {
//         headers: {
//           'Content-Type': 'application/json',
//           'X-goog-api-key': GEMINI_API_KEY
//         }
//       });

//       return response.data.candidates[0].content.parts[0].text;
//     } catch (error) {
//       console.error('Gemini API Error:', error);
//       throw new Error('Failed to get AI analysis');
//     }
//   }

//   async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
//     const response = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
//       headers: this.getHeaders(),
//     });
//     return response.data;
//   }

//   async getIssues(
//     owner: string,
//     repo: string,
//     options: {
//       state?: 'open' | 'closed' | 'all';
//       sort?: 'created' | 'updated' | 'comments';
//       direction?: 'asc' | 'desc';
//       per_page?: number;
//       page?: number;
//       labels?: string;
//       assignee?: string;
//     } = {}
//   ): Promise<GitHubIssue[]> {
//     const params = new URLSearchParams({
//       state: options.state || 'all',
//       sort: options.sort || 'updated',
//       direction: options.direction || 'desc',
//       per_page: String(options.per_page || 30),
//       page: String(options.page || 1),
//       ...(options.labels && { labels: options.labels }),
//       ...(options.assignee && { assignee: options.assignee }),
//     });

//     const response = await axios.get(
//       `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues?${params}`,
//       { headers: this.getHeaders() }
//     );
//     return response.data;
//   }

//   async getIssue(owner: string, repo: string, issueNumber: number): Promise<GitHubIssue> {
//     const response = await axios.get(
//       `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}`,
//       { headers: this.getHeaders() }
//     );
//     return response.data;
//   }

//   async getIssueTimeline(owner: string, repo: string, issueNumber: number): Promise<IssueTimeline[]> {
//     const response = await axios.get(
//       `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}/timeline`,
//       {
//         headers: {
//           ...this.getHeaders(),
//           'Accept': 'application/vnd.github.mockingbird-preview+json',

//         },
//       }
//     );
//     return response.data;
//   }

//   async getContributors(owner: string, repo: string): Promise<GitHubContributor[]> {
//     const response = await axios.get(
//       `${GITHUB_API_BASE}/repos/${owner}/${repo}/contributors?per_page=100`,
//       { headers: this.getHeaders() }
//     );
//     return response.data;
//   }

//   async getPullRequests(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'all') {
//     const response = await axios.get(
//       `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls?state=${state}&per_page=100`,
//       { headers: this.getHeaders() }
//     );
//     return response.data;
//   }

//   // Helper to check if an issue is stale (assigned but no recent activity)
//   isStaleIssue(issue: GitHubIssue, daysThreshold = 7): boolean {
//     if (!issue.assignee && issue.assignees.length === 0) return false;
//     if (issue.state === 'closed') return false;
//     if (issue.pull_request) return false;

//     const lastUpdate = new Date(issue.updated_at);
//     const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    
//     return daysSinceUpdate > daysThreshold;
//   }

//   // Enhanced user activity tracking
//   async getUserActivity(owner: string, repo: string, username: string): Promise<UserActivityData> {
//     try {
//       const [user, events, commits, prs] = await Promise.all([
//         this.getUser(username),
//         this.getUserEvents(username),
//         this.getUserCommits(owner, repo, username),
//         this.getUserPullRequests(owner, repo, username)
//       ]);

//       const mergedPRs = prs.filter(pr => pr.merged_at);
//       const closedIssues = await this.getUserClosedIssues(owner, repo, username);
//       const openIssues = await this.getUserOpenIssues(owner, repo, username);

//       const avgTimeToClose = this.calculateAvgTimeToClose(prs, closedIssues);
//       const reliabilityScore = this.calculateReliabilityScore(prs, mergedPRs, avgTimeToClose);
//       const activityPattern = this.determineActivityPattern(events, commits);

//       return {
//         login: user.login,
//         avatar_url: user.avatar_url,
//         html_url: user.html_url,
//         lastActivity: events[0]?.created_at || user.updated_at,
//         totalCommits: commits.length,
//         totalPRs: prs.length,
//         mergedPRs: mergedPRs.length,
//         openIssues: openIssues.length,
//         closedIssues: closedIssues.length,
//         avgTimeToClose,
//         reliabilityScore,
//         activityPattern,
//         lastSeen: events[0]?.created_at || user.updated_at,
//         isActive: this.isUserActive(events[0]?.created_at || user.updated_at)
//       };
//     } catch (error) {
//       console.error('Error fetching user activity:', error);
//       throw error;
//     }
//   }

//   async getUser(username: string): Promise<GitHubUser> {
//     const response = await axios.get(`${GITHUB_API_BASE}/users/${username}`, {
//       headers: this.getHeaders(),
//     });
//     return response.data;
//   }

//   async getUserEvents(username: string, perPage = 30): Promise<any[]> {
//     const response = await axios.get(`${GITHUB_API_BASE}/users/${username}/events/public?per_page=${perPage}`, {
//       headers: this.getHeaders(),
//     });
//     return response.data;
//   }

//   async getUserCommits(owner: string, repo: string, username: string): Promise<any[]> {
//     const response = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?author=${username}&per_page=100`, {
//       headers: this.getHeaders(),
//     });
//     return response.data;
//   }

//   async getUserPullRequests(owner: string, repo: string, username: string): Promise<any[]> {
//     const response = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls?state=all&per_page=100`, {
//       headers: this.getHeaders(),
//     });
//     return response.data.filter(pr => pr.user.login === username);
//   }

//   async getUserClosedIssues(owner: string, repo: string, username: string): Promise<GitHubIssue[]> {
//     const response = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/issues?state=closed&assignee=${username}&per_page=100`, {
//       headers: this.getHeaders(),
//     });
//     return response.data;
//   }

//   async getUserOpenIssues(owner: string, repo: string, username: string): Promise<GitHubIssue[]> {
//     const response = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/issues?state=open&assignee=${username}&per_page=100`, {
//       headers: this.getHeaders(),
//     });
//     return response.data;
//   }

//   // AI-powered issue analysis
//   async analyzeIssueWithAI(issue: GitHubIssue, userActivity: UserActivityData): Promise<{
//     completionProbability: number;
//     estimatedDays: number;
//     risk: 'low' | 'medium' | 'high';
//     reasoning: string;
//     recommendation: string;
//   }> {
//     const prompt = `
//     Analyze this GitHub issue and user activity to predict completion probability:
    
//     Issue Details:
//     - Title: ${issue.title}
//     - Number: #${issue.number}
//     - Created: ${issue.created_at}
//     - Last Updated: ${issue.updated_at}
//     - Assignee: ${issue.assignee?.login || 'None'}
//     - Labels: ${issue.labels.map(l => l.name).join(', ')}
//     - Comments: ${issue.comments}
    
//     User Activity:
//     - Total PRs: ${userActivity.totalPRs}
//     - Merged PRs: ${userActivity.mergedPRs}
//     - Reliability Score: ${userActivity.reliabilityScore}
//     - Activity Pattern: ${userActivity.activityPattern}
//     - Last Activity: ${userActivity.lastActivity}
//     - Avg Time to Close: ${userActivity.avgTimeToClose} days
    
//     Please provide:
//     1. Completion probability (0-100%)
//     2. Estimated days to completion
//     3. Risk level (low/medium/high)
//     4. Reasoning for the prediction
//     5. Recommendation for maintainers
    
//     Respond in JSON format with these exact keys: completionProbability, estimatedDays, risk, reasoning, recommendation
//     `;

//     try {
//       const aiResponse = await this.callGeminiAI(prompt);
//       const analysis = JSON.parse(aiResponse);
      
//       return {
//         completionProbability: Math.max(0, Math.min(100, analysis.completionProbability)),
//         estimatedDays: Math.max(1, analysis.estimatedDays),
//         risk: analysis.risk,
//         reasoning: analysis.reasoning,
//         recommendation: analysis.recommendation
//       };
//     } catch (error) {
//       console.error('AI Analysis Error:', error);
//       // Fallback analysis
//       return this.generateFallbackAnalysis(issue, userActivity);
//     }
//   }

//   private generateFallbackAnalysis(issue: GitHubIssue, userActivity: UserActivityData) {
//     const daysSinceUpdate = (Date.now() - new Date(issue.updated_at).getTime()) / (1000 * 60 * 60 * 24);
//     const daysSinceCreated = (Date.now() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60 * 24);
    
//     let completionProbability = 50;
//     let risk: 'low' | 'medium' | 'high' = 'medium';
    
//     // Adjust based on user reliability
//     completionProbability += (userActivity.reliabilityScore - 50) * 0.5;
    
//     // Adjust based on activity pattern
//     if (userActivity.activityPattern === 'high') completionProbability += 20;
//     else if (userActivity.activityPattern === 'low') completionProbability -= 20;
    
//     // Adjust based on staleness
//     if (daysSinceUpdate > 14) {
//       completionProbability -= 30;
//       risk = 'high';
//     } else if (daysSinceUpdate > 7) {
//       completionProbability -= 15;
//       risk = 'medium';
//     }
    
//     completionProbability = Math.max(10, Math.min(90, completionProbability));
    
//     return {
//       completionProbability: Math.round(completionProbability),
//       estimatedDays: Math.max(1, Math.round(userActivity.avgTimeToClose * (1 + daysSinceUpdate / 30))),
//       risk,
//       reasoning: `Based on user's ${userActivity.activityPattern} activity pattern and ${daysSinceUpdate.toFixed(1)} days since last update`,
//       recommendation: risk === 'high' ? 'Consider reassigning or nudging the assignee' : 'Monitor for progress'
//     };
//   }

//   // Helper methods
//   private calculateAvgTimeToClose(prs: any[], issues: GitHubIssue[]): number {
//     const allItems = [...prs, ...issues].filter(item => item.closed_at);
//     if (allItems.length === 0) return 7; // Default
    
//     const totalDays = allItems.reduce((sum, item) => {
//       const created = new Date(item.created_at);
//       const closed = new Date(item.closed_at);
//       return sum + (closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
//     }, 0);
    
//     return Math.round(totalDays / allItems.length);
//   }

//   private calculateReliabilityScore(prs: any[], mergedPRs: any[], avgTimeToClose: number): number {
//     if (prs.length === 0) return 50;
    
//     const mergeRate = (mergedPRs.length / prs.length) * 100;
//     const timeScore = Math.max(0, 100 - avgTimeToClose * 2); // Penalty for slow completion
    
//     return Math.round((mergeRate + timeScore) / 2);
//   }

//   private determineActivityPattern(events: any[], commits: any[]): 'high' | 'medium' | 'low' {
//     const recentActivity = events.filter(event => {
//       const eventDate = new Date(event.created_at);
//       const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
//       return eventDate > weekAgo;
//     }).length;
    
//     if (recentActivity > 10) return 'high';
//     if (recentActivity > 3) return 'medium';
//     return 'low';
//   }

//   private isUserActive(lastActivity: string): boolean {
//     const daysSince = (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24);
//     return daysSince < 3;
//   }

//   // Parse owner/repo from various formats
//   parseRepoUrl(input: string): { owner: string; repo: string } | null {
//     // Handle full GitHub URLs
//     const urlMatch = input.match(/github\.com\/([^\/]+)\/([^\/]+)/);
//     if (urlMatch) {
//       return { owner: urlMatch[1], repo: urlMatch[2].replace(/\.git$/, '') };
//     }

//     // Handle owner/repo format
//     const directMatch = input.match(/^([^\/]+)\/([^\/]+)$/);
//     if (directMatch) {
//       return { owner: directMatch[1], repo: directMatch[2] };
//     }

//     return null;
//   }
// }

// export const githubAPI = new GitHubAPI();


// import dotenv from 'dotenv';
// dotenv.config();
import axios from 'axios';

const GITHUB_API_BASE = import.meta.env.VITE_GITHUB_API_BASE
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = import.meta.env.VITE_GEMINI_API_URL;

// Log token status on initialization (for debugging)
if (GITHUB_TOKEN) {
  console.log('✓ GitHub token loaded - API rate limit: 5000 req/hour');
} else {
  console.warn('⚠ No GitHub token found - API rate limit: 60 req/hour');
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  html_url: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  user: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  assignee: {
    login: string;
    avatar_url: string;
    html_url: string;
  } | null;
  assignees: Array<{
    login: string;
    avatar_url: string;
    html_url: string;
  }>;
  labels: Array<{
    name: string;
    color: string;
  }>;
  body: string | null;
  pull_request?: {
    url: string;
    html_url: string;
    merged_at: string | null;
  };
  comments: number;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  description: string;
  html_url: string;
  stargazers_count: number;
  open_issues_count: number;
  forks_count: number;
}

export interface GitHubContributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type: string;
  site_admin: boolean;
  id: number;
}

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  type: string;
  site_admin: boolean;
  name?: string;
  company?: string;
  blog?: string;
  location?: string;
  email?: string;
  bio?: string;
  twitter_username?: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface UserActivityData {
  login: string;
  avatar_url: string;
  html_url: string;
  lastActivity: string;
  totalCommits: number;
  totalPRs: number;
  mergedPRs: number;
  openIssues: number;
  closedIssues: number;
  avgTimeToClose: number;
  reliabilityScore: number;
  activityPattern: 'high' | 'medium' | 'low';
  lastSeen: string;
  isActive: boolean;
}

export interface IssueTimeline {
  event: string;
  created_at: string;
  actor?: {
    login: string;
    avatar_url: string;
  };
  assignee?: {
    login: string;
    avatar_url: string;
  };
  label?: {
    name: string;
    color: string;
  };
}

class GitHubAPI {
  private rateLimitRemaining: number = 60;
  private rateLimitReset: number = 0;

  private getHeaders() {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
    };
    
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
    }
    
    return headers;
  }

  // Check and update rate limit info from response headers
  private updateRateLimit(headers: any) {
    if (headers['x-ratelimit-remaining']) {
      this.rateLimitRemaining = parseInt(headers['x-ratelimit-remaining']);
      this.rateLimitReset = parseInt(headers['x-ratelimit-reset']);
      
      if (this.rateLimitRemaining < 10) {
        const resetTime = new Date(this.rateLimitReset * 1000);
        console.warn(`⚠ GitHub API rate limit low: ${this.rateLimitRemaining} requests remaining. Resets at ${resetTime.toLocaleTimeString()}`);
      }
    }
  }

  // Get current rate limit status
  async getRateLimitStatus() {
    try {
      const response = await axios.get(`${GITHUB_API_BASE}/rate_limit`, {
        headers: this.getHeaders(),
      })
      return response.data;
    } catch (error) {
      console.error('Failed to fetch rate limit:', error);
      return null;
    }
  }

  private async callGeminiAI(prompt: string): Promise<string> {
    try {
      const response = await axios.post(GEMINI_API_URL, {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY
        }
      });

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to get AI analysis');
    }
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    const response = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
      headers: this.getHeaders(),
    });
    this.updateRateLimit(response.headers);
    return response.data;
  }

  async getIssues(
    owner: string,
    repo: string,
    options: {
      state?: 'open' | 'closed' | 'all';
      sort?: 'created' | 'updated' | 'comments';
      direction?: 'asc' | 'desc';
      per_page?: number;
      page?: number;
      labels?: string;
      assignee?: string;
    } = {}
  ): Promise<GitHubIssue[]> {
    const params = new URLSearchParams({
      state: options.state || 'all',
      sort: options.sort || 'updated',
      direction: options.direction || 'desc',
      per_page: String(options.per_page || 30),
      page: String(options.page || 1),
      ...(options.labels && { labels: options.labels }),
      ...(options.assignee && { assignee: options.assignee }),
    });

    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues?${params}`,
      { headers: this.getHeaders() }
    );
    this.updateRateLimit(response.headers);
    return response.data;
  }

  async getIssue(owner: string, repo: string, issueNumber: number): Promise<GitHubIssue> {
    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}`,
      { headers: this.getHeaders() }
    );
    this.updateRateLimit(response.headers);
    return response.data;
  }

  async getIssueTimeline(owner: string, repo: string, issueNumber: number): Promise<IssueTimeline[]> {
    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}/timeline`,
      {
        headers: {
          ...this.getHeaders(),
          'Accept': 'application/vnd.github.mockingbird-preview+json',
          
        },
      }
    );
    this.updateRateLimit(response.headers);
    return response.data;
  }

  async getIssueComments(owner: string, repo: string, issueNumber: number): Promise<any[]> {
    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
      { headers: this.getHeaders() }
    );
    this.updateRateLimit(response.headers);
    return response.data;
  }

  async getContributors(owner: string, repo: string): Promise<GitHubContributor[]> {
    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/contributors?per_page=100`,
      { headers: this.getHeaders() }
    );
    this.updateRateLimit(response.headers);
    return response.data;
  }

  async getPullRequests(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'all') {
    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls?state=${state}&per_page=100`,
      { headers: this.getHeaders() }
    );
    this.updateRateLimit(response.headers);
    return response.data;
  }

  // Helper to check if an issue is stale (assigned but no recent activity)
  isStaleIssue(issue: GitHubIssue, daysThreshold = 7): boolean {
    if (!issue.assignee && issue.assignees.length === 0) return false;
    if (issue.state === 'closed') return false;
    if (issue.pull_request) return false;

    const lastUpdate = new Date(issue.updated_at);
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    
    return daysSinceUpdate > daysThreshold;
  }

  // Enhanced user activity tracking
  async getUserActivity(owner: string, repo: string, username: string): Promise<UserActivityData> {
    try {
      const [user, events, commits, prs] = await Promise.all([
        this.getUser(username),
        this.getUserEvents(username),
        this.getUserCommits(owner, repo, username),
        this.getUserPullRequests(owner, repo, username)
      ]);

      const mergedPRs = prs.filter(pr => pr.merged_at);
      const closedIssues = await this.getUserClosedIssues(owner, repo, username);
      const openIssues = await this.getUserOpenIssues(owner, repo, username);

      const avgTimeToClose = this.calculateAvgTimeToClose(prs, closedIssues);
      const reliabilityScore = this.calculateReliabilityScore(prs, mergedPRs, avgTimeToClose);
      const activityPattern = this.determineActivityPattern(events, commits);

      return {
        login: user.login,
        avatar_url: user.avatar_url,
        html_url: user.html_url,
        lastActivity: events[0]?.created_at || user.updated_at,
        totalCommits: commits.length,
        totalPRs: prs.length,
        mergedPRs: mergedPRs.length,
        openIssues: openIssues.length,
        closedIssues: closedIssues.length,
        avgTimeToClose,
        reliabilityScore,
        activityPattern,
        lastSeen: events[0]?.created_at || user.updated_at,
        isActive: this.isUserActive(events[0]?.created_at || user.updated_at)
      };
    } catch (error) {
      console.error('Error fetching user activity:', error);
      throw error;
    }
  }

  async getUser(username: string): Promise<GitHubUser> {
    const response = await axios.get(`${GITHUB_API_BASE}/users/${username}`, {
      headers: this.getHeaders(),
    });
    this.updateRateLimit(response.headers);
    return response.data;
  }

  async getUserEvents(username: string, perPage = 30): Promise<any[]> {
    const response = await axios.get(`${GITHUB_API_BASE}/users/${username}/events/public?per_page=${perPage}`, {
      headers: this.getHeaders(),
    });
    this.updateRateLimit(response.headers);
    return response.data;
  }

  async getUserCommits(owner: string, repo: string, username: string): Promise<any[]> {
    const response = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?author=${username}&per_page=100`, {
      headers: this.getHeaders(),
    });
    this.updateRateLimit(response.headers);
    return response.data;
  }

  async getUserPullRequests(owner: string, repo: string, username: string): Promise<any[]> {
    const response = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls?state=all&per_page=100`, {
      headers: this.getHeaders(),
    });
    this.updateRateLimit(response.headers);
    return response.data.filter(pr => pr.user.login === username);
  }

  async getUserClosedIssues(owner: string, repo: string, username: string): Promise<GitHubIssue[]> {
    const response = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/issues?state=closed&assignee=${username}&per_page=100`, {
      headers: this.getHeaders(),
    });
    this.updateRateLimit(response.headers);
    return response.data;
  }

  async getUserOpenIssues(owner: string, repo: string, username: string): Promise<GitHubIssue[]> {
    const response = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/issues?state=open&assignee=${username}&per_page=100`, {
      headers: this.getHeaders(),
    });
    this.updateRateLimit(response.headers);
    return response.data;
  }

  // AI-powered issue analysis
  async analyzeIssueWithAI(issue: GitHubIssue, userActivity: UserActivityData): Promise<{
    completionProbability: number;
    estimatedDays: number;
    risk: 'low' | 'medium' | 'high';
    reasoning: string;
    recommendation: string;
  }> {
    const prompt = `
    Analyze this GitHub issue and user activity to predict completion probability:
    
    Issue Details:
    - Title: ${issue.title}
    - Number: #${issue.number}
    - Created: ${issue.created_at}
    - Last Updated: ${issue.updated_at}
    - Assignee: ${issue.assignee?.login || 'None'}
    - Labels: ${issue.labels.map(l => l.name).join(', ')}
    - Comments: ${issue.comments}
    
    User Activity:
    - Total PRs: ${userActivity.totalPRs}
    - Merged PRs: ${userActivity.mergedPRs}
    - Reliability Score: ${userActivity.reliabilityScore}
    - Activity Pattern: ${userActivity.activityPattern}
    - Last Activity: ${userActivity.lastActivity}
    - Avg Time to Close: ${userActivity.avgTimeToClose} days
    
    Please provide:
    1. Completion probability (0-100%)
    2. Estimated days to completion
    3. Risk level (low/medium/high)
    4. Reasoning for the prediction
    5. Recommendation for maintainers
    
    Respond in JSON format with these exact keys: completionProbability, estimatedDays, risk, reasoning, recommendation
    `;

    try {
      const aiResponse = await this.callGeminiAI(prompt);
      const analysis = JSON.parse(aiResponse);
      
      return {
        completionProbability: Math.max(0, Math.min(100, analysis.completionProbability)),
        estimatedDays: Math.max(1, analysis.estimatedDays),
        risk: analysis.risk,
        reasoning: analysis.reasoning,
        recommendation: analysis.recommendation
      };
    } catch (error) {
      console.error('AI Analysis Error:', error);
      // Fallback analysis
      return this.generateFallbackAnalysis(issue, userActivity);
    }
  }

  private generateFallbackAnalysis(issue: GitHubIssue, userActivity: UserActivityData) {
    const daysSinceUpdate = (Date.now() - new Date(issue.updated_at).getTime()) / (1000 * 60 * 60 * 24);
    const daysSinceCreated = (Date.now() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60 * 24);
    
    let completionProbability = 50;
    let risk: 'low' | 'medium' | 'high' = 'medium';
    
    // Adjust based on user reliability
    completionProbability += (userActivity.reliabilityScore - 50) * 0.5;
    
    // Adjust based on activity pattern
    if (userActivity.activityPattern === 'high') completionProbability += 20;
    else if (userActivity.activityPattern === 'low') completionProbability -= 20;
    
    // Adjust based on staleness
    if (daysSinceUpdate > 14) {
      completionProbability -= 30;
      risk = 'high';
    } else if (daysSinceUpdate > 7) {
      completionProbability -= 15;
      risk = 'medium';
    }
    
    completionProbability = Math.max(10, Math.min(90, completionProbability));
    
    return {
      completionProbability: Math.round(completionProbability),
      estimatedDays: Math.max(1, Math.round(userActivity.avgTimeToClose * (1 + daysSinceUpdate / 30))),
      risk,
      reasoning: `Based on user's ${userActivity.activityPattern} activity pattern and ${daysSinceUpdate.toFixed(1)} days since last update`,
      recommendation: risk === 'high' ? 'Consider reassigning or nudging the assignee' : 'Monitor for progress'
    };
  }

  // Helper methods
  private calculateAvgTimeToClose(prs: any[], issues: GitHubIssue[]): number {
    const allItems = [...prs, ...issues].filter(item => item.closed_at);
    if (allItems.length === 0) return 7; // Default
    
    const totalDays = allItems.reduce((sum, item) => {
      const created = new Date(item.created_at);
      const closed = new Date(item.closed_at);
      return sum + (closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    }, 0);
    
    return Math.round(totalDays / allItems.length);
  }

  private calculateReliabilityScore(prs: any[], mergedPRs: any[], avgTimeToClose: number): number {
    if (prs.length === 0) return 50;
    
    const mergeRate = (mergedPRs.length / prs.length) * 100;
    const timeScore = Math.max(0, 100 - avgTimeToClose * 2); // Penalty for slow completion
    
    return Math.round((mergeRate + timeScore) / 2);
  }

  private determineActivityPattern(events: any[], commits: any[]): 'high' | 'medium' | 'low' {
    const recentActivity = events.filter(event => {
      const eventDate = new Date(event.created_at);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return eventDate > weekAgo;
    }).length;
    
    if (recentActivity > 10) return 'high';
    if (recentActivity > 3) return 'medium';
    return 'low';
  }

  private isUserActive(lastActivity: string): boolean {
    const daysSince = (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince < 3;
  }

  // Parse owner/repo from various formats
  parseRepoUrl(input: string): { owner: string; repo: string } | null {
    // Handle full GitHub URLs
    const urlMatch = input.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (urlMatch) {
      return { owner: urlMatch[1], repo: urlMatch[2].replace(/\.git$/, '') };
    }

    // Handle owner/repo format
    const directMatch = input.match(/^([^\/]+)\/([^\/]+)$/);
    if (directMatch) {
      return { owner: directMatch[1], repo: directMatch[2] };
    }

    return null;
  }
}

export const githubAPI = new GitHubAPI();