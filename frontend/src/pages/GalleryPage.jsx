import { useState, useEffect } from 'react';
import { FiX, FiPlay, FiImage, FiVideo, FiMaximize2, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const GOLD = '#C9A84C';
const CATEGORIES = ['all', 'facilities', 'training', 'classes'];

function Lightbox({ item, onClose, onPrev, onNext }) {
  if (!item) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(17,17,17,0.95)' }}
      onClick={onClose}
      tabIndex={0}
      onKeyDown={e => { if (e.key==='Escape') onClose(); if (e.key==='ArrowRight') onNext(); if (e.key==='ArrowLeft') onPrev(); }}
      autoFocus
    >
      <button onClick={onClose} className="absolute top-5 right-5 w-10 h-10 rounded-full bg-cream/10 hover:bg-cream/20 flex items-center justify-center text-cream transition-colors z-10">
        <FiX size={20} />
      </button>
      <button onClick={e => { e.stopPropagation(); onPrev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-cream/10 hover:bg-cream/20 flex items-center justify-center text-cream text-2xl z-10">‹</button>
      <div onClick={e => e.stopPropagation()} className="max-w-5xl max-h-[85vh] w-full">
        <img src={item.url} alt={item.label} className="w-full h-full object-contain rounded-xl" />
        <p className="text-center text-cream/50 text-sm mt-4">{item.label}</p>
      </div>
      <button onClick={e => { e.stopPropagation(); onNext(); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-cream/10 hover:bg-cream/20 flex items-center justify-center text-cream text-2xl z-10">›</button>
    </div>
  );
}

export default function GalleryPage() {
  const { isAdmin } = useAuth();
  
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [lightboxItem, setLightboxItem] = useState(null);
  const [activeTab, setActiveTab] = useState('photos');
  
  // Admin Form State
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('photo');
  const [formData, setFormData] = useState({
    url: '', embedId: '', label: '', title: '', category: 'facilities', description: ''
  });

  const loadGallery = async () => {
    try {
      const res = await api.get('/gallery');
      setGallery(res.data.gallery);
    } catch (err) {
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const photos = gallery.filter(item => item.type === 'photo');
  const videos = gallery.filter(item => item.type === 'video');

  const filteredPhotos = category === 'all' ? photos : photos.filter(img => img.category === category);
  const currentIndex = filteredPhotos.findIndex(img => img._id === lightboxItem?._id);

  const handleAddMedia = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        type: formType,
        ...formData
      };
      // If photo, we can just use url as thumb for simplicity
      if (formType === 'photo' && !payload.thumb) {
        payload.thumb = payload.url;
      }
      await api.post('/gallery', payload);
      toast.success('Media added successfully');
      setShowForm(false);
      setFormData({ url: '', embedId: '', label: '', title: '', category: 'facilities', description: '' });
      loadGallery();
    } catch (err) {
      toast.error(err.response?.data?.error || err.message);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this media item?')) return;
    try {
      await api.delete(`/gallery/${id}`);
      toast.success('Media deleted');
      loadGallery();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <>
      {lightboxItem && (
        <Lightbox
          item={lightboxItem}
          onClose={() => setLightboxItem(null)}
          onPrev={() => setLightboxItem(filteredPhotos[(currentIndex - 1 + filteredPhotos.length) % filteredPhotos.length])}
          onNext={() => setLightboxItem(filteredPhotos[(currentIndex + 1) % filteredPhotos.length])}
        />
      )}

      {/* Admin Add Media Modal */}
      {showForm && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-jet/80 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-3xl text-jet">Add Media</h2>
              <button onClick={() => setShowForm(false)} className="text-jet/50 hover:text-jet"><FiX size={24} /></button>
            </div>
            
            <form onSubmit={handleAddMedia} className="space-y-4">
              <div>
                <label className="label">Media Type</label>
                <select className="input" value={formType} onChange={e => setFormType(e.target.value)}>
                  <option value="photo">Photo</option>
                  <option value="video">Video</option>
                </select>
              </div>

              {formType === 'photo' ? (
                <>
                  <div><label className="label">Image URL</label><input className="input" required placeholder="https://example.com/image.jpg" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} /></div>
                  <div><label className="label">Caption / Label</label><input className="input" required placeholder="Weight Room" value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} /></div>
                  <div>
                    <label className="label">Category</label>
                    <select className="input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      <option value="facilities">Facilities</option>
                      <option value="training">Training</option>
                      <option value="classes">Classes</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div><label className="label">YouTube Embed ID</label><input className="input" required placeholder="e.g. gey73xiS79A" value={formData.embedId} onChange={e => setFormData({...formData, embedId: e.target.value})} /></div>
                  <div><label className="label">Video Title</label><input className="input" required placeholder="Gym Tour" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
                  <div><label className="label">Description</label><textarea className="input" rows="2" placeholder="Video description..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
                </>
              )}

              <button type="submit" className="btn-primary w-full mt-2">Add to Gallery</button>
            </form>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-cream pb-16">

        {/* Header — jet band */}
        <div className="bg-jet text-cream pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: GOLD }}>Our Space</p>
              <h1 className="font-display text-6xl md:text-8xl leading-none text-cream">GALLERY</h1>
            </div>
            <p className="text-cream/40 max-w-sm leading-relaxed text-sm">
              Take a look inside FitForge — world-class equipment, premium facilities, and a community like no other.
            </p>
          </div>
        </div>

        {/* Tabs and Admin controls */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-6 flex justify-between items-end flex-wrap gap-4">
          <div className="flex gap-1 bg-white border border-jet/8 rounded-xl p-1 w-fit shadow-sm">
            {[
              { id: 'photos', icon: FiImage,  label: 'Photos',  count: photos.length },
              { id: 'videos', icon: FiVideo,  label: 'Videos',  count: videos.length },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={activeTab === t.id
                  ? { background: '#111111', color: '#F5F0E8' }
                  : { color: 'rgba(17,17,17,0.5)' }}
              >
                <t.icon size={14} />
                {t.label}
                <span className="text-xs opacity-60">({t.count})</span>
              </button>
            ))}
          </div>

          {isAdmin && (
            <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 py-2.5 px-5 text-sm">
              <FiPlus /> Add Media
            </button>
          )}
        </div>

        {loading ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-jet/40">
            Loading gallery...
          </div>
        ) : (
          <>
            {/* ── PHOTOS ── */}
            {activeTab === 'photos' && (
              <>
                {/* Category pills */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                  <div className="flex gap-2 flex-wrap">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className="px-4 py-2 rounded-full text-xs font-semibold border capitalize transition-all duration-200"
                        style={category === cat
                          ? { background: '#111111', color: '#F5F0E8', borderColor: '#111111' }
                          : { borderColor: 'rgba(17,17,17,0.15)', color: 'rgba(17,17,17,0.50)', background: 'transparent' }}
                      >
                        {cat === 'all' ? `All (${photos.length})` : cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Masonry grid */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
                    {filteredPhotos.map(img => (
                      <div
                        key={img._id}
                        className="break-inside-avoid group relative overflow-hidden rounded-xl cursor-pointer"
                        onClick={() => setLightboxItem(img)}
                      >
                        <img src={img.thumb || img.url} alt={img.label} loading="lazy" className="w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        
                        {/* Admin Delete overlay */}
                        {isAdmin && (
                          <button 
                            onClick={(e) => handleDelete(img._id, e)}
                            className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            title="Delete photo"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        )}
                        
                        <div className="absolute inset-0 transition-all duration-300 flex items-center justify-center" style={{ background: 'rgba(17,17,17,0)', }}>
                          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 text-center"
                            style={{ background: 'rgba(17,17,17,0.6)', borderRadius: '12px', padding: '8px 16px', backdropFilter: 'blur(4px)' }}>
                            <FiMaximize2 size={18} className="mx-auto mb-1" style={{ color: GOLD }} />
                            <p className="text-cream text-xs font-semibold">{img.label}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── VIDEOS ── */}
            {activeTab === 'videos' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {videos.map(video => (
                    <div key={video._id} className="group relative bg-white border border-jet/8 rounded-2xl overflow-hidden shadow-sm">
                      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                          className="absolute inset-0 w-full h-full"
                          src={`https://www.youtube.com/embed/${video.embedId}?rel=0&modestbranding=1`}
                          title={video.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      
                      {isAdmin && (
                        <button 
                          onClick={(e) => handleDelete(video._id, e)}
                          className="absolute top-2 right-2 p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg"
                          title="Delete video"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      )}

                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <FiPlay size={13} style={{ color: GOLD }} />
                          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: GOLD }}>Video</span>
                        </div>
                        <h3 className="font-bold text-lg text-jet mb-1">{video.title}</h3>
                        <p className="text-jet/40 text-sm">{video.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Stats bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: `${photos.length}+`, label: 'Photos' },
              { value: `${videos.length}`,  label: 'Videos' },
              { value: '4',                  label: 'Categories' },
            ].map(s => (
              <div key={s.label} className="bg-white border border-jet/8 rounded-2xl p-6 text-center shadow-sm">
                <p className="font-display text-4xl" style={{ color: GOLD }}>{s.value}</p>
                <p className="text-jet/40 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
