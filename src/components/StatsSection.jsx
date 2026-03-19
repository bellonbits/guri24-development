import React from 'react';
import { Users, Building2, Award } from 'lucide-react';
import './StatsSection.css';

const StatsSection = () => {
    const stats = [
        {
            icon: <Award size={28} />,
            value: '10+',
            label: 'Years of Experience',
            color: '#1a5f9e',
        },
        {
            icon: <Users size={28} />,
            value: '2,000+',
            label: 'Happy Clients',
            color: '#0d3b66',
        },
        {
            icon: <Building2 size={28} />,
            value: '1,500+',
            label: 'Verified Properties',
            color: '#3498db',
        },
    ];

    return (
        <section className="section" style={{ background: '#f0f4f9', paddingTop: '3rem', paddingBottom: '3rem' }}>
            <div className="container">
                <div className="stats-grid-main">
                    {/* Content */}
                    <div>
                        <h2 className="stats-about-title">
                            Your trusted partner for smarter real estate decisions
                        </h2>
                        <p className="stats-about-desc">
                            Our experienced agents blend deep market insight, modern technology, and personalized service to deliver transparent guidance, strong results, and long-term value across East Africa.
                        </p>
                        <a
                            href="/about"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginTop: '24px',
                                color: '#1a5f9e',
                                fontWeight: 700,
                                fontSize: '15px',
                                textDecoration: 'none',
                                transition: 'gap 0.2s ease',
                            }}
                        >
                            Learn more about us →
                        </a>
                    </div>

                    {/* Stats Grid */}
                    <div className="stats-numbers-grid">
                        {stats.map((stat, index) => (
                            <div key={index} className="stat-item">
                                <div
                                    className="stat-icon-wrapper"
                                    style={{ background: `${stat.color}12`, borderColor: `${stat.color}20`, color: stat.color }}
                                >
                                    {stat.icon}
                                </div>
                                <span className="stat-value">
                                    {stat.value}
                                </span>
                                <span className="stat-label">
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StatsSection;
