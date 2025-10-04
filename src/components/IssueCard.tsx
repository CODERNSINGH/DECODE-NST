import React from 'react';
import { GitHubIssue, UserActivityData } from '@/lib/github-api';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Clock, MessageCircle, AlertCircle, CheckCircle2, GitPullRequest, Activity, Zap, Brain, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getActivityStatus, getCompletionColor, getActivityBadgeColor } from '@/lib/issue-analytics';
import { useQuery } from '@tanstack/react-query';
import { analyzeIssue } from '@/lib/issue-analytics';
import { githubAPI } from '@/lib/github-api';
import AssigneeGraph from './AssigneeGraph';
import UserCard from './UserCard';

interface IssueCardProps {
  issue: GitHubIssue;
  repoOwner: string;
  repoName: string;
  index: number;
}

export const IssueCard = ({ issue, repoOwner, repoName, index }: IssueCardProps) => {
  const activityStatus = issue.assignee ? getActivityStatus(issue.updated_at) : null;
  
  // Fetch user activity data for AI analysis
  const { data: userActivity } = useQuery({
    queryKey: ['user-activity', repoOwner, repoName, issue.assignee?.login],
    queryFn: async () => {
      if (!issue.assignee) return null;
      return await githubAPI.getUserActivity(repoOwner, repoName, issue.assignee.login);
    },
    enabled: !!issue.assignee && issue.state === 'open',
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  // Fetch timeline to detect assignment time for the current assignee
  const { data: issueTimeline } = useQuery({
    queryKey: ['issue-timeline-mini', repoOwner, repoName, issue.number],
    queryFn: async () => {
      try {
        return await githubAPI.getIssueTimeline(repoOwner, repoName, issue.number);
      } catch (e) {
        return [];
      }
    },
    enabled: !!repoOwner && !!repoName,
    staleTime: 2 * 60 * 1000,
  });

  const assignedAt = React.useMemo(() => {
    if (!issueTimeline || !issue.assignee) return null;
    // Find the last 'assigned' event for this assignee
    for (let i = issueTimeline.length - 1; i >= 0; i--) {
      const ev = issueTimeline[i] as any;
      if (ev.event === 'assigned' && ev.assignee?.login === issue.assignee.login) {
        return ev.created_at;
      }
    }
    return null;
  }, [issueTimeline, issue.assignee]);

  const { data: analysis } = useQuery({
    queryKey: ['issue-analysis', issue.id, userActivity?.login],
    queryFn: async () => {
      if (!issue.assignee || issue.state === 'closed' || !userActivity) return null;
      return await analyzeIssue(issue, userActivity, { avgTimeToClose: userActivity.avgTimeToClose, openIssues: userActivity.openIssues });
    },
    enabled: !!issue.assignee && issue.state === 'open' && !!userActivity,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const getStatusBadge = () => {
    if (issue.pull_request) {
      return (
        <Badge className="gap-1 bg-primary/10 text-primary border-primary/20">
          <GitPullRequest className="h-3 w-3" />
          PR Linked
        </Badge>
      );
    }
    
    if (issue.state === 'closed') {
      return (
        <Badge className="gap-1 bg-success/10 text-success border-success/20">
          <CheckCircle2 className="h-3 w-3" />
          Closed
        </Badge>
      );
    }

    if (issue.assignee || issue.assignees.length > 0) {
      const daysSinceUpdate = Math.floor(
        (Date.now() - new Date(issue.updated_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceUpdate > 7 && !issue.pull_request) {
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Stale ({daysSinceUpdate}d)
          </Badge>
        );
      }
      
      return (
        <Badge className="gap-1 bg-warning/10 text-warning border-warning/20">
          <Clock className="h-3 w-3" />
          In Progress
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="gap-1">
        Open
      </Badge>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/issues/${repoOwner}/${repoName}/${issue.number}`}>
        <Card className="p-5 hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer bg-gradient-card">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                {getStatusBadge()}
                <span className="text-xs text-muted-foreground">#{issue.number}</span>
              </div>

              <h3 className="font-semibold text-lg leading-tight hover:text-primary transition-colors">
                {issue.title}
              </h3>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <UserCard username={issue.user.login} avatarUrl={issue.user.avatar_url} profileUrl={issue.user.html_url} compact />

                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
                </div>

                {issue.comments > 0 && (
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {issue.comments}
                  </div>
                )}
              </div>

              {issue.assignee && (
                <div className="space-y-2 pt-2">
                  <UserCard
                    username={issue.assignee.login}
                    owner={repoOwner}
                    repo={repoName}
                    avatarUrl={issue.assignee.avatar_url}
                    profileUrl={issue.assignee.html_url}
                    userActivity={userActivity}
                    analysis={analysis}
                    compact
                    assignedAt={assignedAt}
                  />
                </div>
              )}
            </div>
          </div>

          {issue.labels.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
              {issue.labels.slice(0, 3).map((label) => (
                <Badge
                  key={label.name}
                  variant="outline"
                  className="text-xs"
                  style={{
                    backgroundColor: `#${label.color}20`,
                    borderColor: `#${label.color}`,
                    color: `#${label.color}`,
                  }}
                >
                  {label.name}
                </Badge>
              ))}
              {issue.labels.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{issue.labels.length - 3}
                </Badge>
              )}
            </div>
          )}
        </Card>
      </Link>
    </motion.div>
  );
};
