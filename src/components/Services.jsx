import React from 'react';
import { Home, TrendingUp, Key, ArrowRight } from 'lucide-react';
import './Services.css';

const Services = ({ onNavigate }) => {
    const services = [
        {
            icon: <Home size={32} />,
            title: 'Buy Property',
            description: 'Find exceptional properties tailored to your lifestyle and budget. Our curated listings feature verified homes across prime locations.',
            link: '/listings?purpose=sale'
        },
        {
            icon: <TrendingUp size={32} />,
            title: 'Sell Property',
            description: 'List your property with expert guidance. We connect you with serious buyers and handle the entire sales process professionally.',
            link: '/contact'
        },
        {
            icon: <Key size={32} />,
            title: 'Rent Property',
            description: 'Discover quality rental properties from apartments to luxury homes. Flexible terms and verified listings for your peace of mind.',
            link: '/listings?purpose=rent'
        }
    ];

    return (
        <section className="services-section">
            <div className="container">
                <div className="section-title text-center">
                    <div className="section-subtitle">
                        ★ Our Services
                    </div>
                    <h2>
                        Comprehensive Real Estate Solutions
                    </h2>
                </div>

                <div className="services-grid">
                    {services.map((service, idx) => (
                        <div
                            key={idx}
                            className="service-card"
                            onClick={() => onNavigate && onNavigate(service.link)}
                        >
                            <div className="service-icon-box">
                                {service.icon}
                            </div>
                            <h3 className="service-title">
                                {service.title}
                            </h3>
                            <p className="service-description">
                                {service.description}
                            </p>
                            <div className="service-link">
                                Read More <ArrowRight size={18} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;
