import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';

export const GalleryPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<any[]>('/content/gallery')
      .then((data) => setItems(data || []))
      .catch(() => setItems([]))
      .finally(() => setIsLoading(false));
  }, []);

  const categories = ['ALL', 'Food Relief', 'Education', 'Healthcare', 'Volunteers'];

  const filtered =
    selectedCategory === 'ALL'
      ? items
      : items.filter((i) => i.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <div className="py-12 sm:py-20 space-y-12 w-full px-6 sm:px-10 lg:px-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-coral">Visual Archives</span>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-brand-navy">
          Photo Gallery of Compassion
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Moments captured across our community kitchens, rural medical clinics, scholarship ceremonies, and volunteer packaging drives.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`py-2 px-4 rounded-xl text-xs font-semibold transition ${
              selectedCategory === cat
                ? 'bg-brand-navy text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat === 'ALL' ? 'All Photographs' : cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-coral border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500">Loading gallery archives...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 bg-brand-navy/90 text-white text-[10px] font-bold py-1 px-2.5 rounded-full">
                  {item.category}
                </div>
              </div>
              <div className="p-4 space-y-1">
                <h4 className="text-sm font-serif font-bold text-slate-800 leading-snug">{item.title}</h4>
                {item.caption && <p className="text-xs text-slate-500 line-clamp-2">{item.caption}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
