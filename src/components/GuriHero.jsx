import GuriFilterBar from './GuriFilterBar';

const GuriHero = ({ onSearch, loading }) => {
    if (loading) {
        return (
            <section style={{ height: '680px', background: 'linear-gradient(135deg, #0d3b66 0%, #1a5f9e 100%)' }}
                className="flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            </section>
        );
    }

    return (
        <section
            style={{
                position: 'relative',
                minHeight: '600px',
                backgroundColor: '#0a1f3d',
                backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
            }}
        >
            {/* Overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to bottom, rgba(10,30,60,0.72) 0%, rgba(10,30,60,0.55) 60%, rgba(10,30,60,0.7) 100%)',
            }} />

            <div className="container w-full" style={{ position: 'relative', zIndex: 1 }}>
                {/* Badge */}
                <div className="flex justify-center mb-4">
                    <span style={{
                        background: 'rgba(255,255,255,0.15)',
                        border: '1px solid rgba(255,255,255,0.25)',
                        color: 'white',
                        borderRadius: '100px',
                        padding: '6px 18px',
                        fontSize: '13px',
                        fontWeight: 600,
                        backdropFilter: 'blur(8px)',
                        letterSpacing: '0.04em',
                    }}>
                        East Africa's #1 Real Estate Platform
                    </span>
                </div>

                {/* Headline */}
                <h1 style={{
                    color: 'white',
                    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                    fontWeight: 800,
                    textAlign: 'center',
                    lineHeight: 1.15,
                    letterSpacing: '-0.02em',
                    marginBottom: '10px',
                    textShadow: '0 2px 20px rgba(0,0,0,0.3)',
                }}>
                    Find Your Dream Home<br />
                    <span style={{ color: '#7eb8f7' }}>with Guri24</span>
                </h1>

                {/* Subheadline */}
                <p style={{
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: 'clamp(13px, 1.8vw, 17px)',
                    textAlign: 'center',
                    marginBottom: '28px',
                    fontWeight: 400,
                    lineHeight: 1.6,
                }}>
                    Thousands of verified properties across Kenya &amp; East Africa
                </p>

                {/* Search Bar */}
                <div style={{ maxWidth: '860px', margin: '0 auto' }}>
                    <GuriFilterBar onSearch={onSearch} />
                </div>

                {/* Trust indicators */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '8px 20px',
                    marginTop: '28px',
                }}>
                    {[
                        { num: '10+', text: 'Years Experience' },
                        { num: '2,000+', text: 'Happy Clients' },
                        { num: '1,500+', text: 'Properties' },
                    ].map(({ num, text }) => (
                        <div key={text} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '100px',
                            padding: '5px 14px',
                            backdropFilter: 'blur(4px)',
                        }}>
                            <span style={{
                                color: '#7eb8f7',
                                fontWeight: 800,
                                fontSize: 'clamp(12px, 1.5vw, 14px)',
                                whiteSpace: 'nowrap',
                            }}>{num}</span>
                            <span style={{
                                color: 'rgba(255,255,255,0.75)',
                                fontWeight: 500,
                                fontSize: 'clamp(11px, 1.4vw, 13px)',
                                whiteSpace: 'nowrap',
                            }}>{text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default GuriHero;
