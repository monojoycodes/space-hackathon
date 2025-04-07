
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { motion } from 'framer-motion';
import { Moon, Sun, Zap } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useIsMobile } from '@/hooks/use-mobile';

const Layout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [animationMode, setAnimationMode] = useState(true);
  const isMobile = useIsMobile();
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('dark-mode', 'true');
      // Add dark theme class to improve text visibility
      document.body.classList.add('theme-dark');
      document.body.classList.remove('theme-light');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dark-mode', 'false');
      // Add light theme class to improve text visibility
      document.body.classList.add('theme-light');
      document.body.classList.remove('theme-dark');
    }
  };
  
  const toggleAnimationMode = () => {
    setAnimationMode(!animationMode);
    localStorage.setItem('animation-mode', animationMode ? 'false' : 'true');
    // Here you would implement animation toggling functionality
  };
  
  // Check for saved dark mode preference on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('dark-mode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('theme-dark');
      document.body.classList.remove('theme-light');
    } else {
      document.body.classList.add('theme-light');
      document.body.classList.remove('theme-dark');
    }
    
    const savedAnimationMode = localStorage.getItem('animation-mode') !== 'false';
    setAnimationMode(savedAnimationMode);
  }, []);
  
  // Close mobile menu when switching to desktop view
  useEffect(() => {
    if (!isMobile && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile, isMobileMenuOpen]);
  
  return (
    <div className="flex min-h-screen bg-white/5 dark:bg-gray-900/20 text-gray-800 dark:text-gray-100 font-sans">
      <Sidebar 
        isMobileMenuOpen={isMobileMenuOpen} 
        toggleMobileMenu={toggleMobileMenu} 
      />
      
      <main className="flex-1 p-4 lg:pl-28 overflow-x-hidden">
        <motion.div 
          className="flex justify-end mb-4 gap-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {/* Animation toggle */}
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <Zap className={`h-5 w-5 ${animationMode ? 'text-yellow-400' : 'text-gray-500 dark:text-gray-400'}`} />
            <Switch 
              checked={animationMode} 
              onCheckedChange={toggleAnimationMode} 
              aria-label="Toggle animations"
              className="data-[state=checked]:bg-yellow-500"
            />
          </motion.div>
          
          {/* Dark mode toggle */}
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <Sun className={`h-5 w-5 ${!darkMode ? 'text-yellow-400' : 'text-gray-500 dark:text-gray-400'}`} />
            <Switch 
              checked={darkMode} 
              onCheckedChange={toggleDarkMode} 
              aria-label="Toggle dark mode"
              className="data-[state=checked]:bg-blue-700"
            />
            <Moon className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
          </motion.div>
        </motion.div>
        
        <div className="mobile-container space-card p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
