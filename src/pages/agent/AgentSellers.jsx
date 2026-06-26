import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../supabaseClient';
import { initialMockSellers } from '../../data/mockAdminData';
import AgentHeader from '../../components/AgentHeader';
import { Mail, Phone, Calendar, AlertCircle, RefreshCw } from 'lucide-react';

export default function AgentSellers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null); // track which row is updating

  const loadSellers = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        // Query profiles + seller_land_submissions in Supabase
        const { data, error } = await supabase
          .from('seller_land_submissions')
          .select(`
            id,
            status,
            created_at,
            profiles (
              full_name,
              email,
              phone
            )
          `)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const formatted = data.map(item => ({
            id: item.id,
            full_name: item.profiles?.full_name || 'Anonymous User',
            email: item.profiles?.email || 'N/A',
            phone: item.profiles?.phone || 'N/A',
            status: item.status || 'Pending',
            created_at: item.created_at
          }));
          setSellers(formatted);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error('Error loading Supabase seller submissions:', err);
    }

    // Mock Mode fallback
    const localSellers = localStorage.getItem('dharasetu_mock_seller_submissions');
    if (localSellers) {
      setSellers(JSON.parse(localSellers));
    } else {
      localStorage.setItem('dharasetu_mock_seller_submissions', JSON.stringify(initialMockSellers));
      setSellers(initialMockSellers);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSellers();
  }, []);

  // Update Status Handler
  const handleStatusChange = async (submissionId, newStatus) => {
    setUpdatingId(submissionId);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('seller_land_submissions')
          .update({ status: newStatus })
          .eq('id', submissionId);
        
        if (error) throw error;
      } else {
        // Mock Mode persistence
        const localSellers = JSON.parse(localStorage.getItem('dharasetu_mock_seller_submissions') || '[]');
        const index = localSellers.findIndex(s => s.id === submissionId);
        if (index !== -1) {
          localSellers[index].status = newStatus;
          localStorage.setItem('dharasetu_mock_seller_submissions', JSON.stringify(localSellers));
        }
      }
      
      // Update local state without full reload for smoother transitions
      setSellers(prev => prev.map(item => 
        item.id === submissionId ? { ...item, status: newStatus } : item
      ));
    } catch (err) {
      console.error('Failed to update seller submission status:', err);
      alert('Update failed: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (st) => {
    switch (st.toLowerCase()) {
      case 'converted':
        return 'text-green-700 bg-green-50 border-green-200 focus:border-green-400 focus:ring-green-400';
      case 'contacted':
        return 'text-blue-700 bg-blue-50 border-blue-200 focus:border-blue-400 focus:ring-blue-400';
      default:
        return 'text-amber-700 bg-amber-50 border-amber-250 focus:border-amber-400 focus:ring-amber-400';
    }
  };

  return (
    <div className="space-y-8" id="page-agent-sellers-submissions">
      {/* Admin header */}
      <AgentHeader title="Seller Submissions" />

      {/* Stats counter toolbar */}
      <div className="flex justify-between items-center bg-white border border-gray-150 p-4 rounded-xl shadow-sm">
        <span className="text-xs text-gray-500 font-semibold">{sellers.length} total owner submissions registered</span>
        <button 
          onClick={loadSellers}
          title="Refresh Submission Data"
          className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:text-brand hover:bg-gray-50 transition-colors shrink-0"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="bg-white border border-gray-150 rounded-2xl h-[300px] animate-pulse" />
      ) : sellers.length === 0 ? (
        <div className="bg-white border border-gray-150 p-12 text-center text-xs text-gray-500 rounded-2xl shadow-sm">
          No seller submissions listed in database.
        </div>
      ) : (
        <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead className="bg-gray-50 border-b border-gray-150 font-outfit uppercase font-extrabold text-[10px] tracking-wider text-brand-muted">
                <tr>
                  <th className="py-4 px-6">Land Owner</th>
                  <th className="py-4 px-4">Contact Info</th>
                  <th className="py-4 px-4">Submitted Date</th>
                  <th className="py-4 px-6">Verification Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-600">
                {sellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-brand font-outfit text-sm">
                        {seller.full_name}
                      </div>
                    </td>
                    <td className="py-4 px-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Phone size={12} className="text-brand-muted" />
                        <a href={`tel:${seller.phone}`} className="hover:text-brand transition-colors">{seller.phone}</a>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <Mail size={12} className="text-gray-300" />
                        <a href={`mailto:${seller.email}`} className="hover:text-brand transition-colors">{seller.email}</a>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className="text-gray-300" />
                        <span>{formatDate(seller.created_at)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="relative inline-block w-40">
                        <select
                          value={seller.status}
                          disabled={updatingId === seller.id}
                          onChange={(e) => handleStatusChange(seller.id, e.target.value)}
                          className={`w-full py-1.5 px-3 border rounded-lg text-xs font-bold font-outfit outline-none transition-all focus:ring-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${getStatusColor(seller.status)}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Converted">Converted</option>
                        </select>
                        {updatingId === seller.id && (
                          <div className="absolute right-7 top-2.5">
                            <span className="w-3.5 h-3.5 border border-brand border-t-transparent rounded-full animate-spin block"></span>
                          </div>
                        )}
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
