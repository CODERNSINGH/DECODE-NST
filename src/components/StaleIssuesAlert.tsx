import { GitHubIssue } from '@/lib/github-api';
import { Card } from './ui/card';
import { AlertCircle, Clock } from 'lucide-react';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface StaleIssuesAlertProps {
  issues: GitHubIssue[];
  repoOwner: string;
  repoName: string;
}

export const StaleIssuesAlert = ({ issues, repoOwner, repoName }: StaleIssuesAlertProps) => {
  if (issues.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <Card className="p-6 border-destructive/50 bg-destructive/5">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-destructive mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              🍪 Cookie-Licking Detected
              <Badge variant="destructive">{issues.length} Stale Issues</Badge>
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              These issues have been assigned but show no progress. Consider nudging assignees or releasing claims.
            </p>
            
            <div className="space-y-3">
              {issues.slice(0, 5).map((issue) => {
                const daysSinceUpdate = Math.floor(
                  (Date.now() - new Date(issue.updated_at).getTime()) / (1000 * 60 * 60 * 24)
                );
                
                return (
                  <Link
                    key={issue.id}
                    to={`/issues/${repoOwner}/${repoName}/${issue.number}`}
                    className="block"
                  >
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background hover:bg-accent transition-colors">
                      {issue.assignee && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={issue.assignee.avatar_url} alt={issue.assignee.login} />
                          <AvatarFallback>{issue.assignee.login[0]}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">#{issue.number} {issue.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Assigned to {issue.assignee?.login} • No activity for {daysSinceUpdate} days
                        </p>
                      </div>
                      <Badge variant="destructive">{daysSinceUpdate}d stale</Badge>
                    </div>
                  </Link>
                );
              })}
              
              {issues.length > 5 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  + {issues.length - 5} more stale issues
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
