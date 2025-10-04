import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { githubAPI, GitHubIssue } from '@/lib/github-api';
import { IssueCard } from '@/components/IssueCard';
import { StaleIssuesAlert } from '@/components/StaleIssuesAlert';
import { DashboardOverview } from '@/components/DashboardOverview';
import { NotificationSystem } from '@/components/NotificationSystem';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Loader2, AlertCircle, BarChart3, List } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Issues() {
  const [searchParams, setSearchParams] = useSearchParams();
  const repoParam = searchParams.get('repo');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'comments' | 'most-active'>('updated');
  const [sortByAssigned, setSortByAssigned] = useState(false);
  const [sortByActive, setSortByActive] = useState(false);
  
  const parseRepo = (repo: string | null) => {
    if (!repo) return null;
    const [owner, name] = repo.split('/');
    return owner && name ? { owner, name } : null;
  };

  const repo = parseRepo(repoParam);

  const { data: issues, isLoading, error } = useQuery({
    queryKey: ['issues', repo?.owner, repo?.name, statusFilter, sortBy],
    queryFn: async () => {
      if (!repo) return [];
      // only pass GitHub-supported sort values
      const apiSort = sortBy === 'created' || sortBy === 'comments' || sortBy === 'updated' ? sortBy : 'updated';
      return await githubAPI.getIssues(repo.owner, repo.name, {
        state: statusFilter,
        sort: apiSort,
        per_page: 50,
      });
    },
    enabled: !!repo,
  });

  // When sorting by assigned, we need to fetch timelines for open issues to compute assigned time
  const { data: issuesWithAssigned } = useQuery({
    queryKey: ['issues-assigned-times', repo?.owner, repo?.name, issues, sortByAssigned],
    queryFn: async () => {
      if (!issues || !sortByAssigned) return issues || [];

      const results = await Promise.all(
        issues.map(async (issue: GitHubIssue) => {
          try {
            const timeline = await githubAPI.getIssueTimeline(repo!.owner, repo!.name, issue.number);
            // find the most recent 'assigned' event for current assignee
            let assignedAt: string | null = null;
            if (issue.assignee) {
              for (let i = timeline.length - 1; i >= 0; i--) {
                const ev = timeline[i] as any;
                if (ev.event === 'assigned' && ev.assignee?.login === issue.assignee.login) {
                  assignedAt = ev.created_at;
                  break;
                }
              }
            }
            return { ...issue, assignedAt };
          } catch (e) {
            return { ...issue, assignedAt: null };
          }
        })
      );

      return results;
    },
    enabled: !!issues && !!repo,
    staleTime: 30 * 1000,
  });

  // When sorting by most active, fetch assignee activity for each issue (cached)
  const { data: issuesWithAssigneeActivity } = useQuery({
    queryKey: ['issues-assignee-activity', repo?.owner, repo?.name, issues, sortByActive],
    queryFn: async () => {
      if (!issues || !sortByActive) return issues || [];

      const results = await Promise.all(
        issues.map(async (issue: GitHubIssue) => {
          if (!issue.assignee) return { ...issue, assigneeActivity: null };
          try {
            const activity = await githubAPI.getUserActivity(repo!.owner, repo!.name, issue.assignee.login);
            return { ...issue, assigneeActivity: activity };
          } catch (e) {
            return { ...issue, assigneeActivity: null };
          }
        })
      );

      return results;
    },
    enabled: !!issues && !!repo,
    staleTime: 30 * 1000,
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

  const { data: contributorsWithActivity } = useQuery({
    queryKey: ['contributors-activity', repo?.owner, repo?.name, contributors],
    queryFn: async () => {
      if (!contributors || !repo) return [];
      
      const activityData = await Promise.all(
        contributors.slice(0, 10).map(async (contributor) => {
          try {
            return await githubAPI.getUserActivity(repo.owner, repo.name, contributor.login);
          } catch (error) {
            console.error(`Failed to fetch activity for ${contributor.login}:`, error);
            return null;
          }
        })
      );
      
      return activityData.filter(Boolean);
    },
    enabled: !!contributors && !!repo,
    staleTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (error) {
      toast.error('Failed to load issues. Please check the repository and try again.');
    }
  }, [error]);

  const filteredIssues = issues?.filter((issue) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      issue.title.toLowerCase().includes(term) ||
      issue.number.toString().includes(term) ||
      issue.user.login.toLowerCase().includes(term)
    );
  });

  // If sorting by assigned, order by how long it's been assigned (longest first)
  const finalIssues = sortByAssigned && issuesWithAssigned
    ? [...issuesWithAssigned].sort((a: any, b: any) => {
      const aTime = a.assignedAt ? new Date(a.assignedAt).getTime() : 0;
      const bTime = b.assignedAt ? new Date(b.assignedAt).getTime() : 0;
      // earlier assignedAt -> smaller timestamp -> should come first (longer assigned)
      return aTime - bTime;
    })
    : sortByActive && issuesWithAssigneeActivity
    ? [...issuesWithAssigneeActivity].sort((a: any, b: any) => {
      const aScore = a.assigneeActivity ? a.assigneeActivity.reliabilityScore : 0;
      const bScore = b.assigneeActivity ? b.assigneeActivity.reliabilityScore : 0;
      return bScore - aScore; // higher reliability (more active) first
    })
    : filteredIssues;

  const staleIssues = issues?.filter((issue) => githubAPI.isStaleIssue(issue)) || [];
  const openIssues = issues?.filter((issue) => issue.state === 'open') || [];
  const closedIssues = issues?.filter((issue) => issue.state === 'closed') || [];

  if (!repo) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">No Repository Selected</h2>
          <p className="text-muted-foreground">Please search for a repository from the home page</p>
          <Button onClick={() => window.location.href = '/'}>
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {repoData && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <img
              src={repoData.owner.avatar_url}
              alt={repoData.owner.login}
              className="h-16 w-16 rounded-full border-2 border-primary/20"
            />
            <div>
              <h1 className="text-3xl font-bold">{repoData.full_name}</h1>
              <p className="text-muted-foreground">{repoData.description}</p>
            </div>
          </div>

          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{repoData.stargazers_count}</span>
              <span className="text-muted-foreground">stars</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{openIssues.length}</span>
              <span className="text-muted-foreground">open issues</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-destructive">{staleIssues.length}</span>
              <span className="text-muted-foreground">stale issues</span>
            </div>
          </div>
          {sortByActive && issuesWithAssigneeActivity && (
            <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-amber-50 to-pink-50 border border-white/6 flex items-center gap-4">
              <div className="font-semibold">Top Active Assignees</div>
              <div className="flex gap-3 overflow-auto">
                {issuesWithAssigneeActivity.slice(0, 6).map((it: any, idx: number) => {
                  const a = it.assigneeActivity;
                  if (!a) return null;
                  return (
                    <div key={idx} className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1">
                      <img src={a.avatar_url} className="h-6 w-6 rounded-full" />
                      <div className="text-sm">
                        <div className="font-medium">{a.login}</div>
                        <div className="text-xs text-muted-foreground">{a.reliabilityScore}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Notification System */}
      {contributorsWithActivity && (
        <NotificationSystem 
          staleIssues={staleIssues}
          contributors={contributorsWithActivity}
          repoOwner={repo.owner}
          repoName={repo.name}
        />
      )}

      {/* Stale Issues Alert */}
      <StaleIssuesAlert 
        issues={staleIssues} 
        repoOwner={repo.owner} 
        repoName={repo.name} 
      />

      {/* Tabs for Dashboard and Issues */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="issues" className="gap-2">
            <List className="h-4 w-4" />
            Issues
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <DashboardOverview repoOwner={repo.owner} repoName={repo.name} />
        </TabsContent>

        <TabsContent value="issues">
          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search issues by title, number, or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Issues</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(v: any) => {
                if (v === 'assigned') {
                  setSortByAssigned(true);
                  setSortByActive(false);
                  setSortBy('updated');
                } else if (v === 'most-active') {
                  setSortByActive(true);
                  setSortByAssigned(false);
                  setSortBy('updated');
                } else {
                  setSortByAssigned(false);
                  setSortByActive(false);
                  setSortBy(v);
                }
              }}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated">Recently Updated</SelectItem>
                  <SelectItem value="created">Newest</SelectItem>
                  <SelectItem value="comments">Most Commented</SelectItem>
                  <SelectItem value="assigned">Assigned (longest)</SelectItem>
                  <SelectItem value="most-active">Most Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Issues List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : finalIssues && finalIssues.length > 0 ? (
            <div className="space-y-4">
              {finalIssues.map((issue: any, index: number) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  repoOwner={repo.owner}
                  repoName={repo.name}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No issues found matching your criteria</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
