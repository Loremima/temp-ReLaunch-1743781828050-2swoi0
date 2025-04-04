import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, Users, Mail, Clock, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import Logo from '../common/Logo';

export default function Layout() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const isSettingsPage = location.pathname.startsWith('/app/settings');

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsCollapsed(true);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null && !isMobile) {
      setIsCollapsed(savedState === 'true');
    }
  }, [isMobile]);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isCollapsed.toString());
  }, [isCollapsed]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navigation = [
    { name: 'Tableau de bord', href: '/app/dashboard', icon: BarChart3 },
    { name: 'Prospects', href: '/app/prospects', icon: Users },
    { name: 'Templates', href: '/app/templates', icon: Mail },
    { name: 'Historique', href: '/app/history', icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-gray-800 transition-theme">
      <div className="flex h-screen">
        {/* Main Sidebar - Hide when on settings page */}
        {!isSettingsPage && (
          <div
            className={`${isCollapsed ? 'w-20' : 'w-64'
              } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-in-out shadow-lg ${isMobile ? 'absolute z-50 h-full' : 'relative'
              }`}
          >
            <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 dark:from-blue-900/20 dark:to-indigo-900/20">
              {isCollapsed ? (
                <Logo size="sm" className="mx-auto" />
              ) : (
                <Logo size="md" />
              )}
            </div>

            <nav className="flex-1 p-4 space-y-1.5">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href ||
                  (item.href !== '/app/dashboard' && location.pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden group ${isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md dark:from-blue-700 dark:to-indigo-700'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50/50 dark:hover:bg-gray-700/50 hover:text-blue-700 dark:hover:text-blue-400'
                      }`}
                    onMouseEnter={() => isCollapsed && setShowTooltip(item.name)}
                    onMouseLeave={() => setShowTooltip(null)}
                  >
                    <Icon className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 ${isActive ? 'text-white' : 'text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300'}`} />
                    {!isCollapsed && <span>{item.name}</span>}
                    {!isActive && !isCollapsed && (
                      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 group-hover:w-full transition-all duration-300"></div>
                    )}
                    {isCollapsed && showTooltip === item.name && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg whitespace-nowrap z-50">
                        {item.name}
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                to="/app/settings"
                className={`mt-2 flex items-center w-full px-3 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-xl hover:bg-blue-50/50 dark:hover:bg-gray-700/50 hover:text-blue-700 dark:hover:text-blue-400 transition-all duration-300 ${isCollapsed ? 'justify-center' : ''
                  }`}
                onMouseEnter={() => isCollapsed && setShowTooltip('settings')}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <Settings className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5`} />
                {!isCollapsed && <span>Paramètres</span>}
                {isCollapsed && showTooltip === 'settings' && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg z-50">
                    Paramètres
                  </div>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className={`mt-2 flex items-center w-full px-3 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400 transition-all duration-300 ${isCollapsed ? 'justify-center' : ''
                  }`}
                onMouseEnter={() => isCollapsed && setShowTooltip('logout')}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <LogOut className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5`} />
                {!isCollapsed && <span>Déconnexion</span>}
                {isCollapsed && showTooltip === 'logout' && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg z-50">
                    Déconnexion
                  </div>
                )}
              </button>
            </div>

            {/* Collapse Toggle */}
            {!isMobile && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full flex items-center justify-center hover:bg-blue-50 dark:hover:bg-gray-600 hover:text-blue-600 dark:hover:text-blue-300 transition-all duration-300 shadow-sm"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                ) : (
                  <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                )}
              </button>
            )}
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 overflow-auto dark:bg-gray-900">
          <div className="p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}