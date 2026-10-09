import React from 'react';
import { useDonationModal } from '../../context/DonationModalContext.js';
import { Utensils, GraduationCap, Stethoscope, Droplets, HeartHandshake, Heart } from 'lucide-react';

export const MissionPage: React.FC = () => {
  const { openDonationModal } = useDonationModal();

  const verticals = [
    {
      icon: Utensils,
      title: 'Annapurna Daily Meal & Ration Security',
      subtitle: 'Nutritional Care for Destitute Elders & Slum Households',
      description:
        'Operating a dedicated community kitchen that cooks warm, hygienic, and wholesome traditional meals every morning. We hand-deliver meals directly to 350+ bedridden and destitute seniors in suburban settlements. In addition, monthly 30-day dry ration grocery boxes (rice, dal, cooking oil, and spices) are distributed to single-mother families.',
      impactMetric: '350+ Daily Warm Meals | 1,650 Monthly Food Kits Distributed',
      image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
    },
    {
      icon: GraduationCap,
      title: 'Asha Deep: Girl Child STEM Scholarships',
      subtitle: 'Sponsoring High School & Collegiate Education for 200 Young Women',
      description:
        'Under Asha Deep, we adopt full annual academic fees, digital study tablets, bilingual textbooks, school bags, and uniform sets for meritorious young girls whose parents face acute financial distress. We provide weekend coaching, mentorship from women engineers, and college admission counseling.',
      impactMetric: '200+ Girl Scholars Supported | 45 Collegiate Laptops Handed Over',
      image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    },
    {
      icon: Stethoscope,
      title: 'Sanjeevani Mobile Rural Dispensary',
      subtitle: 'Doctor Consultations, Chronic Medications & Free Cataract Surgeries',
      description:
        'Our customized mobile medical van reaches remote village clusters on scheduled weekly visits, accompanied by a physician, geriatric nurse, and diagnostic lab equipment. We provide continuous supplies of essential diabetes and hypertension medications and conduct vision screenings with free corrective lens surgeries at accredited hospital partners.',
      impactMetric: '1,800+ Rural Patients Treated | 120+ Free Cataract Surgeries Sponsored',
      image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    },
    {
      icon: Droplets,
      title: 'Clean Drinking Water & Rural Infrastructure',
      subtitle: 'Solar Powered RO Purification Plants in Panchayat Schools',
      description:
        'Thousands of school children in rural belts suffer from fluorosis and bacterial waterborne illnesses due to untreated groundwater. We install robust, 1,000-liter-per-hour solar powered water purification plants in government schools, providing clean, safe drinking water to hundreds of children daily.',
      impactMetric: '6 Schools Equipped | 2,400 Students Drinking Clean Safe Water Daily',
      image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <div className="py-12 sm:py-20 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-coral">Core Service Verticals</span>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-brand-navy">
          Our Humanitarian Mission & Programs
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Through deliberate, localized initiatives, Bridge Of Love creates deep, verifiable impact where public infrastructure falls short.
        </p>
      </div>

      {/* Program Blocks */}
      <div className="space-y-12">
        {verticals.map((v, idx) => {
          const Icon = v.icon;
          const isEven = idx % 2 === 0;

          return (
            <div
              key={v.title}
              className={`bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-10 items-center ${
                isEven ? '' : 'lg:flex-row-reverse'
              }`}
            >
              <div className={`space-y-4 ${isEven ? 'lg:col-span-7' : 'lg:col-span-7 lg:order-2'}`}>
                <div className="inline-flex items-center space-x-2 bg-brand-coralLight text-brand-coral px-3 py-1 rounded-full text-xs font-bold">
                  <Icon className="w-4 h-4" />
                  <span>Program Initiative</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-brand-navy">{v.title}</h3>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-500">{v.subtitle}</h4>

                <p className="text-sm text-slate-600 leading-relaxed">{v.description}</p>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-brand-navy flex items-center space-x-2">
                  <HeartHandshake className="w-4 h-4 text-brand-coral shrink-0" />
                  <span>{v.impactMetric}</span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => openDonationModal()}
                    className="py-2.5 px-6 rounded-xl bg-brand-navy hover:bg-brand-coral text-white text-xs font-bold transition flex items-center space-x-2"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                    <span>Support This Initiative</span>
                  </button>
                </div>
              </div>

              <div
                className={`rounded-2xl overflow-hidden shadow-md bg-slate-100 aspect-[4/3] ${
                  isEven ? 'lg:col-span-5' : 'lg:col-span-5 lg:order-1'
                }`}
              >
                <img src={v.image} alt={v.title} className="w-full h-full object-cover" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
