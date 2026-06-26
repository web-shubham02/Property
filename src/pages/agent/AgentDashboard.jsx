import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../supabaseClient';
import { mockProperties } from '../../data/mockProperties';
import { initialMockBuyers, initialMockSellers } from '../../data/mockAdminData';
import AgentHeader from '../../components/AgentHeader';
import { Landmark, Users, ClipboardList, ArrowRight, TrendingUp, ShieldCheck } from 'lucide-react';

export default function AgentDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    propertiesCount: 0,
    buyersCount: 0,
    pendingSellersCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        if (isSupabaseConfigured) {
          // Live Supabase counts
          const { count: propsCount } = await supabase
            .from('properties')
            .select('*', { count: 'exact', head: true });

          const { count: buyersCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

          const { count: pendingSellers } = await supabase
            .from('seller_land_submissions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'Pending');

          setStats({
            propertiesCount: propsCount || 0,
            buyersCount: buyersCount || 0,
            pendingSellersCount: pendingSellers || 0
          });
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Error fetching admin counts from Supabase:', err);
      }

      // Mock Mode counts fallback
      // 1. Properties
      const localProps = localStorage.getItem('dharasetu_properties');
      const propsCount = localProps ? JSON.parse(localProps).length : mockProperties.length;

      // 2. Buyers
      const localBuyers = localStorage.getItem('dharasetu_mock_buyers');
      const buyersCount = localBuyers ? JSON.parse(localBuyers).length : initialMockBuyers.length;

      // 3. Pending sellers
      const localSellers = localStorage.getItem('dharasetu_mock_seller_submissions');
      const sellersList = localSellers ? JSON.parse(localSellers) : initialMockSellers;
      const pendingSellers = sellersList.filter(s => s.status === 'Pending').length;

      setStats({
        propertiesCount: propsCount,
        buyersCount: buyersCount,
        pendingSellersCount: pendingSellers
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  const cardList = [
    {
      title: 'Active Listings',
      count: stats.propertiesCount,
      desc: 'Total properties published in the public inventory catalog.',
      link: '/agent/properties',
      color: 'border-blue-100 bg-blue-50/20 text-blue-800',
      icon: Landmark
    },
    {
      title: 'Profiles',
      count: stats.buyersCount,
      desc: 'Registered user profiles.',
      link: '/agent/buyers',
      color: 'border-indigo-100 bg-indigo-50/20 text-indigo-800',
      icon: Users
    },
    {
      title: 'Pending Submissions',
      count: stats.pendingSellersCount,
      desc: 'Submissions from land owners awaiting verification callbacks.',
      link: '/agent/sellers',
      color: 'border-amber-100 bg-amber-50/20 text-amber-800',
      icon: ClipboardList
    }
  ];

  return (
    <div className="space-y-10" id="page-agent-dashboard-main">
      {/* Sub-Header nav layout */}
      <AgentHeader title="Overview" />

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(n => (
            <div key={n} className="bg-white rounded-2xl h-[180px] border border-gray-150" />
          ))}
        </div>
      ) : (
        <div className="space-y-8 animate-fadeIn">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cardList.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div 
                  key={idx}
                  className={`border rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow bg-white ${card.color.split(' ')[0]}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-xs uppercase font-extrabold tracking-widest text-brand-muted">{card.title}</span>
                      <span className="block font-outfit font-extrabold text-4xl text-brand">{card.count}</span>
                    </div>
                    <div className={`p-3 rounded-xl border ${card.color.split(' ')[1]}`}>
                      <Icon size={22} className={card.color.split(' ')[2]} />
                    </div>
                  </div>
                  <div className="space-y-3 pt-2">
                    <p className="text-xs text-gray-500 leading-relaxed">{card.desc}</p>
                    <Link
                      to={card.link}
                      className="text-xs font-bold text-brand hover:text-brand-dark flex items-center gap-1 hover:translate-x-1 transition-transform duration-200"
                    >
                      Open section <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Tip / Action Banner */}
          <section className="bg-brand-light/40 border border-brand-light/80 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex justify-center sm:justify-start items-center gap-1.5 text-brand font-outfit font-bold text-sm">
                <ShieldCheck size={16} />
                <h5>Broker Tip</h5>
              </div>
              <p className="text-xs text-gray-500 max-w-lg leading-relaxed">
                Always review the seller registries and verify title deeds with the local sub-registrar office survey data before converting submission status badges to "Converted".
              </p>
            </div>
            <Link
              to="/agent/properties"
              className="bg-brand hover:bg-brand-dark text-white font-bold text-xs px-5 py-3 rounded-lg shadow-sm transition-colors shrink-0"
            >
              + Add New Listing
            </Link>
          </section>
        </div>
      )}
    </div>
  );
}
