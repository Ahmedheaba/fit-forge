import { useState } from 'react';
import { FiX, FiPlay, FiImage, FiVideo, FiMaximize2 } from 'react-icons/fi';

const GOLD = '#C9A84C';

const IMAGES = [
  { id: 1,  url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80', thumb: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=70', label: 'Main Floor',             category: 'facilities' },
  { id: 2,  url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80', thumb: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&q=70', label: 'Weight Room',            category: 'facilities' },
  { id: 3,  url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80', thumb: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=70', label: 'Strength Training',      category: 'training' },
  { id: 4,  url: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&q=80', thumb: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&q=70', label: 'CrossFit Box',           category: 'facilities' },
  { id: 5,  url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80', thumb: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=70', label: 'Cardio Zone',            category: 'facilities' },
  { id: 6,  url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80', thumb: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=70', label: 'Yoga Class',             category: 'classes' },
  { id: 7,  url: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&q=80', thumb: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=70', label: 'Dumbbell Area',          category: 'training' },
  { id: 8,  url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80', thumb: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=70', label: 'Personal Training',      category: 'training' },
  { id: 9,  url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80', thumb: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=70', label: 'Boxing Ring',            category: 'classes' },
  { id: 10, url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80', thumb: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&q=70', label: 'Cycling Studio',         category: 'classes' },
  { id: 11, url: 'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=800&q=80', thumb: 'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=400&q=70', label: 'HIIT Session',           category: 'classes' },
  { id: 12, url: 'https://images.unsplash.com/photo-1567598508481-65985588e295?w=800&q=80', thumb: 'https://images.unsplash.com/photo-1567598508481-65985588e295?w=400&q=70', label: 'Bench Press',            category: 'training' },
  { id: 13, url: 'https://images.unsplash.com/photo-1544033527-b192daee1f5b?w=800&q=80', thumb: 'https://images.unsplash.com/photo-1544033527-b192daee1f5b?w=400&q=70', label: 'Locker Rooms',           category: 'facilities' },
  { id: 14, url: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=800&q=80', thumb: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=400&q=70', label: 'Pilates Studio',         category: 'classes' },
  { id: 15, url: 'https://images.unsplash.com/photo-1530822847156-5df684ec5933?w=800&q=80', thumb: 'https://images.unsplash.com/photo-1530822847156-5df684ec5933?w=400&q=70', label: 'Kettlebell Training',    category: 'training' },
  { id: 16, url: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&q=80', thumb: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&q=70', label: 'Barbell Squat',         category: 'training' },
  { id: 17, url: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800&q=80', thumb: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=400&q=70', label: 'Recovery Zone',         category: 'facilities' },
  { id: 18, url: 'https://images.unsplash.com/photo-1558611012118-696072aa579a?w=800&q=80', thumb: 'https://images.unsplash.com/photo-1558611012118-696072aa579a?w=400&q=70', label: 'Group Fitness',         category: 'classes' },
];

const VIDEOS = [
  { id: 'v1', type: 'youtube', embedId: 'gey73xiS79A', title: 'FitForge Gym Tour',           description: 'Take a full tour of our world-class facilities.' },
  { id: 'v2', type: 'youtube', embedId: 'IODxDxX7oi4', title: 'Member Transformation Stories', description: 'Real results from real FitForge members.' },
];

const CATEGORIES = ['all', 'facilities', 'training', 'classes'];

function Lightbox({ item, onClose, onPrev, onNext }) {
  if (!item) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
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
  const [category, setCategory]     = useState('all');
  const [lightboxItem, setLightboxItem] = useState(null);
  const [activeTab, setActiveTab]   = useState('photos');

  const filtered = category === 'all' ? IMAGES : IMAGES.filter(img => img.category === category);
  const currentIndex = filtered.findIndex(img => img.id === lightboxItem?.id);

  return (
    <>
      {lightboxItem && (
        <Lightbox
          item={lightboxItem}
          onClose={() => setLightboxItem(null)}
          onPrev={() => setLightboxItem(filtered[(currentIndex - 1 + filtered.length) % filtered.length])}
          onNext={() => setLightboxItem(filtered[(currentIndex + 1) % filtered.length])}
        />
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

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-6">
          <div className="flex gap-1 bg-white border border-jet/8 rounded-xl p-1 w-fit shadow-sm">
            {[
              { id: 'photos', icon: FiImage,  label: 'Photos',  count: IMAGES.length },
              { id: 'videos', icon: FiVideo,  label: 'Videos',  count: VIDEOS.length },
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
        </div>

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
                    {cat === 'all' ? `All (${IMAGES.length})` : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Masonry grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
                {filtered.map(img => (
                  <div
                    key={img.id}
                    className="break-inside-avoid group relative overflow-hidden rounded-xl cursor-pointer"
                    onClick={() => setLightboxItem(img)}
                  >
                    <img src={img.thumb} alt={img.label} loading="lazy" className="w-full object-cover transition-transform duration-500 group-hover:scale-105" />
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
            <div className="bg-white border border-jet/8 rounded-2xl p-5 mb-8 flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${GOLD}15`, border: `1.5px solid ${GOLD}40` }}>
                <FiVideo size={16} style={{ color: GOLD }} />
              </div>
              <div>
                <p className="font-semibold text-sm text-jet mb-1">Adding Your Own Videos</p>
                <p className="text-jet/40 text-xs leading-relaxed">
                  Copy the YouTube video ID from the URL (e.g. youtube.com/watch?v=<span className="font-mono" style={{ color: GOLD }}>gey73xiS79A</span>) and replace it in the VIDEOS array in <span className="font-mono" style={{ color: GOLD }}>GalleryPage.jsx</span>.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {VIDEOS.map(video => (
                <div key={video.id} className="bg-white border border-jet/8 rounded-2xl overflow-hidden shadow-sm">
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

        {/* Stats bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: `${IMAGES.length}+`, label: 'Photos' },
              { value: `${VIDEOS.length}`,  label: 'Videos' },
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
