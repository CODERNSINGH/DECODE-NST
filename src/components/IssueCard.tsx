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
                <div className="flex items-center gap-1.5">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={issue.user.avatar_url} alt={issue.user.login} />
                    <AvatarFallback>{issue.user.login[0]}</AvatarFallback>
                  </Avatar>
                  <span>{issue.user.login}</span>
                </div>
                
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
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Assigned to:</span>
                    <div className="flex items-center gap-1.5">
                      <Avatar className="h-5 w-5 relative">
                        <AvatarImage src={issue.assignee.avatar_url} alt={issue.assignee.login} />
                        <AvatarFallback>{issue.assignee.login[0]}</AvatarFallback>
                        {activityStatus && (
                          <span 
                            className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background ${
                              activityStatus === 'active' ? 'bg-success' :
                              activityStatus === 'away' ? 'bg-warning' :
                              'bg-muted-foreground'
                            }`}
                          />
                        )}
                      </Avatar>
                      <span className="text-sm font-medium">{issue.assignee.login}</span>
                      <Badge variant="outline" className="text-xs">
                        {activityStatus === 'active' ? '🟢 Active' :
                         activityStatus === 'away' ? '🟡 Away' :
                         '⚫ Offline'}
                      </Badge>
                    </div>
                  </div>
                  
                  {userActivity && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getActivityBadgeColor(userActivity.activityPattern)}`}
                        >
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {userActivity.activityPattern} activity
                        </Badge>
                        <span className="text-muted-foreground">
                          Reliability: <span className={`font-semibold ${
                            userActivity.reliabilityScore > 70 ? 'text-success' :
                            userActivity.reliabilityScore > 40 ? 'text-warning' :
                            'text-destructive'
                          }`}>{userActivity.reliabilityScore}%</span>
                        </span>
                      </div>
                      
                      {analysis && (
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1">
                            <Brain className="h-3 w-3 text-primary" />
                            <span className="text-muted-foreground">
                              AI Prediction: <span className={`font-semibold ${getCompletionColor(analysis.completionProbability)}`}>
                                {analysis.completionProbability}%
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span className="text-muted-foreground">
                              ETA: {analysis.estimatedDays}d
                            </span>
                          </div>
                          <Badge 
                            variant={analysis.risk === 'low' ? 'outline' : 'secondary'}
                            className={`text-xs ${
                              analysis.risk === 'high' ? 'border-destructive text-destructive' :
                              analysis.risk === 'medium' ? 'border-warning text-warning' :
                              'border-success text-success'
                            }`}
                          >
                            {analysis.risk === 'high' ? '⚠️' : analysis.risk === 'medium' ? '⚡' : '✓'} {analysis.risk} risk
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
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
