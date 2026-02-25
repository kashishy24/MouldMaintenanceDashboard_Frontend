import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { MdDashboard, MdHistory, MdBuild, MdHealthAndSafety, MdInventory, MdSettings, MdReport, MdChevronRight, MdSearch, MdNotifications, MdPerson } from 'react-icons/md';
import UserMenu from '../components/DropdownProfile';
import ThemeToggle from '../components/ThemeToggle';

function Header({
  sidebarOpen,
  setSidebarOpen,
  variant = 'default',
}) {
  const location = useLocation();
  const { pathname } = location;
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Route name mapping with icons
  const routeConfig = {
    '/Home': { name: 'Home', icon: MdDashboard, color: 'text-blue-600' },
    '/MouldMaintenanceHistory': { name: 'Preventive Maintenance History', icon: MdHistory, color: 'text-violet-600' },
    '/PMStatus': { name: 'PM Status', icon: MdBuild, color: 'text-orange-600' },
    '/HCStatus': { name: 'Health Check Status', icon: MdHealthAndSafety, color: 'text-green-600' },
    '/SparePart': { name: 'Spare Part', icon: MdInventory, color: 'text-yellow-600' },
    '/MouldSummary': { name: 'Mould Summary', icon: MdDashboard, color: 'text-indigo-600' },
    '/parameters': { name: 'Parameters', icon: MdSettings, color: 'text-gray-600' },
    '/HCHistory': { name: 'Health Check History', icon: MdHistory, color: 'text-green-600' },
    '/MouldBreakdownHistory': { name: 'Mould Breakdown History', icon: MdHistory, color: 'text-red-600' },
    '/SparePartHistory': { name: 'Spare Part History', icon: MdInventory, color: 'text-yellow-600' },
    '/PMCheckPointReport': { name: 'PM CheckPoint Report', icon: MdReport, color: 'text-blue-600' },
    '/HCCheckPointReport': { name: 'HC CheckPoint Report', icon: MdReport, color: 'text-green-600' },
  };

  const currentRoute = routeConfig[pathname] || { name: 'Dashboard', icon: MdDashboard, color: 'text-blue-600' };
  const CurrentIcon = currentRoute.icon;

  // Format date
  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Get greeting based on time
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${
      variant === 'v2' || variant === 'v3' 
        ? 'bg-white dark:bg-gray-800 shadow-sm' 
        : 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm'
    }`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Hamburger button */}
            <button
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-800 transition-all duration-200"
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
              onClick={(e) => { e.stopPropagation(); setSidebarOpen(!sidebarOpen); }}
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Breadcrumb & Page Title */}
            <div className="flex flex-col">
              {/* Breadcrumb */}
              {/* <nav className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-1">
                <Link to="/home" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Home
                </Link>
                <MdChevronRight className="text-gray-400" />
                <span className="text-gray-800 dark:text-gray-200 font-medium">{currentRoute.name}</span>
              </nav> */}
              
              {/* Page Title with Icon */}
              <div className="flex items-center gap-2">
                <CurrentIcon className={`w-6 h-6 ${currentRoute.color}`} />
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                  {currentRoute.name}
                </h1>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Search Bar */}
            {/* <div className="hidden md:flex items-center relative">
              <div className="relative group">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-48 lg:w-64 rounded-full bg-gray-100 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-700 transition-all duration-200"
                />
              </div>
            </div> */}

            {/* Date & Time */}
            <div className="hidden lg:flex flex-col items-end text-sm text-gray-600 dark:text-gray-300 mr-2">
              <span className="font-semibold">{formattedTime}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{formattedDate}</span>
            </div>

            {/* Divider */}
            <div className="hidden sm:block h-8 w-px bg-gray-200 dark:bg-gray-700"></div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            {/* <button className="relative p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-800 transition-all duration-200">
              <MdNotifications className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button> */}

            {/* Divider */}
            <div className="hidden sm:block h-8 w-px bg-gray-200 dark:bg-gray-700"></div>

            {/* User Menu */}
            <div className="flex items-center gap-2">
              <UserMenu align="right" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
