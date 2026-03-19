import React from 'react';
import { useTranslation } from 'react-i18next';

function ServicesPage() {
    const { t } = useTranslation();

    return (
        <div className="bg-white min-h-screen pt-40 pb-20">
            <div className="max-w-[1200px] mx-auto px-10">
                <h1 className="text-[3.5rem] font-bold text-text-dark tracking-tight mb-12">Our Services</h1>
                <div className="grid grid-cols-3 gap-12 md:grid-cols-1">
                    {[
                        { title: 'Property Management', desc: 'Comprehensive management of your properties, from tenant search to maintenance.' },
                        { title: 'Investment Consulting', desc: 'Expert advice on real estate market trends and high-yield opportunities.' },
                        { title: 'Short-term Rentals', desc: 'Boost your ROI with our specialized short-term rental management services.' },
                    ].map((s, i) => (
                        <div key={i} className="p-10 bg-gray-50 rounded-[40px] border border-gray-100 hover:bg-white hover:shadow-xl hover:border-primary/20 transition-all duration-300 group">
                            <h3 className="text-2xl font-bold text-text-dark mb-4 group-hover:text-primary transition-colors">{s.title}</h3>
                            <p className="text-text-light font-medium leading-relaxed">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ServicesPage;
