import { Building2, Users, Award } from 'lucide-react';

const AboutStats = () => {
    const stats = [
        { icon: <Award size={28} />, value: '10+', label: 'Years of Experience' },
        { icon: <Users size={28} />, value: '2,000+', label: 'Happy Clients' },
        { icon: <Building2 size={28} />, value: '1,500+', label: 'Verified Properties' }
    ];

    return (
        <section style={{ padding: '100px 24px', background: 'white' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '60px', alignItems: 'center' }}>
                    {/* Left: About Text */}
                    <div style={{ maxWidth: '600px' }}>
                        <div style={{
                            color: '#4a90e2',
                            fontSize: '13px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '1.5px',
                            marginBottom: '16px'
                        }}>
                            ★ About Us
                        </div>
                        <h2 style={{
                            fontSize: 'clamp(28px, 4vw, 42px)',
                            fontWeight: 700,
                            lineHeight: 1.2,
                            marginBottom: '24px',
                            color: '#1a1a1a'
                        }}>
                            We are a full-service property agency helping buyers, sellers, and investors make smarter real estate decisions.
                        </h2>
                        <p style={{
                            fontSize: '16px',
                            lineHeight: 1.7,
                            color: '#666',
                            marginBottom: '16px'
                        }}>
                            Our experienced agents blend deep market insight, modern technology, and personalized service to deliver transparent guidance, strong results, and long-term value.
                        </p>
                    </div>

                    {/* Right: Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', marginTop: '40px' }}>
                        {stats.map((stat, idx) => (
                            <div key={idx} style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '16px',
                                    background: '#e6f2ff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px',
                                    color: '#4a90e2'
                                }}>
                                    {stat.icon}
                                </div>
                                <div style={{ fontSize: '32px', fontWeight: 700, color: '#1a1a1a', marginBottom: '8px' }}>
                                    {stat.value}
                                </div>
                                <div style={{ fontSize: '14px', color: '#666' }}>
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutStats;
