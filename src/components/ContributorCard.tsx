import { UserActivityData } from '@/lib/github-api';
import { Card } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { GitCommit, Award, ExternalLink, TrendingUp, Clock, Activity, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { getActivityBadgeColor } from '@/lib/issue-analytics';

interface ContributorCardProps {
  contributor: UserActivityData;
  repoOwner: string;
  repoName: string;
  index: number;
}

export const ContributorCard = ({ contributor, repoOwner, repoName, index }: ContributorCardProps) => {
  const getBadge = () => {
    if (contributor.reliabilityScore > 80) {
      return (
        <Badge className="gap-1 bg-success/10 text-success border-success/20">
          <Award className="h-3 w-3" />
          Highly Reliable
        </Badge>
      );
    }
    if (contributor.activityPattern === 'high') {
      return (
        <Badge className="gap-1 bg-primary/10 text-primary border-primary/20">
          <TrendingUp className="h-3 w-3" />
          Very Active
        </Badge>
      );
    }
    if (contributor.activityPattern === 'low') {
      return (
        <Badge className="gap-1 bg-destructive/10 text-destructive border-destructive/20">
          <Clock className="h-3 w-3" />
          Low Activity
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        <Activity className="h-3 w-3 mr-1" />
        Moderate
      </Badge>
    );
  };

  const getActivityStatus = () => {
    if (contributor.isActive) {
      return (
        <div className="flex items-center gap-1 text-success">
          <div className="h-2 w-2 bg-success rounded-full animate-pulse" />
          <span className="text-xs">Active</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <div className="h-2 w-2 bg-muted-foreground rounded-full" />
        <span className="text-xs">Offline</span>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/50 bg-gradient-card">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarImage src={contributor.avatar_url} alt={contributor.login} />
                <AvatarFallback>{contributor.login[0]}</AvatarFallback>
              </Avatar>
              {getActivityStatus()}
            </div>
            
            <div className="flex-1 min-w-0">
              <a
                href={contributor.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-lg hover:text-primary transition-colors inline-flex items-center gap-1"
              >
                {contributor.login}
                <ExternalLink className="h-3 w-3" />
              </a>
              <div className="mt-1">
                {getBadge()}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <GitCommit className="h-3 w-3" />
                <span>PRs</span>
              </div>
              <div className="font-semibold">
                {contributor.totalPRs} ({contributor.mergedPRs} merged)
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Zap className="h-3 w-3" />
                <span>Reliability</span>
              </div>
              <div className={`font-semibold ${
                contributor.reliabilityScore > 70 ? 'text-success' :
                contributor.reliabilityScore > 40 ? 'text-warning' :
                'text-destructive'
              }`}>
                {contributor.reliabilityScore}%
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Avg. Time</span>
              </div>
              <div className="font-semibold">
                {contributor.avgTimeToClose}d
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Activity className="h-3 w-3" />
                <span>Issues</span>
              </div>
              <div className="font-semibold">
                {contributor.openIssues} open
              </div>
            </div>
          </div>

          {/* Activity Pattern */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Activity Pattern</span>
              <Badge 
                variant="outline" 
                className={`text-xs ${getActivityBadgeColor(contributor.activityPattern)}`}
              >
                {contributor.activityPattern}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Last seen: {formatDistanceToNow(new Date(contributor.lastSeen), { addSuffix: true })}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
