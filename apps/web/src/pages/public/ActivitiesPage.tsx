import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { formatDate } from '../../lib/utils.js';
import { Calendar, MapPin, Users } from 'lucide-react';

export const ActivitiesPage: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<any[]>('/content/activities')
      .then((data) => setActivities(data || []))
      .catch(() => setActivities([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="py-12 sm:py-20 space-y-12 w-full px-6 sm:px-10 lg:px-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-coral">Field Dispatches</span>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-brand-navy">
          Community Relief Activities & Drives
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Real-world photographic records of our relief camps, provisions distribution, medical screening, and educational kit handovers.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-coral border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500">Loading field activities...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities.map((act) => (
            <div
              key={act.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col"
            >
              <div className="h-52 overflow-hidden bg-slate-100">
                <img src={act.coverImage} alt={act.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-brand-coral" />
                    <span>{formatDate(act.date)}</span>
                    <span>•</span>
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{act.location}</span>
                  </div>
                  <h3 className="text-base font-serif font-bold text-brand-navy line-clamp-2">{act.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{act.description}</p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{act.category}</span>
                  <span className="font-semibold text-brand-coral flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1" /> {act.beneficiariesCount} Beneficiaries
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
