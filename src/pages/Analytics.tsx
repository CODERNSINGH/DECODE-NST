import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { githubAPI } from '@/lib/github-api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  GitPullRequest,
  Clock,
  AlertCircle,
  CheckCircle2,
  Users,
  Loader2,
  BarChart3,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Analytics() {
  const [searchParams] = useSearchParams();
  const repoParam = searchParams.get('repo');

  const parseRepo = (repo: string | null) => {
    if (!repo) return null;
    const [owner, name] = repo.split('/');
    return owner && name ? { owner, name } : null;
  };

  const repo = parseRepo(repoParam);

  const { data: issues, isLoading: issuesLoading } = useQuery({
    queryKey: ['issues', repo?.owner, repo?.name],
    queryFn: async () => {
      if (!repo) return [];
      return await githubAPI.getIssues(repo.owner, repo.name, { state: 'all', per_page: 100 });
    },
    enabled: !!repo,
  });

  const { data: repoData } = useQuery({
    queryKey: ['repository', repo?.owner, repo?.name],
    queryFn: async () => {
      if (!repo) return null;
      return await githubAPI.getRepository(repo.owner, repo.name);
    },
    enabled: !!repo,
  });

  const { data: contributors } = useQuery({
    queryKey: ['contributors', repo?.owner, repo?.name],
    queryFn: async () => {
      if (!repo) return [];
      return await githubAPI.getContributors(repo.owner, repo.name);
    },
    enabled: !!repo,
  });

  if (!repo) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">No Repository Selected</h2>
          <p className="text-muted-foreground">Please search for a repository from the home page</p>
          <Button onClick={() => (window.location.href = '/')}>Go to Home</Button>
        </div>
      </div>
    );
  }

  if (issuesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const openIssues = issues?.filter((i) => i.state === 'open') || [];
  const closedIssues = issues?.filter((i) => i.state === 'closed') || [];
  const staleIssues = issues?.filter((i) => githubAPI.isStaleIssue(i)) || [];
  const issuesWithPR = issues?.filter((i) => i.pull_request) || [];

  const avgTimeToClose = closedIssues.reduce((acc, issue) => {
    if (!issue.closed_at) return acc;
    const days =
      (new Date(issue.closed_at).getTime() - new Date(issue.created_at).getTime()) /
      (1000 * 60 * 60 * 24);
    return acc + days;
  }, 0) / (closedIssues.length || 1);

  const stats = [
    {
      title: 'Total Issues',
      value: issues?.length || 0,
      icon: BarChart3,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Open Issues',
      value: openIssues.length,
      icon: AlertCircle,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Closed Issues',
      value: closedIssues.length,
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Stale Issues',
      value: staleIssues.length,
      icon: Clock,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      title: 'Linked PRs',
      value: issuesWithPR.length,
      icon: GitPullRequest,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Contributors',
      value: contributors?.length || 0,
      icon: Users,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {repoData && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4">
            <BarChart3 className="h-12 w-12 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
              <p className="text-muted-foreground">{repoData.full_name}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-all duration-300 bg-gradient-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Additional Metrics */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              Issue Resolution
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Closure Rate</span>
                  <span className="font-semibold">
                    {issues?.length ? Math.round((closedIssues.length / issues.length) * 100) : 0}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success transition-all duration-500"
                    style={{
                      width: `${issues?.length ? (closedIssues.length / issues.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Avg. Time to Close</span>
                  <span className="font-semibold">{Math.round(avgTimeToClose)} days</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Health Indicators
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Stale Issue Rate</span>
                <span className={`font-semibold ${staleIssues.length > 5 ? 'text-destructive' : 'text-success'}`}>
                  {openIssues.length ? Math.round((staleIssues.length / openIssues.length) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">PR Link Rate</span>
                <span className="font-semibold text-primary">
                  {openIssues.length ? Math.round((issuesWithPR.length / openIssues.length) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Active Contributors</span>
                <span className="font-semibold">{contributors?.filter((c) => c.contributions > 5).length || 0}</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Repository Health Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8">
        <Card className="p-8 bg-gradient-hero border-primary/20">
          <h3 className="text-2xl font-bold mb-4">Repository Health Summary</h3>
          <div className="space-y-3 text-muted-foreground">
            <p>
              This repository has <span className="font-semibold text-foreground">{issues?.length}</span> total issues,
              with <span className="font-semibold text-foreground">{openIssues.length}</span> currently open.
            </p>
            {staleIssues.length > 0 && (
              <p>
                ⚠️ There are <span className="font-semibold text-destructive">{staleIssues.length}</span> stale issues
                that need attention - these have been assigned but show no recent activity.
              </p>
            )}
            <p>
              The average time to close an issue is{' '}
              <span className="font-semibold text-foreground">{Math.round(avgTimeToClose)} days</span>.
            </p>
            <p>
              The repository has <span className="font-semibold text-foreground">{contributors?.length}</span>{' '}
              contributors, with{' '}
              <span className="font-semibold text-foreground">
                {contributors?.filter((c) => c.contributions > 10).length || 0}
              </span>{' '}
              highly active maintainers.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
