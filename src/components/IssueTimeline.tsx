import { GitHubIssue } from '@/lib/github-api';
import { Card } from './ui/card';
import { Clock, UserPlus, GitPullRequest, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface IssueTimelineProps {
  issue: GitHubIssue;
}

export const IssueTimeline = ({ issue }: IssueTimelineProps) => {
  const events = [];

  // Issue created
  events.push({
    icon: Clock,
    label: 'Issue opened',
    date: new Date(issue.created_at),
    user: issue.user.login
  });

  // Assigned
  if (issue.assignee) {
    events.push({
      icon: UserPlus,
      label: `Assigned to ${issue.assignee.login}`,
      date: new Date(issue.updated_at), // Approximation
      user: issue.assignee.login
    });
  }

  // PR linked
  if (issue.pull_request) {
    events.push({
      icon: GitPullRequest,
      label: 'PR linked',
      date: new Date(issue.updated_at),
      user: issue.assignee?.login || 'unknown'
    });
  }

  // Closed
  if (issue.state === 'closed' && issue.closed_at) {
    events.push({
      icon: CheckCircle2,
      label: 'Issue closed',
      date: new Date(issue.closed_at),
      user: 'system'
    });
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Timeline</h3>
      <div className="space-y-4">
        {events.map((event, index) => {
          const Icon = event.icon;
          const isLast = index === events.length - 1;
          
          return (
            <div key={index} className="flex gap-3 relative">
              {!isLast && (
                <div className="absolute left-4 top-8 w-0.5 h-full bg-border" />
              )}
              <div className={`h-8 w-8 rounded-full flex items-center justify-center z-10 ${
                event.icon === CheckCircle2 ? 'bg-success/20 text-success' :
                event.icon === GitPullRequest ? 'bg-primary/20 text-primary' :
                event.icon === UserPlus ? 'bg-warning/20 text-warning' :
                'bg-muted text-muted-foreground'
              }`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 pt-1">
                <p className="font-medium">{event.label}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(event.date, { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
