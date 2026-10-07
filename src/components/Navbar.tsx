import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import {
  Bell,
  Heart,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Sparkles,
  Briefcase,
  Layers,
  ArrowLeftRight,
  Shield,
  PlusCircle,
  Menu,
  X,
} from 'lucide-react';
import NotificationDrawer from './NotificationDrawer.js';

export default function Navbar() {
  const { user, role, isAuthenticated, logout, quickDemoLogin, unreadCount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const handleQuickDemo = async (demoRole: 'freelancer' | 'client' | 'admin') => {
    await quickDemoLogin(demoRole);
    setDemoDropdownOpen(false);
    if (demoRole === 'admin') navigate('/admin');
    else navigate('/dashboard');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
                TT
              </span>
              <span>TalentTrade</span>
            </Link>
          </div>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            {!isAuthenticated && (
              <>
                <Link
                  to="/services"
                  className={`hover:text-indigo-600 transition-colors ${isActive('/services') ? 'text-indigo-600 font-semibold' : ''}`}
                >
                  Browse Services
                </Link>
                <Link
                  to="/freelancers"
                  className={`hover:text-indigo-600 transition-colors ${isActive('/freelancers') ? 'text-indigo-600 font-semibold' : ''}`}
                >
                  Find Talent
                </Link>
                <Link
                  to="/projects"
                  className={`hover:text-indigo-600 transition-colors ${isActive('/projects') ? 'text-indigo-600 font-semibold' : ''}`}
                >
                  Open Projects
                </Link>
                <Link
                  to="/skill-exchange"
                  className={`hover:text-indigo-600 transition-colors flex items-center gap-1.5 ${
                    isActive('/skill-exchange') ? 'text-indigo-600 font-semibold' : ''
                  }`}
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Skill Exchange</span>
                </Link>
              </>
            )}

            {isAuthenticated && role === 'FREELANCER' && (
              <>
                <Link
                  to="/dashboard"
                  className={`hover:text-indigo-600 transition-colors ${isActive('/dashboard') ? 'text-indigo-600 font-semibold' : ''}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/projects"
                  className={`hover:text-indigo-600 transition-colors ${isActive('/projects') ? 'text-indigo-600 font-semibold' : ''}`}
                >
                  Find Projects
                </Link>
                <Link
                  to="/offer-service"
                  className={`hover:text-indigo-600 transition-colors flex items-center gap-1 ${
                    isActive('/offer-service') ? 'text-indigo-600 font-semibold' : ''
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Offer Service</span>
                </Link>
                <Link
                  to="/skill-exchange"
                  className={`hover:text-indigo-600 transition-colors flex items-center gap-1 ${
                    isActive('/skill-exchange') ? 'text-indigo-600 font-semibold' : ''
                  }`}
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Skill Exchange</span>
                </Link>
                <Link
                  to="/favorites"
                  className={`hover:text-indigo-600 transition-colors ${isActive('/favorites') ? 'text-indigo-600 font-semibold' : ''}`}
                >
                  Favorites
                </Link>
              </>
            )}

            {isAuthenticated && role === 'CLIENT' && (
              <>
                <Link
                  to="/dashboard"
                  className={`hover:text-indigo-600 transition-colors ${isActive('/dashboard') ? 'text-indigo-600 font-semibold' : ''}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/freelancers"
                  className={`hover:text-indigo-600 transition-colors ${isActive('/freelancers') ? 'text-indigo-600 font-semibold' : ''}`}
                >
                  Find Talent
                </Link>
                <Link
                  to="/services"
                  className={`hover:text-indigo-600 transition-colors ${isActive('/services') ? 'text-indigo-600 font-semibold' : ''}`}
                >
                  Browse Services
                </Link>
                <Link
                  to="/post-project"
                  className={`hover:text-indigo-600 transition-colors flex items-center gap-1 ${
                    isActive('/post-project') ? 'text-indigo-600 font-semibold' : ''
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Post Project</span>
                </Link>
                <Link
                  to="/skill-exchange"
                  className={`hover:text-indigo-600 transition-colors flex items-center gap-1 ${
                    isActive('/skill-exchange') ? 'text-indigo-600 font-semibold' : ''
                  }`}
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Skill Exchange</span>
                </Link>
              </>
            )}

            {isAuthenticated && role === 'ADMIN' && (
              <>
                <Link
                  to="/admin"
                  className={`hover:text-indigo-600 transition-colors ${isActive('/admin') ? 'text-indigo-600 font-semibold' : ''}`}
                >
                  Admin Overview
                </Link>
                <Link
                  to="/services"
                  className={`hover:text-indigo-600 transition-colors ${isActive('/services') ? 'text-indigo-600 font-semibold' : ''}`}
                >
                  Services
                </Link>
                <Link
                  to="/projects"
                  className={`hover:text-indigo-600 transition-colors ${isActive('/projects') ? 'text-indigo-600 font-semibold' : ''}`}
                >
                  Projects
                </Link>
                <Link
                  to="/skill-exchange"
                  className={`hover:text-indigo-600 transition-colors ${isActive('/skill-exchange') ? 'text-indigo-600 font-semibold' : ''}`}
                >
                  Exchanges
                </Link>
              </>
            )}
          </nav>

          {/* Zone 3: 1-2 primary actions + account controls */}
          <div className="flex items-center gap-3">
            {/* Quick Demo Switcher (Instant Evaluation Role Switcher) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap"
                title="Switch demo role instantly for evaluation"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Demo Switcher</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {demoDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
                  <div className="px-3 py-1 text-slate-400 font-medium">Switch Evaluator Account:</div>
                  <button
                    onClick={() => handleQuickDemo('freelancer')}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>Freelancer (Priya)</span>
                    <span className="text-slate-400 font-mono text-[11px]">Free</span>
                  </button>
                  <button
                    onClick={() => handleQuickDemo('client')}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>Client (Marcus)</span>
                    <span className="text-slate-400 font-mono text-[11px]">Client</span>
                  </button>
                  <button
                    onClick={() => handleQuickDemo('admin')}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>Admin Console</span>
                    <span className="text-slate-400 font-mono text-[11px]">Admin</span>
                  </button>
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <>
                {/* Notifications Bell */}
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(true)}
                  className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                  aria-label="View notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Favorites link */}
                <Link
                  to="/favorites"
                  className="p-2 text-slate-600 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors hidden sm:flex"
                  aria-label="View favorites"
                >
                  <Heart className="w-5 h-5" />
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <img
                      src={user?.profileImage || '/src/assets/images/avatar_freelancer_priya_1790830248285.jpg'}
                      alt={user?.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    <span className="hidden lg:block text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                      {user?.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 text-sm">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="font-semibold text-slate-900 text-xs truncate">{user?.name}</p>
                        <p className="text-slate-500 text-xs truncate">{user?.email}</p>
                        <span className="inline-block mt-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {user?.role}
                        </span>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 text-xs"
                      >
                        <Layers className="w-4 h-4 text-slate-400" />
                        <span>My Dashboard</span>
                      </Link>

                      <Link
                        to={`/profile/${user?.id}`}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 text-xs"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span>View Public Profile</span>
                      </Link>

                      <Link
                        to="/profile/edit"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 text-xs"
                      >
                        <Briefcase className="w-4 h-4 text-slate-400" />
                        <span>Edit Profile & Skills</span>
                      </Link>

                      {user?.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 text-xs font-semibold"
                        >
                          <Shield className="w-4 h-4 text-indigo-600" />
                          <span>Admin Control Panel</span>
                        </Link>
                      )}

                      <div className="border-t border-slate-100 mt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 text-xs font-medium"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm whitespace-nowrap"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2 text-sm">
            <Link
              to="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md hover:bg-slate-50 text-slate-700"
            >
              Browse Services
            </Link>
            <Link
              to="/freelancers"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md hover:bg-slate-50 text-slate-700"
            >
              Find Talent
            </Link>
            <Link
              to="/projects"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md hover:bg-slate-50 text-slate-700"
            >
              Browse Projects
            </Link>
            <Link
              to="/skill-exchange"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md hover:bg-slate-50 text-slate-700 font-medium text-emerald-700"
            >
              Skill Exchange Hub
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md hover:bg-slate-50 text-indigo-700 font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/favorites"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md hover:bg-slate-50 text-slate-700"
                >
                  My Favorites
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-rose-50 text-rose-600 font-medium"
                >
                  Log Out
                </button>
              </>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 text-center text-xs font-semibold border border-slate-200 rounded-md"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 text-center text-xs font-semibold bg-indigo-600 text-white rounded-md"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Notifications Drawer */}
      <NotificationDrawer isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </>
  );
}
