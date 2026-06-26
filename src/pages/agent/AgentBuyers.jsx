import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../supabaseClient';
import AgentHeader from '../../components/AgentHeader';
import { Search, Mail, Phone, Calendar } from 'lucide-react';

export default function AgentBuyers() {
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');

  const loadProfiles = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, email, phone, created_at')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setProfiles(data);
          setFilteredProfiles(data);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error('Error loading Supabase profiles:', err);
    }

    // Mock Mode fallback
    setProfiles([]);
    setFilteredProfiles([]);
    setLoading(false);
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  // Filter effect
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProfiles(profiles);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = profiles.filter(p => (p.full_name || '').toLowerCase().includes(query));
      setFilteredProfiles(filtered);
    }
  }, [searchQuery, profiles]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8" id="page-agent-profiles">
      {/* Admin header */}
      <AgentHeader title="Profiles" />

      {/* Toolbar & stats */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white border border-gray-150 p-4 rounded-xl shadow-sm">
        {/* Search Input */}
        <div className="relative md:col-span-8">
          <Search className="absolute left-3 top-3 text-gray-400 shrink-0" size={16} />
          <input 
            type="text" 
            placeholder="Search profiles by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs md:text-sm rounded-lg border border-gray-200 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
          />
        </div>
        
        <div className="md:col-span-4 text-right text-xs font-semibold text-gray-500 pr-2">
          {filteredProfiles.length} matching {filteredProfiles.length === 1 ? 'profile' : 'profiles'}
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="bg-white border border-gray-150 rounded-2xl h-[300px] animate-pulse" />
      ) : filteredProfiles.length === 0 ? (
        <div className="bg-white border border-gray-150 p-12 text-center text-xs text-gray-500 rounded-2xl shadow-sm">
          No profiles found matching your search.
        </div>
      ) : (
        <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead className="bg-gray-50 border-b border-gray-150 font-outfit uppercase font-extrabold text-[10px] tracking-wider text-brand-muted">
                <tr>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Phone</th>
                  <th className="py-4 px-6">Signed Up On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-600">
                {filteredProfiles.map((profile, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-brand font-outfit text-sm">
                        {profile.full_name || 'N/A'}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Mail size={12} className="text-gray-300" />
                        <a href={`mailto:${profile.email}`} className="hover:text-brand transition-colors">{profile.email || 'N/A'}</a>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Phone size={12} className="text-brand-muted" />
                        <a href={`tel:${profile.phone}`} className="hover:text-brand transition-colors">{profile.phone || 'N/A'}</a>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className="text-gray-300" />
                        <span>{formatDate(profile.created_at)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
