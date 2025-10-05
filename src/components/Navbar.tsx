import { Link, useLocation } from 'react-router-dom';
import { Github, Cookie } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';

export const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/issues', label: 'Issues' },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <nav className="container mx-auto flex h-16 items-center px-4 relative">
        {/* Logo on the Left */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity">
          <Cookie className="h-6 w-6 text-secondary" />
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            GIT BUDDY
          </span>
        </Link>

        {/* Centered Nav Links */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-6">
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
      </nav>
    </motion.header>
  );
};
