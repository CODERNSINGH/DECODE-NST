import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { githubAPI } from '@/lib/github-api';
import { Timeline } from '@/components/Timeline';
import { IssueTimeline } from '@/components/IssueTimeline';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  ExternalLink,
  Clock,
  GitPullRequest,
  CheckCircle2,
  AlertCircle,
  User,
  Calendar,
  MessageSquare,
  Loader2,
  Activity,
  Zap,
  Brain,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { analyzeIssue, getActivityStatus } from '@/lib/issue-analytics';

export default function IssueDetail() {
  const { owner, repo, number } = useParams();

  const { data: issue, isLoading: issueLoading } = useQuery({
    queryKey: ['issue', owner, repo, number],
    queryFn: async () => {
      if (!owner || !repo || !number) throw new Error('Invalid params');
      return await githubAPI.getIssue(owner, repo, parseInt(number));
    },
    enabled: !!owner && !!repo && !!number,
  });

  const { data: timeline, isLoading: timelineLoading } = useQuery({
    queryKey: ['issue-timeline', owner, repo, number],
    queryFn: async () => {
      if (!owner || !repo || !number) throw new Error('Invalid params');
      return await githubAPI.getIssueTimeline(owner, repo, parseInt(number));
    },
    enabled: !!owner && !!repo && !!number,
  });

  const { data: analysis } = useQuery({
    queryKey: ['issue-analysis-detail', issue?.id],
    queryFn: async () => {
      if (!issue?.assignee || issue.state === 'closed') return null;
      return await analyzeIssue(issue, { contributions: 0 }, { avgTimeToClose: 7, openIssues: 10 });
    },
    enabled: !!issue?.assignee && issue?.state === 'open',
    staleTime: 5 * 60 * 1000,
  });

  const activityStatus = issue?.assignee ? getActivityStatus(issue.updated_at) : null;

  if (issueLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Issue Not Found</h2>
          <p className="text-muted-foreground mb-6">The issue you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/issues">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Issues
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const isStale = githubAPI.isStaleIssue(issue);
  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(issue.updated_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" asChild className="mb-6">
          <Link to={`/issues?repo=${owner}/${repo}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Issues
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <h1 className="text-3xl font-bold flex-1">{issue.title}</h1>
                <Badge variant={issue.state === 'open' ? 'default' : 'secondary'}>
                  {issue.state}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="font-mono">#{issue.number}</span>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Opened {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Updated {formatDistanceToNow(new Date(issue.updated_at), { addSuffix: true })}
                </div>
              </div>
            </div>

            {/* AI Insights */}
            {(isStale || analysis) && (
              <Card className={`p-6 ${isStale ? 'bg-destructive/5 border-destructive/20' : 'bg-primary/5 border-primary/20'}`}>
                <div className="flex gap-4">
                  <Brain className={`h-6 w-6 flex-shrink-0 mt-1 ${isStale ? 'text-destructive' : 'text-primary'}`} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                      {isStale ? '⚠️ Stale Issue Detected' : '🧠 AI Analysis'}
                    </h3>
                    
                    {isStale && (
                      <p className="text-muted-foreground mb-4">
                        This issue has been assigned to{' '}
                        <span className="font-semibold">{issue.assignee?.login}</span> but shows no
                        recent activity ({daysSinceUpdate} days since last update).
                        {!issue.pull_request && ' No pull request has been linked yet.'}
                      </p>
                    )}

                    {analysis && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <Zap className={`h-4 w-4 ${
                              analysis.completionProbability > 70 ? 'text-success' :
                              analysis.completionProbability > 40 ? 'text-warning' :
                              'text-destructive'
                            }`} />
                            <span className="text-sm">
                              Completion: <span className="font-semibold">{analysis.completionProbability}%</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              ETA: <span className="font-semibold">{analysis.estimatedDays} days</span>
                            </span>
                          </div>
                        </div>
                        
                        <div className="pt-2 border-t">
                          <p className="text-sm text-muted-foreground mb-2">
                            <span className="font-semibold">Analysis:</span> {analysis.reasoning}
                          </p>
                          <p className="text-sm">
                            <span className="font-semibold">Recommendation:</span> {analysis.recommendation}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Description */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Avatar>
                  <AvatarImage src={issue.user.avatar_url} alt={issue.user.login} />
                  <AvatarFallback>{issue.user.login[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <a
                    href={issue.user.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold hover:text-primary transition-colors"
                  >
                    {issue.user.login}
                  </a>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(issue.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>

              {issue.body ? (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="whitespace-pre-wrap text-muted-foreground">{issue.body}</p>
                </div>
              ) : (
                <p className="text-muted-foreground italic">No description provided</p>
              )}
            </Card>

            {/* Timeline */}
            <IssueTimeline issue={issue} />
            
            {timelineLoading ? (
              <Card className="p-6">
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              </Card>
            ) : timeline && timeline.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Detailed Activity</h3>
                <Timeline events={timeline} />
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold">Quick Actions</h3>
              <Button className="w-full gap-2" asChild>
                <a href={issue.html_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  View on GitHub
                </a>
              </Button>
            </Card>

            {/* Details */}
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold">Details</h3>

              {/* Assignee */}
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <User className="h-4 w-4" />
                  <span>Assignee</span>
                </div>
                {issue.assignee ? (
                  <div className="space-y-2">
                    <a
                      href={issue.assignee.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:text-primary transition-colors"
                    >
                      <Avatar className="h-6 w-6 relative">
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
                      <div className="flex-1">
                        <span className="text-sm font-medium block">{issue.assignee.login}</span>
                        {activityStatus && (
                          <span className="text-xs text-muted-foreground">
                            {activityStatus === 'active' ? '🟢 Active' :
                             activityStatus === 'away' ? '🟡 Away' :
                             '⚫ Offline'}
                          </span>
                        )}
                      </div>
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No one assigned</p>
                )}
              </div>

              <Separator />

              {/* PR Status */}
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <GitPullRequest className="h-4 w-4" />
                  <span>Pull Request</span>
                </div>
                {issue.pull_request ? (
                  <a
                    href={issue.pull_request.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                  >
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    PR Linked
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">No PR linked</p>
                )}
              </div>

              <Separator />

              {/* Comments */}
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Comments</span>
                </div>
                <p className="text-sm font-medium">{issue.comments} comments</p>
              </div>

              {/* Labels */}
              {issue.labels.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Labels</div>
                    <div className="flex flex-wrap gap-2">
                      {issue.labels.map((label) => (
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
                    </div>
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
