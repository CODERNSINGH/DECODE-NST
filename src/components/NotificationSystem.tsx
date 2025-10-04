import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Bell, AlertTriangle, CheckCircle, Clock, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { GitHubIssue, UserActivityData } from '@/lib/github-api';

interface NotificationSystemProps {
  staleIssues: GitHubIssue[];
  contributors: UserActivityData[];
  repoOwner: string;
  repoName: string;
}

interface Notification {
  id: string;
  type: 'stale' | 'activity' | 'completion' | 'risk';
  title: string;
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
  action?: string;
  actionUrl?: string;
}

export const NotificationSystem = ({ 
  staleIssues, 
  contributors, 
  repoOwner, 
  repoName 
}: NotificationSystemProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    generateNotifications();
  }, [staleIssues, contributors]);

  const generateNotifications = () => {
    const newNotifications: Notification[] = [];

    // Stale issue notifications
    staleIssues.forEach(issue => {
      const daysSinceUpdate = Math.floor(
        (Date.now() - new Date(issue.updated_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceUpdate > 14) {
        newNotifications.push({
          id: `stale-${issue.id}`,
          type: 'stale',
          title: 'Critical: Issue Stale for 14+ Days',
          message: `Issue #${issue.number} "${issue.title}" has been stale for ${daysSinceUpdate} days`,
          timestamp: new Date(),
          severity: 'high',
          action: 'View Issue',
          actionUrl: `/issues/${repoOwner}/${repoName}/${issue.number}`
        });
      } else if (daysSinceUpdate > 7) {
        newNotifications.push({
          id: `stale-${issue.id}`,
          type: 'stale',
          title: 'Warning: Issue Stale for 7+ Days',
          message: `Issue #${issue.number} "${issue.title}" has been stale for ${daysSinceUpdate} days`,
          timestamp: new Date(),
          severity: 'medium',
          action: 'View Issue',
          actionUrl: `/issues/${repoOwner}/${repoName}/${issue.number}`
        });
      }
    });

    // Low activity contributor notifications
    contributors.forEach(contributor => {
      if (contributor.activityPattern === 'low' && contributor.openIssues > 0) {
        newNotifications.push({
          id: `activity-${contributor.login}`,
          type: 'activity',
          title: 'Low Activity Contributor',
          message: `${contributor.login} has low activity but ${contributor.openIssues} open issues`,
          timestamp: new Date(),
          severity: 'medium',
          action: 'View Profile',
          actionUrl: contributor.html_url
        });
      }
    });

    // High reliability contributors
    const topContributors = contributors
      .filter(c => c.reliabilityScore > 80)
      .slice(0, 3);

    topContributors.forEach(contributor => {
      newNotifications.push({
        id: `reliable-${contributor.login}`,
        type: 'completion',
        title: 'Highly Reliable Contributor',
        message: `${contributor.login} has ${contributor.reliabilityScore}% reliability score`,
        timestamp: new Date(),
        severity: 'low',
        action: 'View Profile',
        actionUrl: contributor.html_url
      });
    });

    setNotifications(newNotifications);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'stale': return <AlertTriangle className="h-4 w-4" />;
      case 'activity': return <Users className="h-4 w-4" />;
      case 'completion': return <CheckCircle className="h-4 w-4" />;
      case 'risk': return <Zap className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-destructive border-destructive/20 bg-destructive/5';
      case 'medium': return 'text-warning border-warning/20 bg-warning/5';
      case 'low': return 'text-success border-success/20 bg-success/5';
      default: return 'text-muted-foreground border-muted/20 bg-muted/5';
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const dismissAll = () => {
    setNotifications([]);
  };

  const highPriorityCount = notifications.filter(n => n.severity === 'high').length;
  const mediumPriorityCount = notifications.filter(n => n.severity === 'medium').length;

  if (notifications.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Smart Notifications</h3>
            <Badge variant="outline" className="text-xs">
              {notifications.length} alerts
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {highPriorityCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {highPriorityCount} critical
              </Badge>
            )}
            {mediumPriorityCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {mediumPriorityCount} warnings
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissAll}
            >
              Dismiss All
            </Button>
          </div>
        </div>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            {notifications
              .sort((a, b) => {
                const severityOrder = { high: 3, medium: 2, low: 1 };
                return severityOrder[b.severity] - severityOrder[a.severity];
              })
              .map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-3 rounded-lg border ${getSeverityColor(notification.severity)}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-3 w-3" />
                          <span className="text-xs text-muted-foreground">
                            {notification.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {notification.action && notification.actionUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            if (notification.actionUrl?.startsWith('/')) {
                              window.location.href = notification.actionUrl;
                            } else {
                              window.open(notification.actionUrl, '_blank');
                            }
                          }}
                        >
                          {notification.action}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissNotification(notification.id)}
                        className="text-xs"
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
          </motion.div>
        )}

        {!isExpanded && (
          <div className="text-sm text-muted-foreground">
            {highPriorityCount > 0 && (
              <span className="text-destructive font-medium">
                {highPriorityCount} critical issue{highPriorityCount > 1 ? 's' : ''} need attention
              </span>
            )}
            {highPriorityCount > 0 && mediumPriorityCount > 0 && ' • '}
            {mediumPriorityCount > 0 && (
              <span className="text-warning font-medium">
                {mediumPriorityCount} warning{mediumPriorityCount > 1 ? 's' : ''}
              </span>
            )}
            {highPriorityCount === 0 && mediumPriorityCount === 0 && (
              <span>All systems healthy! 🎉</span>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
};
