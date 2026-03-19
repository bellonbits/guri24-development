import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';

const blogPosts = [
    {
        id: 1,
        date: 'Feb 05, 2026',
        title: 'Nairobi Market Review: Why Westlands and Kileleshwa are Surging',
        readTime: '12 min',
        category: 'Market Trends',
        image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=75',
    },
    {
        id: 2,
        date: 'Jan 28, 2026',
        title: 'Top 5 Coastal Investment Opportunities for 2026',
        readTime: '7 min',
        category: 'Investment',
        image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600&q=75',
    },
    {
        id: 3,
        date: 'Jan 20, 2026',
        title: 'Kenyan Land Titles: A Guide for First-Time Buyers',
        readTime: '5 min',
        category: 'Guides',
        image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=75',
    },
    {
        id: 4,
        date: 'Jan 12, 2026',
        title: 'Interior Design Trends: Bringing Maasai Mara Aesthetic Home',
        readTime: '10 min',
        category: 'Design',
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=75',
    },
];

const BlogSection = () => {
    const navigate = useNavigate();

    return (
        <section className="section" style={{ background: '#f7f8fc' }}>
            <div className="container">
                {/* Section Header */}
                <div className="home-section-header flex justify-between items-end">
                    <div>
                        <span className="section-subtitle">★ News &amp; Insights</span>
                        <h2 style={{ margin: 0, fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700 }}>
                            Real Estate Blog
                        </h2>
                    </div>
                    <button
                        onClick={() => navigate('/blog')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'transparent',
                            border: '1.5px solid #d1d5db',
                            borderRadius: '100px',
                            padding: '10px 22px',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#374151',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#1a5f9e';
                            e.currentTarget.style.color = '#1a5f9e';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#d1d5db';
                            e.currentTarget.style.color = '#374151';
                        }}
                    >
                        Explore All <ArrowRight size={15} />
                    </button>
                </div>

                {/* Blog Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: '28px',
                }}>
                    {blogPosts.map((post) => (
                        <article
                            key={post.id}
                            onClick={() => navigate('/blog')}
                            style={{
                                background: 'white',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                border: '1px solid #f0f0f0',
                                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-6px)';
                                e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            {/* Image */}
                            <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    loading="lazy"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
                                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                />
                                <span style={{
                                    position: 'absolute',
                                    top: '12px',
                                    left: '12px',
                                    background: '#1a5f9e',
                                    color: 'white',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    padding: '3px 10px',
                                    borderRadius: '100px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                }}>
                                    {post.category}
                                </span>
                            </div>

                            {/* Content */}
                            <div style={{ padding: '20px' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '10px',
                                }}>
                                    <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600 }}>
                                        {post.date}
                                    </span>
                                    <span style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '12px',
                                        color: '#9ca3af',
                                        fontWeight: 500,
                                    }}>
                                        <Clock size={12} />
                                        {post.readTime}
                                    </span>
                                </div>
                                <h4 style={{
                                    fontSize: '15px',
                                    fontWeight: 700,
                                    color: '#111827',
                                    lineHeight: 1.45,
                                    margin: 0,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    transition: 'color 0.2s ease',
                                }}>
                                    {post.title}
                                </h4>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BlogSection;
