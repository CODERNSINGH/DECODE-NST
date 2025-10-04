import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { githubAPI, UserActivityData } from '@/lib/github-api';
import { ContributorCard } from '@/components/ContributorCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Search, Filter, Loader2, AlertCircle, Users, TrendingUp, Activity, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Contributors() {
  const [searchParams, setSearchParams] = useSearchParams();
  const repoParam = searchParams.get('repo');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activityFilter, setActivityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [sortBy, setSortBy] = useState<'contributions' | 'reliability' | 'activity'>('contributions');
  
  const parseRepo = (repo: string | null) => {
    if (!repo) return null;
    const [owner, name] = repo.split('/');
    return owner && name ? { owner, name } : null;
  };

  const repo = parseRepo(repoParam);

  const { data: contributors, isLoading: contributorsLoading } = useQuery({
    queryKey: ['contributors', repo?.owner, repo?.name],
    queryFn: async () => {
      if (!repo) return [];
      return await githubAPI.getContributors(repo.owner, repo.name);
    },
    enabled: !!repo,
  });

  const { data: contributorsWithActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['contributors-activity', repo?.owner, repo?.name, contributors],
    queryFn: async (): Promise<UserActivityData[]> => {
      if (!contributors || !repo) return [];
      
      const activityData = await Promise.all(
        contributors.slice(0, 20).map(async (contributor) => {
          try {
            return await githubAPI.getUserActivity(repo.owner, repo.name, contributor.login);
          } catch (error) {
            console.error(`Failed to fetch activity for ${contributor.login}:`, error);
            return null;
          }
        })
      );
      
      return activityData.filter(Boolean) as UserActivityData[];
    },
    enabled: !!contributors && !!repo,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  const { data: repoData } = useQuery({
    queryKey: ['repository', repo?.owner, repo?.name],
    queryFn: async () => {
      if (!repo) return null;
      return await githubAPI.getRepository(repo.owner, repo.name);
    },
    enabled: !!repo,
  });

  useEffect(() => {
    if (contributorsLoading || activityLoading) {
      toast.loading('Loading contributor data...', { id: 'contributors-loading' });
    } else {
      toast.dismiss('contributors-loading');
    }
  }, [contributorsLoading, activityLoading]);

  const filteredContributors = contributorsWithActivity?.filter((contributor) => {
    const matchesSearch = !searchTerm || 
      contributor.login.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesActivity = activityFilter === 'all' || 
      contributor.activityPattern === activityFilter;
    
    return matchesSearch && matchesActivity;
  });

  const sortedContributors = filteredContributors?.sort((a, b) => {
    switch (sortBy) {
      case 'reliability':
        return b.reliabilityScore - a.reliabilityScore;
      case 'activity':
        const activityOrder = { high: 3, medium: 2, low: 1 };
        return activityOrder[b.activityPattern] - activityOrder[a.activityPattern];
      case 'contributions':
      default:
        return b.totalPRs - a.totalPRs;
    }
  });

  const stats = contributorsWithActivity ? {
    totalContributors: contributorsWithActivity.length,
    highActivity: contributorsWithActivity.filter(c => c.activityPattern === 'high').length,
    mediumActivity: contributorsWithActivity.filter(c => c.activityPattern === 'medium').length,
    lowActivity: contributorsWithActivity.filter(c => c.activityPattern === 'low').length,
    avgReliability: Math.round(
      contributorsWithActivity.reduce((sum, c) => sum + c.reliabilityScore, 0) / contributorsWithActivity.length
    ),
    totalPRs: contributorsWithActivity.reduce((sum, c) => sum + c.totalPRs, 0),
    mergedPRs: contributorsWithActivity.reduce((sum, c) => sum + c.mergedPRs, 0),
  } : null;

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
              <p className="text-muted-foreground">Contributor Analytics</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Overview */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Contributors</p>
                  <p className="text-xl font-bold">{stats.totalContributors}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-success" />
                <div>
                  <p className="text-sm text-muted-foreground">High Activity</p>
                  <p className="text-xl font-bold text-success">{stats.highActivity}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-warning" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Reliability</p>
                  <p className="text-xl font-bold">{stats.avgReliability}%</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-secondary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total PRs</p>
                  <p className="text-xl font-bold">{stats.totalPRs}</p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      )}

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
              placeholder="Search contributors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={activityFilter} onValueChange={(v: any) => setActivityFilter(v)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activity</SelectItem>
              <SelectItem value="high">High Activity</SelectItem>
              <SelectItem value="medium">Medium Activity</SelectItem>
              <SelectItem value="low">Low Activity</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contributions">Most PRs</SelectItem>
              <SelectItem value="reliability">Most Reliable</SelectItem>
              <SelectItem value="activity">Most Active</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Contributors List */}
      {(contributorsLoading || activityLoading) ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : sortedContributors && sortedContributors.length > 0 ? (
        <div className="space-y-4">
          {sortedContributors.map((contributor, index) => (
            <ContributorCard
              key={contributor.login}
              contributor={contributor}
              repoOwner={repo.owner}
              repoName={repo.name}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No contributors found matching your criteria</p>
        </div>
      )}
    </div>
  );
}