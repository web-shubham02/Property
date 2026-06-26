import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Landmark, Users, ClipboardList } from 'lucide-react';

export default function AgentHeader({ title }) {
  const location = useLocation();

  const menuItems = [
    { name: 'Overview', path: '/agent/dashboard', icon: BarChart3 },
    { name: 'Manage Land', path: '/agent/properties', icon: Landmark },
    { name: 'Profiles', path: '/agent/buyers', icon: Users },
    { name: 'Seller Submissions', path: '/agent/sellers', icon: ClipboardList },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-brand-muted">Agent Administration Console</span>
          <h1 className="text-3xl font-extrabold font-outfit text-brand">{title}</h1>
        </div>
        <div className="bg-brand/5 border border-brand/10 text-brand px-3.5 py-1.5 rounded-lg text-xs font-bold font-outfit">
          Agent Mode Active
        </div>
      </div>

      {/* Sub Nav Links */}
      <div className="border-b border-gray-200">
        <nav className="flex flex-wrap gap-2 md:gap-6 -mb-px">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 py-3 px-3 md:px-4 border-b-2 font-bold text-xs transition-colors ${
                  isActive(item.path)
                    ? 'border-brand text-brand'
                    : 'border-transparent text-gray-500 hover:text-brand hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
