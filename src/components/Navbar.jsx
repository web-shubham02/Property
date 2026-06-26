import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { Menu, X, LogOut, LayoutDashboard, UserCheck, Shield } from 'lucide-react';
import SellLandModal from './SellLandModal';

export default function Navbar() {
  const { user, profile, signOut, isMock } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate('/');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
  ];

  if (user) {
    navLinks.push({ name: 'Properties', path: '/properties' });
  }

  return (
    <nav className="sticky top-0 z-50 glass border-b border-gray-200/50 px-6 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex flex-col items-center justify-center" id="nav-logo">
          <div className="w-20 h-8 shrink-0 flex items-center justify-center -mb-1">
            <img src="/newlogo.png" alt="Logo" className="w-full h-full object-contain scale-[3]" />
          </div>
          <div className="flex flex-col items-center z-10">
            <span className="font-outfit font-extrabold text-xl tracking-tight text-brand leading-none">DharaSetu</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-muted mt-0.5">Land Bridge</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              id={`nav-link-${link.name.toLowerCase()}`}
              className={`font-semibold text-sm transition-all duration-200 hover:text-brand ${
                isActive(link.path) 
                  ? 'text-brand border-b-2 border-brand pb-1' 
                  : 'text-gray-600 hover:translate-y-[-1px]'
              }`}
            >
              {link.name}
            </Link>
          ))}
          
          {/* Authenticated Admin Routes */}
          {user && profile?.is_agent && (
            <Link
              to="/agent/dashboard"
              id="nav-link-agent-dashboard"
              className={`font-semibold text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                isActive('/agent/dashboard') || location.pathname.startsWith('/agent')
                  ? 'bg-brand/10 text-brand' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-brand'
              }`}
            >
              <Shield size={16} />
              Admin Panel
            </Link>
          )}
        </div>

        {/* Right CTA Button */}
        <div className="hidden md:flex items-center gap-4">
          {isMock && (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-150 text-amber-800 rounded border border-amber-300 select-none animate-pulse">
              Mock Mode
            </span>
          )}
          
          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSellModal(true)}
                className="bg-brand hover:bg-brand-dark text-white font-bold text-sm px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                Sell Your Land
              </button>
              <span className="text-xs text-gray-500 font-medium hidden lg:inline max-w-[120px] truncate" title={profile?.full_name || user.email}>
                Hi, {profile?.full_name?.split(' ')[0] || 'User'}
              </span>
              <button
                onClick={handleLogout}
                id="btn-nav-logout"
                className="flex items-center gap-1.5 text-sm font-bold text-red-600 hover:text-red-700 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                id="btn-nav-login"
                className="text-gray-600 hover:text-brand font-semibold text-sm transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                id="btn-nav-signup"
                className="bg-brand hover:bg-brand-dark text-white font-bold text-sm px-5 py-2.5 rounded-lg shadow-sm shadow-brand/10 hover:shadow-brand/20 transition-all duration-200 transform hover:scale-[1.02]"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          {isMock && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded border border-amber-200">
              Mock
            </span>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            id="btn-mobile-menu"
            className="text-gray-600 hover:text-brand p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-gray-200/60 flex flex-col gap-3 pb-2 animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`font-semibold text-sm px-3 py-2 rounded-md ${
                isActive(link.path) 
                  ? 'bg-brand/10 text-brand' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {link.name}
            </Link>
          ))}
          {user && profile?.is_agent && (
            <Link
              to="/agent/dashboard"
              onClick={() => setIsOpen(false)}
              className={`font-semibold text-sm px-3 py-2 rounded-md ${
                isActive('/agent/dashboard') ? 'bg-brand/10 text-brand' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Admin Panel
            </Link>
          )}
          <div className="border-t border-gray-100 my-2 pt-2">
            {user ? (
              <div className="space-y-3 px-3 py-1">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setShowSellModal(true);
                  }}
                  className="w-full text-center bg-brand hover:bg-brand-dark text-white font-bold text-sm py-2.5 rounded-lg transition-colors shadow-sm"
                >
                  Sell Your Land
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left flex items-center gap-2 font-bold text-sm text-red-600 py-2 rounded-md hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Logout ({profile?.full_name || 'User'})
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-center border border-gray-200 text-gray-700 font-bold text-sm py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="block text-center bg-brand hover:bg-brand-dark text-white font-bold text-sm py-2.5 rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
      <SellLandModal isOpen={showSellModal} onClose={() => setShowSellModal(false)} />
    </nav>
  );
}
