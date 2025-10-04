import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, GitBranch, Clock, TrendingUp, Zap, Shield, Cookie } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { githubAPI } from '@/lib/github-api';

export default function Home() {
  const [repoInput, setRepoInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!repoInput.trim()) {
      toast.error('Please enter a repository URL or owner/repo');
      return;
    }

    const parsed = githubAPI.parseRepoUrl(repoInput.trim());
    if (!parsed) {
      toast.error('Invalid repository format. Use "owner/repo" or GitHub URL');
      return;
    }

    setIsLoading(true);
    try {
      await githubAPI.getRepository(parsed.owner, parsed.repo);
      toast.success('Repository found! Loading issues...');
      navigate(`/issues?repo=${parsed.owner}/${parsed.repo}`);
    } catch (error) {
      toast.error('Repository not found. Please check the URL and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Search,
      title: 'Detect Claimed Issues',
      description: 'Identify issues that are assigned but show no progress or linked PRs',
      color: 'text-primary',
    },
    {
      icon: Clock,
      title: 'Auto-Release After Inactivity',
      description: 'Automatically detect and flag stale assignments after configurable periods',
      color: 'text-secondary',
    },
    {
      icon: TrendingUp,
      title: 'Contributor Analytics',
      description: 'Track contributor activity, merge rates, and collaboration patterns',
      color: 'text-success',
    },
    {
      icon: Zap,
      title: 'Real-time Monitoring',
      description: 'Get instant insights into repository health and issue progress',
      color: 'text-warning',
    },
    {
      icon: Shield,
      title: 'Smart Detection',
      description: 'AI-powered analysis to identify potential blockers and bottlenecks',
      color: 'text-primary',
    },
    {
      icon: GitBranch,
      title: 'Timeline Visualization',
      description: 'Beautiful visual timelines showing issue lifecycle from open to merge',
      color: 'text-secondary',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(147,51,234,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(251,146,60,0.1),transparent_50%)]" />
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center space-y-8"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="inline-block"
            >
              <Cookie className="h-16 w-16 mx-auto text-secondary" />
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              Stop Cookie-Licking.
              <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Start Real Collaboration.
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Detect and manage GitHub issues that are claimed but show no progress. 
              Help your open-source project thrive with better issue management.
            </p>

            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter repo: owner/repo or github.com/owner/repo"
                  value={repoInput}
                  onChange={(e) => setRepoInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="h-14 text-lg"
                />
                <Button
                  size="lg"
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="h-14 px-8 gap-2"
                >
                  <Search className="h-5 w-5" />
                  Analyze
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Try: <button
                  onClick={() => setRepoInput('facebook/react')}
                  className="text-primary hover:underline font-medium"
                >
                  facebook/react
                </button>
                {' or '}
                <button
                  onClick={() => setRepoInput('microsoft/vscode')}
                  className="text-primary hover:underline font-medium"
                >
                  microsoft/vscode
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">
            Everything You Need to Manage{' '}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Open Source Issues
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful tools to help maintainers keep their projects healthy and contributors engaged
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="p-6 rounded-2xl bg-gradient-card border hover:shadow-lg transition-all duration-300 hover:border-primary/50 h-full">
                <feature.icon className={`h-10 w-10 mb-4 ${feature.color} group-hover:scale-110 transition-transform`} />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-gradient-primary rounded-3xl p-12 text-center text-white shadow-glow"
        >
          <h2 className="text-4xl font-bold mb-4">Ready to improve your workflow?</h2>
          <p className="text-xl mb-8 text-white/90">
            Start analyzing your GitHub repository now and discover hidden insights
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => document.querySelector('input')?.focus()}
            className="h-14 px-8 text-lg gap-2"
          >
            <Search className="h-5 w-5" />
            Get Started Free
          </Button>
        </motion.div>
      </section>
    </div>
  );
}
