import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Activity, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { githubAPI, UserActivityData } from '@/lib/github-api';
import AssigneeGraph from './AssigneeGraph';

interface Props {
  username: string;
  owner?: string;
  repo?: string;
  avatarUrl?: string;
  profileUrl?: string;
  userActivity?: UserActivityData | null;
  analysis?: { completionProbability?: number } | null;
  compact?: boolean;
  commentText?: string | null;
  assignedAt?: string | null;
}

export default function UserCard({ username, owner, repo, avatarUrl, profileUrl, userActivity, analysis, compact, commentText, assignedAt }: Props) {
  const { data: fetchedActivity } = useQuery({
    queryKey: ['user-activity-card', owner, repo, username],
    queryFn: async () => {
      if (!owner || !repo || !username) return null;
      try {
        return await githubAPI.getUserActivity(owner, repo, username);
      } catch (e) {
        console.warn('UserCard: failed to fetch activity', e);
        return null;
      }
    },
    enabled: !!owner && !!repo && !userActivity,
    staleTime: 10 * 60 * 1000,
  });

  const activity = userActivity || fetchedActivity;

  const successRate = activity ? activity.reliabilityScore : (analysis?.completionProbability ?? 50);

  // Detect claim-like phrases in comments
  const claimRegex = /\b(I will|I'll|I\'ll take|assign to me|assign me|I can take|I\'ll handle|I\'m taking this|I\'ll work on this|working on it|I'll do this)\b/i;
  const isClaim = commentText ? claimRegex.test(commentText) : false;

  let claimTag: { text: string; tone: 'danger' | 'success' | 'neutral' } | null = null;
  if (isClaim) {
    const score = activity ? activity.reliabilityScore : (analysis?.completionProbability ?? 50);
    if (score < 45) {
      claimTag = { text: 'Cookie-Licker (likely)', tone: 'danger' };
    } else {
      claimTag = { text: 'Claim — likely', tone: 'success' };
    }
  }

  return (
    <div className={`flex items-center gap-3 ${compact ? 'text-sm' : ''}`}>
      <a href={profileUrl || `https://github.com/${username}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={username} /> : <AvatarFallback>{username[0]}</AvatarFallback>}
        </Avatar>
      </a>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <a href={profileUrl || `https://github.com/${username}`} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-primary transition-colors">
            {username}
          </a>
          {claimTag && (
            <span className={`ml-2 text-xs font-semibold ${claimTag.tone === 'danger' ? 'text-destructive' : 'text-success'}`}>
              {claimTag.text}
            </span>
          )}
          {activity && (
            <Badge variant="outline" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              {activity.activityPattern}
            </Badge>
          )}
        </div>

        <div className="text-xs text-muted-foreground mt-1">
          {activity ? (
            <span>Reliability: <span className={`font-semibold ${activity.reliabilityScore > 70 ? 'text-success' : activity.reliabilityScore > 40 ? 'text-warning' : 'text-destructive'}`}>{activity.reliabilityScore}%</span></span>
          ) : (
            <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> No activity data</span>
          )}
        </div>

        <div className="mt-2">
          <AssigneeGraph successRate={successRate} completionProbability={analysis?.completionProbability} />
        </div>

        {commentText && (
          <div className="mt-3 p-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-white/6 text-sm">
            <div className="text-xs text-muted-foreground mb-1">Comment</div>
            <div className="whitespace-pre-wrap">{commentText}</div>
          </div>
        )}
        {/** Assigned timer */}
        {assignedAt && (
          <AssignedTimer assignedAt={assignedAt} compact={!!compact} />
        )}
      </div>
    </div>
  );
}

function AssignedTimer({ assignedAt, compact }: { assignedAt: string; compact: boolean }) {
  const [now, setNow] = React.useState(Date.now());

  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const then = new Date(assignedAt).getTime();
  const diff = Math.max(0, now - then);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  const formatted = days > 0
    ? `${days}d ${hours}h ${minutes}m ${seconds}s`
    : `${hours}h ${minutes}m ${seconds}s`;

  return (
    <div className={`mt-2 text-xs ${compact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
      Assigned: <span className="font-semibold">{formatted}</span>
    </div>
  );
}
