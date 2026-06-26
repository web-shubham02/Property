import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { mockProperties, formatPrice } from '../data/mockProperties';
import { Search, MapPin, AreaChart, RotateCcw, AlertCircle } from 'lucide-react';

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        if (isSupabaseConfigured) {
          const { data, error } = await supabase
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (!error && data && data.length > 0) {
            setProperties(data);
            setFilteredProperties(data.filter(p => p.status === 'Available'));
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Error loading properties from Supabase, loading mock:', err);
      }
      
      // Fallback
      setProperties(mockProperties);
      setFilteredProperties(mockProperties.filter(p => p.status === 'Available'));
      setLoading(false);
    };

    fetchProperties();
  }, []);

  // Handle Filtering
  useEffect(() => {
    let result = properties.filter(p => p.status === 'Available');

    // Search Query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        p => 
          p.title.toLowerCase().includes(query) || 
          p.location.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // Location filter
    if (selectedLocation !== 'All') {
      result = result.filter(p => p.location.toLowerCase().includes(selectedLocation.toLowerCase()));
    }

    // Land type filter (commercial / agricultural / residential)
    if (selectedType !== 'All') {
      result = result.filter(p => p.title.toLowerCase().includes(selectedType.toLowerCase()) || p.description.toLowerCase().includes(selectedType.toLowerCase()));
    }

    setFilteredProperties(result);
  }, [searchQuery, selectedLocation, selectedType, properties]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedLocation('All');
    setSelectedType('All');
  };

  // Extract unique locations from mock/real data for filter options
  const locations = ['All', ...new Set(properties.map(p => {
    // Return base city or sub-area
    if (p.location.includes(', ')) {
      return p.location.split(', ').pop();
    }
    return p.location;
  }))];

  return (
    <div className="space-y-10 font-sans" id="page-properties-browse">
      {/* Page Header */}
      <div className="space-y-2">
        <span className="text-xs uppercase font-bold tracking-widest text-brand-muted">Verified Inventory</span>
        <h1 className="text-4xl font-extrabold font-outfit text-brand">Browse Available Land</h1>
        <p className="text-gray-500 text-sm">Find verified residential, commercial, or agricultural plots. Contact our agent to close details offline.</p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search bar */}
          <div className="relative md:col-span-6">
            <Search className="absolute left-3.5 top-3 text-gray-400 shrink-0" size={18} />
            <input 
              type="text" 
              placeholder="Search by title, location, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
            />
          </div>

          {/* Location Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
            >
              <option value="All">All Locations</option>
              {locations.filter(l => l !== 'All').map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Type Dropdown */}
          <div className="md:col-span-3 flex gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
            >
              <option value="All">All Land Types</option>
              <option value="Residential">Residential Plots</option>
              <option value="Agricultural">Agricultural Land</option>
              <option value="Commercial">Commercial Sites</option>
            </select>

            <button 
              onClick={handleReset}
              title="Reset Filters"
              className="p-2.5 rounded-lg border border-gray-200 text-gray-500 hover:text-brand hover:bg-gray-50 transition-colors shrink-0"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Property Count & Listings Grid */}
      <div className="space-y-6">
        <div className="text-xs font-semibold text-gray-500">
          Showing {filteredProperties.length} available {filteredProperties.length === 1 ? 'plot' : 'plots'}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-xl h-[380px] border border-gray-150 animate-pulse" />
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="bg-white border border-gray-150 rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
            <AlertCircle className="text-brand-muted w-10 h-10 mx-auto" />
            <h3 className="font-bold text-brand font-outfit">No Matching Plots Found</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              We couldn't find any available land matches with your current search query or filter tags. Try resetting filters.
            </p>
            <button 
              onClick={handleReset}
              className="bg-brand hover:bg-brand-dark text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <div 
                key={property.id} 
                className="group bg-white rounded-2xl overflow-hidden border border-gray-150 hover:border-brand/10 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1"
              >
                {/* Photo */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 shrink-0">
                  <img 
                    src={property.photos?.[0] || '/plot_residential.png'} 
                    alt={property.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-brand text-white font-bold text-xs px-3.5 py-1.5 rounded-full shadow-md">
                    {formatPrice(property.price)}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-outfit font-extrabold text-lg text-brand leading-snug line-clamp-2">
                      {property.title}
                    </h3>
                    <div className="flex flex-col gap-1.5 text-xs text-gray-500 font-medium">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} className="text-brand/75 shrink-0" />
                        <span className="truncate">{property.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <AreaChart size={14} className="text-brand/75 shrink-0" />
                        <span>Size: {property.size}</span>
                      </div>
                    </div>
                  </div>

                  <Link 
                    to={`/properties/${property.id}`}
                    className="w-full text-center bg-brand-light text-brand group-hover:bg-brand group-hover:text-white font-bold text-xs py-3 rounded-lg transition-all duration-200 block shadow-sm border border-brand/5"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
