import { Link, useLocation } from 'react-router-dom';
import { Github, Cookie } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';

export const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/issues', label: 'Issues' },
    { path: '/contributors', label: 'Contributors' },
    { path: '/analytics', label: 'Analytics' },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity">
          <Cookie className="h-6 w-6 text-secondary" />
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            Cookie-Licking Detector
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-medium transition-colors hover:text-primary relative ${
                isActive(item.path) ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {item.label}
              {isActive(item.path) && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </Link>
          ))}
        </div>

        <Button variant="outline" size="sm" asChild>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="gap-2"
          >
            <Github className="h-4 w-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </Button>
      </nav>
    </motion.header>
  );
};
