import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { mockProperties, formatPrice } from '../../data/mockProperties';
import AgentHeader from '../../components/AgentHeader';
import { Plus, Edit2, Trash2, X, PlusCircle, AlertCircle, Image as ImageIcon, Video } from 'lucide-react';

export default function AgentProperties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingId, setEditingId] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [size, setSize] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Available');
  const [videoUrl, setVideoUrl] = useState('');
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [photoFiles, setPhotoFiles] = useState([]); // for live files upload
  
  // UI states
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch properties helper
  const loadProperties = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error) {
          setProperties(data);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error('Error fetching admin properties from Supabase:', err);
    }

    // Mock Mode fallback
    const localProps = localStorage.getItem('dharasetu_properties');
    if (localProps) {
      setProperties(JSON.parse(localProps));
    } else {
      localStorage.setItem('dharasetu_properties', JSON.stringify(mockProperties));
      setProperties(mockProperties);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProperties();
  }, []);

  // Modal Open Handlers
  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditingId(null);
    setTitle('');
    setPrice('');
    setLocation('');
    setSize('');
    setDescription('');
    setStatus('Available');
    setVideoUrl('');
    setExistingPhotos([]);
    setPhotoFiles([]);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (property) => {
    setModalMode('edit');
    setEditingId(property.id);
    setTitle(property.title);
    setPrice(property.price);
    setLocation(property.location);
    setSize(property.size);
    setDescription(property.description);
    setStatus(property.status);
    setVideoUrl(property.video_url || '');
    setExistingPhotos(property.photos || []);
    setPhotoFiles([]);
    setFormError('');
    setIsModalOpen(true);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim() || !price || !location.trim() || !size.trim() || !description.trim()) {
      setFormError('Please fill in all mandatory fields.');
      return;
    }

    setSubmitting(true);
    try {
      let uploadedPhotoUrls = [...existingPhotos];

      // Handle photos uploads in Live Supabase mode
      if (isSupabaseConfigured && photoFiles.length > 0) {
        for (let file of photoFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('property-media')
            .upload(filePath, file);

          if (uploadError) {
            throw new Error(`Media upload failed: ${uploadError.message}`);
          }

          const { data: { publicUrl } } = supabase.storage
            .from('property-media')
            .getPublicUrl(filePath);
            
          uploadedPhotoUrls.push(publicUrl);
        }
      } else if (!isSupabaseConfigured && photoFiles.length > 0) {
        // Mock mode file upload fallback: use default mock photos
        uploadedPhotoUrls.push('/plot_residential.png');
      }

      if (uploadedPhotoUrls.length === 0) {
        // Ensure at least one image is saved
        uploadedPhotoUrls.push('/plot_residential.png');
      }

      const propertyPayload = {
        title,
        price: parseFloat(price),
        location,
        size,
        description,
        status,
        photos: uploadedPhotoUrls,
        video_url: videoUrl,
        created_by: user.id
      };

      if (isSupabaseConfigured) {
        if (modalMode === 'add') {
          const { error } = await supabase
            .from('properties')
            .insert(propertyPayload);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('properties')
            .update(propertyPayload)
            .eq('id', editingId);
          if (error) throw error;
        }
      } else {
        // Mock Mode persistence in localStorage
        const localProps = JSON.parse(localStorage.getItem('dharasetu_properties') || '[]');
        if (modalMode === 'add') {
          const newProperty = {
            id: 'prop-' + Math.random().toString(36).substr(2, 9),
            ...propertyPayload,
            created_at: new Date().toISOString()
          };
          localProps.unshift(newProperty);
        } else {
          const index = localProps.findIndex(p => p.id === editingId);
          if (index !== -1) {
            localProps[index] = {
              ...localProps[index],
              ...propertyPayload
            };
          }
        }
        localStorage.setItem('dharasetu_properties', JSON.stringify(localProps));
      }

      setIsModalOpen(false);
      await loadProperties();
    } catch (err) {
      console.error('Error submitting form:', err);
      setFormError(err.message || 'An error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Handler
  const handleDelete = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this property listing? This action is irreversible.')) {
      return;
    }

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('properties')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } else {
        const localProps = JSON.parse(localStorage.getItem('dharasetu_properties') || '[]');
        const updated = localProps.filter(p => p.id !== id);
        localStorage.setItem('dharasetu_properties', JSON.stringify(updated));
      }
      await loadProperties();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const getStatusText = (st) => {
    switch (st) {
      case 'Sold':
        return <span className="px-2.5 py-1 text-[10px] font-bold bg-gray-100 text-gray-700 rounded-full border border-gray-200">Sold</span>;
      case 'On Hold':
        return <span className="px-2.5 py-1 text-[10px] font-bold bg-amber-50 text-amber-600 rounded-full border border-amber-200">On Hold</span>;
      default:
        return <span className="px-2.5 py-1 text-[10px] font-bold bg-green-50 text-green-700 rounded-full border border-green-200">Available</span>;
    }
  };

  return (
    <div className="space-y-8" id="page-agent-properties-list">
      {/* Admin header */}
      <AgentHeader title="Manage Land Listings" />

      {/* Actions toolbar */}
      <div className="flex justify-between items-center bg-white border border-gray-150 p-4 rounded-xl shadow-sm">
        <span className="text-xs text-gray-500 font-semibold">{properties.length} total plots registered</span>
        <button
          onClick={handleOpenAddModal}
          id="btn-admin-add-property"
          className="bg-brand hover:bg-brand-dark text-white font-bold text-xs px-4.5 py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Plus size={16} /> Add New Land
        </button>
      </div>

      {/* Main Catalog Table */}
      {loading ? (
        <div className="bg-white border border-gray-150 rounded-2xl h-[300px] animate-pulse" />
      ) : properties.length === 0 ? (
        <div className="bg-white border border-gray-150 p-12 text-center text-xs text-gray-500 rounded-2xl shadow-sm">
          No land items in inventory. Click "+ Add New Land" to begin listing.
        </div>
      ) : (
        <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead className="bg-gray-50 border-b border-gray-150 font-outfit uppercase font-extrabold text-[10px] tracking-wider text-brand-muted">
                <tr>
                  <th className="py-4 px-6">Land Title</th>
                  <th className="py-4 px-4">Location</th>
                  <th className="py-4 px-4">Size</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Price</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-600">
                {properties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                          <img 
                            src={property.photos?.[0] || '/plot_residential.png'} 
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-semibold text-brand truncate max-w-[200px] block" title={property.title}>
                          {property.title}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs font-medium truncate max-w-[120px]" title={property.location}>
                      {property.location}
                    </td>
                    <td className="py-4 px-4 text-xs">{property.size}</td>
                    <td className="py-4 px-4">{getStatusText(property.status)}</td>
                    <td className="py-4 px-4 font-bold text-brand">{formatPrice(property.price)}</td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleOpenEditModal(property)}
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-brand hover:bg-gray-100 transition-colors"
                          title="Edit Listing"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(property.id)}
                          className="p-1.5 rounded-lg border border-gray-200 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                          title="Delete Listing"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FORM MODAL DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-gray-150 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 p-6 animate-scaleIn">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-xl font-bold font-outfit text-brand">
                {modalMode === 'add' ? 'Add New Land Plot' : 'Edit Land Details'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-brand p-1 rounded-lg hover:bg-gray-100 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Error alerts */}
            {formError && (
              <div className="bg-red-50 text-red-700 text-xs px-3.5 py-2.5 rounded-lg border border-red-200 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs md:text-sm">
              
              {/* Title */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-brand block">Property Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2400 sq.ft Residential Gated Plot in Sarjapur"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-brand focus:ring-1 focus:ring-brand text-xs font-semibold"
                />
              </div>

              {/* Price & Size row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-brand block">Price (INR) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 4500000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-brand focus:ring-1 focus:ring-brand text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-brand block">Land Size *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2,400 Sq.Ft. or 2.5 Acres"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-brand focus:ring-1 focus:ring-brand text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Location & Status row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-brand block">Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Whitefield East, Bangalore"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-brand focus:ring-1 focus:ring-brand text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-brand block">Listing Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-brand focus:ring-1 focus:ring-brand text-xs font-semibold bg-white"
                  >
                    <option value="Available">Available</option>
                    <option value="Sold">Sold</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-brand block">Detailed Description *</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Describe the soil type, boundary walls, legal approvals, water source, distance from major highway etc..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-brand focus:ring-1 focus:ring-brand text-xs font-semibold"
                />
              </div>

              {/* Photos & Videos links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-brand block flex items-center gap-1">
                    <ImageIcon size={12} /> Photo Upload
                  </label>
                  
                  {isSupabaseConfigured ? (
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setPhotoFiles([...e.target.files])}
                      className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-brand-light file:text-brand hover:file:bg-brand/10 transition-colors"
                    />
                  ) : (
                    <div className="p-2.5 rounded-lg border border-amber-250 bg-amber-50/50 text-[10px] text-amber-800 leading-normal">
                      <strong>Mock Mode:</strong> File uploads bypassed. Saving listing will auto-bind standard beautiful mock assets.
                    </div>
                  )}
                  {modalMode === 'edit' && existingPhotos.length > 0 && (
                    <div className="text-[10px] text-gray-400 italic">
                      Currently: {existingPhotos.length} images saved.
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-brand block flex items-center gap-1">
                    <Video size={12} /> YouTube Video URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="e.g. https://www.youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-brand focus:ring-1 focus:ring-brand text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-500 font-bold rounded-lg hover:bg-gray-50 transition-colors text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-brand hover:bg-brand-dark text-white font-bold rounded-lg transition-colors text-xs flex items-center gap-1.5"
                >
                  {submitting ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    modalMode === 'add' ? 'Publish Listing' : 'Save Changes'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
