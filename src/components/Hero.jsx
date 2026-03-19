import SearchBar from './SearchBar';

const Hero = ({ onSearch }) => {
    return (
        <section style={{
            position: 'relative',
            height: '650px',
            background: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{ maxWidth: '1200px', width: '100%', padding: '0 24px', textAlign: 'center' }}>
                <h1 style={{
                    color: 'white',
                    fontSize: 'clamp(36px, 6vw, 64px)',
                    fontWeight: 700,
                    marginBottom: '48px',
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em'
                }}>
                    Find Your Dream Property<br />with Confidence
                </h1>

                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <SearchBar onSearch={onSearch} />
                </div>
            </div>
        </section>
    );
};

export default Hero;
