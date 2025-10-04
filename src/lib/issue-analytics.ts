import { GitHubIssue, UserActivityData } from './github-api';
import { githubAPI } from './github-api';

export interface IssueAnalysis {
  completionProbability: number;
  estimatedDays: number;
  isUserActive: boolean;
  risk: 'low' | 'medium' | 'high';
  reasoning: string;
  recommendation: string;
}

export async function analyzeIssue(
  issue: GitHubIssue,
  assigneeActivity: UserActivityData | null,
  repoStats: any
): Promise<IssueAnalysis> {
  try {
    if (!issue.assignee || !assigneeActivity) {
      return {
        completionProbability: 0,
        estimatedDays: 0,
        isUserActive: false,
        risk: 'high',
        reasoning: 'No assignee or activity data available',
        recommendation: 'Assign to an active contributor'
      };
    }

    // Use the enhanced AI analysis from GitHub API
    const aiAnalysis = await githubAPI.analyzeIssueWithAI(issue, assigneeActivity);
    
    return {
      completionProbability: aiAnalysis.completionProbability,
      estimatedDays: aiAnalysis.estimatedDays,
      isUserActive: assigneeActivity.isActive,
      risk: aiAnalysis.risk,
      reasoning: aiAnalysis.reasoning,
      recommendation: aiAnalysis.recommendation
    };
  } catch (error) {
    console.error('Error analyzing issue:', error);
    // Return fallback analysis
    return {
      completionProbability: 50,
      estimatedDays: 7,
      isUserActive: false,
      risk: 'medium',
      reasoning: 'Unable to analyze - using default estimates',
      recommendation: 'Monitor this issue for activity'
    };
  }
}

export function getActivityStatus(lastUpdate: string): 'active' | 'away' | 'offline' {
  const daysSince = (Date.now() - new Date(lastUpdate).getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysSince < 1) return 'active';
  if (daysSince < 7) return 'away';
  return 'offline';
}

export function getRiskColor(risk: 'low' | 'medium' | 'high'): string {
  switch (risk) {
    case 'low': return 'text-success';
    case 'medium': return 'text-warning';
    case 'high': return 'text-destructive';
  }
}

export function getCompletionColor(probability: number): string {
  if (probability >= 70) return 'text-success';
  if (probability >= 40) return 'text-warning';
  return 'text-destructive';
}

export function getActivityBadgeColor(activity: 'high' | 'medium' | 'low'): string {
  switch (activity) {
    case 'high': return 'bg-success/10 text-success border-success/20';
    case 'medium': return 'bg-warning/10 text-warning border-warning/20';
    case 'low': return 'bg-destructive/10 text-destructive border-destructive/20';
  }
}
