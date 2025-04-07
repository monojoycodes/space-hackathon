
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  Search, 
  RotateCcw, 
  Trash, 
  Clock, 
  FileText,
  Menu,
  Rocket 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileMenuOpen, toggleMobileMenu }) => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/cargo-placement', icon: Package, label: 'Cargo Placement' },
    { path: '/item-search', icon: Search, label: 'Item Search' },
    { path: '/rearrangement', icon: RotateCcw, label: 'Rearrangement' },
    { path: '/waste-management', icon: Trash, label: 'Waste Management' },
    { path: '/time-simulation', icon: Clock, label: 'Time Simulation' },
    { path: '/logs', icon: FileText, label: 'Logs' },
  ];
  
  // Animate logo on initial load
  const logoVariants = {
    hidden: { rotate: -90, opacity: 0 },
    visible: { 
      rotate: 0, 
      opacity: 1,
      transition: { 
        type: 'spring',
        stiffness: 100,
        damping: 10,
        delay: 0.2
      }
    }
  };
  
  // Staggered animation for nav items
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 10 }
    }
  };
  
  return (
    <>
      {/* Mobile menu toggle with animation */}
      <motion.button 
        className="lg:hidden fixed top-4 left-4 z-50 bg-space-blue p-2 rounded-full" 
        onClick={toggleMobileMenu}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      >
        <Menu className="text-white" />
      </motion.button>
      
      {/* Sidebar background with glass effect */}
      <motion.div 
        className={cn(
          "fixed inset-y-0 left-0 backdrop-blur-md bg-white/10 dark:bg-black/20 w-20 border-r border-gray-200/20 dark:border-gray-800/40 transition-all duration-300 ease-in-out z-40",
          !isMobileMenuOpen && "lg:translate-x-0 -translate-x-full",
          isMobileMenuOpen && "translate-x-0"
        )}
        initial={{ x: -100 }}
        animate={{ x: isMobileMenuOpen ? 0 : (window.innerWidth > 1024 ? 0 : -100) }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Logo */}
        <motion.div 
          className="flex flex-col items-center pt-12 mb-12"
          variants={logoVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="relative">
            <Rocket className="h-10 w-10 text-space-blue z-10 relative" />
            <div className="absolute inset-0 bg-blue-500 blur-md rounded-full opacity-40 animate-pulse z-0"></div>
          </div>
        </motion.div>
        
        {/* Navigation with item animations */}
        <motion.nav 
          className="flex flex-col items-center space-y-8 mt-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {navItems.map((item) => (
            <motion.div
              key={item.path}
              variants={itemVariants}
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
              className="relative group"
            >
              <Link
                to={item.path}
                className={cn(
                  "p-3 rounded-lg transition-all flex flex-col items-center relative",
                  isActive(item.path) 
                    ? "bg-space-blue text-white" 
                    : "text-gray-400 hover:text-white hover:bg-gray-800/30"
                )}
              >
                <item.icon className="h-6 w-6 relative z-10" />
                
                {/* Active/hover indicator */}
                {isActive(item.path) && (
                  <motion.div 
                    className="absolute left-0 w-1 h-full bg-blue-400 rounded-r-md"
                    layoutId="activeIndicator"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                
                {/* Tooltip */}
                <motion.div
                  className="absolute left-20 whitespace-nowrap px-3 py-1.5 bg-gray-800 text-white text-sm rounded-md hidden lg:block pointer-events-none"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ 
                    opacity: hoveredItem === item.path ? 1 : 0,
                    x: hoveredItem === item.path ? 0 : -10
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {item.label}
                  <div className="absolute w-2 h-2 bg-gray-800 transform rotate-45 left-[-4px] top-[calc(50%-4px)]" />
                </motion.div>
              </Link>
              
              {/* Glow effect for active item */}
              {isActive(item.path) && (
                <div className="absolute inset-0 bg-blue-500/20 blur-lg rounded-lg -z-10"></div>
              )}
            </motion.div>
          ))}
        </motion.nav>
      </motion.div>
    </>
  );
};

export default Sidebar;
