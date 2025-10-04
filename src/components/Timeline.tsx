import { IssueTimeline } from '@/lib/github-api';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import {
  CircleDot,
  UserPlus,
  GitPullRequest,
  GitMerge,
  Tag,
  MessageSquare,
  XCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface TimelineProps {
  events: IssueTimeline[];
}

export const Timeline = ({ events }: TimelineProps) => {
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'assigned':
        return <UserPlus className="h-4 w-4" />;
      case 'cross-referenced':
      case 'referenced':
        return <GitPullRequest className="h-4 w-4" />;
      case 'merged':
        return <GitMerge className="h-4 w-4" />;
      case 'labeled':
        return <Tag className="h-4 w-4" />;
      case 'commented':
        return <MessageSquare className="h-4 w-4" />;
      case 'closed':
        return <XCircle className="h-4 w-4" />;
      case 'reopened':
        return <CircleDot className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'assigned':
        return 'bg-primary';
      case 'cross-referenced':
      case 'referenced':
        return 'bg-primary';
      case 'merged':
        return 'bg-success';
      case 'labeled':
        return 'bg-warning';
      case 'closed':
        return 'bg-success';
      case 'reopened':
        return 'bg-warning';
      default:
        return 'bg-muted-foreground';
    }
  };

  const formatEventDescription = (event: IssueTimeline) => {
    switch (event.event) {
      case 'assigned':
        return `Assigned to ${event.assignee?.login || 'someone'}`;
      case 'cross-referenced':
        return 'Referenced in pull request';
      case 'referenced':
        return 'Referenced in commit';
      case 'merged':
        return 'Pull request merged';
      case 'labeled':
        return `Labeled with "${event.label?.name}"`;
      case 'commented':
        return 'Commented';
      case 'closed':
        return 'Issue closed';
      case 'reopened':
        return 'Issue reopened';
      default:
        return event.event;
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-6">Timeline</h2>

      <div className="relative pl-8 space-y-6">
        {/* Vertical line */}
        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />

        {events.map((event, index) => (
          <motion.div
            key={`${event.event}-${event.created_at}-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            {/* Event dot */}
            <div className={`absolute -left-[1.875rem] top-1 p-2 rounded-full ${getEventColor(event.event)} text-white shadow-md`}>
              {getEventIcon(event.event)}
            </div>

            <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{formatEventDescription(event)}</span>
                    {event.label && (
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          backgroundColor: `#${event.label.color}20`,
                          borderColor: `#${event.label.color}`,
                          color: `#${event.label.color}`,
                        }}
                      >
                        {event.label.name}
                      </Badge>
                    )}
                  </div>

                  {event.actor && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={event.actor.avatar_url} alt={event.actor.login} />
                        <AvatarFallback>{event.actor.login[0]}</AvatarFallback>
                      </Avatar>
                      <span>{event.actor.login}</span>
                    </div>
                  )}
                </div>

                <time className="text-xs text-muted-foreground whitespace-nowrap">
                  {/* {format(new Date(event.created_at), 'MMM d, yyyy HH:mm')} */}
                  {event.created_at}
                </time>

              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No timeline events available</p>
        </div>
      )}
    </div>
  );
};
