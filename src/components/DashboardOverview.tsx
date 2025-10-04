import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  Activity, 
  AlertTriangle, 
  Clock, 
  GitPullRequest, 
  Users, 
  TrendingUp, 
  RefreshCw,
  Zap,
  Brain,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { githubAPI, GitHubIssue, UserActivityData } from '@/lib/github-api';
import { formatDistanceToNow } from 'date-fns';

interface DashboardOverviewProps {
  repoOwner: string;
  repoName: string;
}

interface DashboardStats {
  totalIssues: number;
  openIssues: number;
  staleIssues: number;
  assignedIssues: number;
  avgTimeToClose: number;
  topContributors: UserActivityData[];
  recentActivity: any[];
  aiInsights: {
    highRiskIssues: number;
    predictedCompletions: number;
    recommendedActions: string[];
  };
}

export const DashboardOverview = ({ repoOwner, repoName }: DashboardOverviewProps) => {
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const { data: issues, isLoading: issuesLoading } = useQuery({
    queryKey: ['dashboard-issues', repoOwner, repoName],
    queryFn: async () => {
      return await githubAPI.getIssues(repoOwner, repoName, { state: 'all', per_page: 100 });
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const { data: contributors } = useQuery({
    queryKey: ['dashboard-contributors', repoOwner, repoName],
    queryFn: async () => {
      return await githubAPI.getContributors(repoOwner, repoName);
    },
    staleTime: 10 * 60 * 1000,
  });

  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', repoOwner, repoName, issues],
    queryFn: async (): Promise<DashboardStats> => {
      if (!issues || !contributors) return {} as DashboardStats;

      const openIssues = issues.filter(issue => issue.state === 'open');
      const staleIssues = openIssues.filter(issue => githubAPI.isStaleIssue(issue));
      const assignedIssues = openIssues.filter(issue => issue.assignee || issue.assignees.length > 0);

      // Get top contributors with activity data
      const topContributors = await Promise.all(
        contributors.slice(0, 5).map(async (contributor) => {
          try {
            return await githubAPI.getUserActivity(repoOwner, repoName, contributor.login);
          } catch {
            return null;
          }
        })
      );

      const validContributors = topContributors.filter(Boolean) as UserActivityData[];

      // Calculate average time to close
      const closedIssues = issues.filter(issue => issue.state === 'closed');
      const avgTimeToClose = closedIssues.length > 0 
        ? closedIssues.reduce((sum, issue) => {
            const created = new Date(issue.created_at);
            const closed = new Date(issue.closed_at!);
            return sum + (closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
          }, 0) / closedIssues.length
        : 0;

      // AI insights
      const highRiskIssues = staleIssues.length;
      const predictedCompletions = assignedIssues.filter(issue => {
        const daysSinceUpdate = (Date.now() - new Date(issue.updated_at).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceUpdate < 3;
      }).length;

      const recommendedActions = [
        highRiskIssues > 5 ? 'Consider reassigning stale issues' : null,
        predictedCompletions < assignedIssues.length * 0.3 ? 'Low completion rate detected' : null,
        avgTimeToClose > 14 ? 'Average completion time is high' : null,
      ].filter(Boolean) as string[];

      return {
        totalIssues: issues.length,
        openIssues: openIssues.length,
        staleIssues: staleIssues.length,
        assignedIssues: assignedIssues.length,
        avgTimeToClose: Math.round(avgTimeToClose),
        topContributors: validContributors,
        recentActivity: issues.slice(0, 5),
        aiInsights: {
          highRiskIssues,
          predictedCompletions,
          recommendedActions,
        },
      };
    },
    enabled: !!issues && !!contributors,
  });

  const handleRefresh = () => {
    setLastRefresh(new Date());
    // Trigger refetch of all queries
    window.location.reload();
  };

  if (statsLoading || issuesLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!dashboardStats) return null;

  const stalePercentage = dashboardStats.openIssues > 0 
    ? (dashboardStats.staleIssues / dashboardStats.openIssues) * 100 
    : 0;

  const completionRate = dashboardStats.assignedIssues > 0 
    ? (dashboardStats.aiInsights.predictedCompletions / dashboardStats.assignedIssues) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Real-time insights for {repoOwner}/{repoName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Last updated: {formatDistanceToNow(lastRefresh, { addSuffix: true })}
          </span>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <GitPullRequest className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Issues</p>
                <p className="text-2xl font-bold">{dashboardStats.totalIssues}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stale Issues</p>
                <p className="text-2xl font-bold text-warning">{dashboardStats.staleIssues}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <Users className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Assigned</p>
                <p className="text-2xl font-bold">{dashboardStats.assignedIssues}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Clock className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Time</p>
                <p className="text-2xl font-bold">{dashboardStats.avgTimeToClose}d</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Progress Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <h3 className="font-semibold">Stale Issue Rate</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Stale Issues</span>
                  <span>{stalePercentage.toFixed(1)}%</span>
                </div>
                <Progress value={stalePercentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {dashboardStats.staleIssues} out of {dashboardStats.openIssues} open issues
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-success" />
                <h3 className="font-semibold">Completion Rate</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Active Issues</span>
                  <span>{completionRate.toFixed(1)}%</span>
                </div>
                <Progress value={completionRate} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {dashboardStats.aiInsights.predictedCompletions} out of {dashboardStats.assignedIssues} assigned issues
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">AI Insights & Recommendations</h3>
            </div>
            
            {dashboardStats.aiInsights.recommendedActions.length > 0 ? (
              <div className="space-y-2">
                {dashboardStats.aiInsights.recommendedActions.map((action, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-warning/5 rounded-lg border border-warning/20">
                    <Zap className="h-4 w-4 text-warning" />
                    <span className="text-sm">{action}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-success/5 rounded-lg border border-success/20">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm">Repository health looks good! No immediate actions needed.</span>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Top Contributors */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Top Contributors</h3>
            </div>
            
            <div className="space-y-3">
              {dashboardStats.topContributors.map((contributor, index) => (
                <div key={contributor.login} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                      <img 
                        src={contributor.avatar_url} 
                        alt={contributor.login}
                        className="h-8 w-8 rounded-full"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{contributor.login}</p>
                      <p className="text-sm text-muted-foreground">
                        {contributor.totalPRs} PRs • {contributor.mergedPRs} merged
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={contributor.activityPattern === 'high' ? 'border-success text-success' : 
                                contributor.activityPattern === 'medium' ? 'border-warning text-warning' : 
                                'border-muted text-muted'}
                    >
                      {contributor.activityPattern}
                    </Badge>
                    <span className="text-sm font-medium">
                      {contributor.reliabilityScore}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
