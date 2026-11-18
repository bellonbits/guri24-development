import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, TrendingUp, Key, ArrowRight, Search, ShieldCheck, CalendarCheck, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import PropertyCard from '../components/PropertyCard';
import GuriHero from '../components/GuriHero';
import StatsSection from '../components/StatsSection';

import { propertyApi, transformProperty } from '../utils/propertyApi';
import { fadeUp, staggerContainer, viewportOnce } from '../utils/animations';
import SEO from '../components/SEO';
import './HomePage.css';

/**
 * B11. Mandatory Tagline Reveal Section
 * Words transition individually from 28% opacity to 100% opacity in reading order
 * as they cross the viewport trigger line using a requestAnimationFrame-throttled scroll observer,
 * and render at full opacity immediately under prefers-reduced-motion.
 */
const TaglineRevealSection = ({ text }) => {
    const containerRef = useRef(null);
    const words = text.split(' ');
    const [activeWordCount, setActiveWordCount] = useState(0);
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
        if (mq?.matches) {
            setReducedMotion(true);
            setActiveWordCount(words.length);
            return;
        }

        let ticking = false;
        const updateWords = () => {
            ticking = false;
            const el = containerRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const vh = window.innerHeight || document.documentElement.clientHeight;
            // Start revealing when top enters 82% of viewport height, finish by 32% of viewport height
            const startY = vh * 0.82;
            const endY = vh * 0.32;
            const progress = Math.max(0, Math.min(1, (startY - rect.top) / (startY - endY)));
            const count = Math.round(progress * words.length);
            setActiveWordCount(count);
        };

        const onScrollOrResize = () => {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(updateWords);
            }
        };

        updateWords();
        window.addEventListener('scroll', onScrollOrResize, { passive: true });
        window.addEventListener('resize', onScrollOrResize, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScrollOrResize);
            window.removeEventListener('resize', onScrollOrResize);
        };
    }, [words.length]);

    return (
        <section className="tagline-reveal-section" aria-label="Core value statement">
            <div className="container">
                <p ref={containerRef} className="heading-2 tagline-reveal-text">
                    {words.map((word, idx) => {
                        const isActive = reducedMotion || idx < activeWordCount;
                        return (
                            <span
                                key={idx}
                                className={`tagline-word ${isActive ? 'is-active' : ''}`}
                            >
                                {word}{' '}
                            </span>
                        );
                    })}
                </p>
            </div>
        </section>
    );
};

const HomePage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [featuredProperties, setFeaturedProperties] = useState(() => {
        try {
            const cached = sessionStorage.getItem('guri24_featured_properties');
            return cached ? JSON.parse(cached) : [];
        } catch {
            return [];
        }
    });
    const [loading, setLoading] = useState(() => {
        return !sessionStorage.getItem('guri24_featured_properties');
    });

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                if (!sessionStorage.getItem('guri24_featured_properties')) {
                    setLoading(true);
                }
                const response = await propertyApi.getProperties({ page: 1, page_size: 4 });

                let propertiesList = [];
                if (Array.isArray(response)) {
                    propertiesList = response;
                } else if (response?.properties && Array.isArray(response.properties)) {
                    propertiesList = response.properties;
                } else if (response?.items && Array.isArray(response.items)) {
                    propertiesList = response.items;
                } else if (response?.data?.properties && Array.isArray(response.data.properties)) {
                    propertiesList = response.data.properties;
                } else if (response?.items?.properties && Array.isArray(response.items.properties)) {
                    propertiesList = response.items.properties;
                }

                const transformed = propertiesList.map(p => {
                    try {
                        return transformProperty(p);
                    } catch {
                        return null;
                    }
                }).filter(p => p !== null);

                setFeaturedProperties(transformed);
                try {
                    sessionStorage.setItem('guri24_featured_properties', JSON.stringify(transformed));
                } catch {}
            } catch (error) {
                console.error('HomePage: Failed to fetch properties:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, []);

    const services = [
        {
            icon: <Home size={22} strokeWidth={1.5} />,
            title: t('home.buy_title', 'Buy a verified home'),
            description: t('home.buy_desc', 'Inspect title deeds, compare neighborhood prices, and close directly with vetted property owners and licensed agents.'),
            link: '/listings?purpose=sale',
            linkText: t('home.buy_link', 'Browse homes for sale')
        },
        {
            icon: <TrendingUp size={22} strokeWidth={1.5} />,
            title: t('home.sell_title', 'List and sell faster'),
            description: t('home.sell_desc', 'Reach 2,000+ active buyers and investors across East Africa with verified photography and qualified viewing requests.'),
            link: '/contact',
            linkText: t('home.sell_link', 'List your property')
        },
        {
            icon: <Key size={22} strokeWidth={1.5} />,
            title: t('home.rent_title', 'Rent or book a stay'),
            description: t('home.rent_desc', 'Move into long term apartments or book furnished short stays in Nairobi, Mombasa, and across East Africa with clear terms.'),
            link: '/listings?purpose=rent',
            linkText: t('home.rent_link', 'Explore rentals and stays')
        }
    ];

    const howItWorksSteps = [
        {
            step: '01',
            icon: <Search size={20} strokeWidth={1.5} />,
            title: 'Filter by neighborhood and budget',
            description: 'Compare inspected homes, apartments, land, and short stays with upfront KES pricing and exact location data.'
        },
        {
            step: '02',
            icon: <CalendarCheck size={20} strokeWidth={1.5} />,
            title: 'Schedule a viewing or instant stay',
            description: 'Book an in person viewing with a verified Guri24 agent or reserve your short stay dates directly online.'
        },
        {
            step: '03',
            icon: <ShieldCheck size={20} strokeWidth={1.5} />,
            title: 'Move in with verified documentation',
            description: 'Every agent on Guri24 passes national ID and credential verification before their listings go live.'
        }
    ];

    const faqs = [
        {
            q: 'How does Guri24 verify properties and agents before listing?',
            a: 'Every agent submits government identification, business credentials, and property ownership or agency authorization before our compliance team approves their account.'
        },
        {
            q: 'Are there any hidden viewing or buyer platform fees?',
            a: 'Browsing properties and contacting verified agents on Guri24 is completely free for buyers and tenants. All property prices and nightly stay rates are shown upfront.'
        },
        {
            q: 'Can I book furnished short stays as well as long term rentals?',
            a: 'Yes. Select Short stay in the search bar or visit the Stays tab to book vetted furnished apartments and villas by the night.'
        },
        {
            q: 'How quickly can I arrange a property viewing in Nairobi or Mombasa?',
            a: 'Most verified agents respond to viewing requests within 2 hours during business hours through phone, WhatsApp, or direct platform inquiry.'
        },
        {
            q: 'How do I list my property or register as an agent on Guri24?',
            a: 'Create a free account, switch to Agent application in your profile, and upload your verification documents. Our team reviews applications within 24 hours.'
        },
        {
            q: 'Which regions across East Africa does Guri24 cover?',
            a: 'We cover major residential and commercial hubs across Kenya including Nairobi, Mombasa, Naivasha, Kisumu, and Nakuru, as well as growing East African markets.'
        }
    ];

    return (
        <div className="home-page">
            <SEO
                title="Find Your Dream Property with Confidence"
                description="Search thousands of verified properties for sale, rent, and short stays across East Africa. Transparent pricing and vetted local agents."
            />

            <GuriHero
                onSearch={(filters) => {
                    const params = new URLSearchParams();
                    if (filters.location) params.append('search', filters.location);
                    if (filters.type && filters.type !== 'all') params.append('type', filters.type);
                    if (filters.priceRange && filters.priceRange !== 'all') params.append('max_price', filters.priceRange);
                    navigate(`/listings?${params.toString()}`);
                }}
            />

            <StatsSection />

            {/* Featured Properties Section */}
            <section className="section bg-white">
                <div className="container">
                    <motion.div
                        className="home-section-header flex flex-wrap justify-between items-end gap-4"
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={viewportOnce}
                    >
                        <div>
                            <span className="section-subtitle">{t('home.featured_badge', 'Featured listings')}</span>
                            <h2 className="heading-3 m-0">{t('home.featured_title', 'Verified homes ready for viewing')}</h2>
                        </div>
                        <button
                            type="button"
                            className="home-outline-btn button-sm"
                            onClick={() => navigate('/listings')}
                        >
                            <span>{t('home.explore_all', 'Explore all properties')}</span>
                            <ArrowRight size={16} aria-hidden="true" />
                        </button>
                    </motion.div>

                    {/* B9: Skeleton loaders shaped like real layout, never circular spinners */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" aria-busy="true" aria-label="Loading featured properties">
                            {[0, 1, 2, 3].map((idx) => (
                                <div key={idx} className="property-skeleton-card">
                                    <div className="skeleton-block property-skeleton-img" />
                                    <div className="property-skeleton-body">
                                        <div className="skeleton-block" style={{ width: '45%', height: '12px', marginBottom: '12px' }} />
                                        <div className="skeleton-block" style={{ width: '85%', height: '20px', marginBottom: '16px' }} />
                                        <div className="skeleton-block" style={{ width: '65%', height: '14px', marginBottom: '24px' }} />
                                        <div className="property-skeleton-footer">
                                            <div className="skeleton-block" style={{ width: '40%', height: '20px' }} />
                                            <div className="skeleton-block" style={{ width: '32%', height: '32px', borderRadius: '8px' }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : featuredProperties.length === 0 ? (
                        <div className="home-empty-card">
                            <p className="title-2" style={{ color: 'var(--gray-700)', marginBottom: '8px' }}>
                                {t('home.no_properties', 'New verified listings are being added')}
                            </p>
                            <p className="body-5" style={{ color: 'var(--gray-500)', marginBottom: '24px' }}>
                                Browse our full catalog or contact a Guri24 advisor to match your exact criteria.
                            </p>
                            <button
                                type="button"
                                className="btn btn-primary button-sm"
                                onClick={() => navigate('/listings')}
                            >
                                {t('home.view_all_listings', 'Browse all listings')}
                            </button>
                        </div>
                    ) : (
                        <motion.div
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={viewportOnce}
                        >
                            {featuredProperties.map((property, i) => (
                                <PropertyCard key={property.id} property={property} index={i} />
                            ))}
                        </motion.div>
                    )}
                </div>
            </section>

            {/* B11. Mandatory Tagline Reveal Section */}
            <TaglineRevealSection
                text={t(
                    'home.tagline_reveal',
                    'Every home on Guri24 is verified by local experts so you can buy, rent, or book across East Africa with total confidence and zero guesswork.'
                )}
            />

            {/* Benefits / Services Section */}
            <section className="section" style={{ backgroundColor: 'var(--gray-50)' }}>
                <div className="container">
                    <motion.div
                        className="home-section-header text-center"
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={viewportOnce}
                    >
                        <span className="section-subtitle">{t('home.services_badge', 'Built for buyers, tenants, and owners')}</span>
                        <h2 className="heading-3 m-0">{t('home.services_title', 'One platform for every real estate move')}</h2>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={viewportOnce}
                    >
                        {services.map((service, index) => (
                            <motion.div
                                key={index}
                                className="card-minimal"
                                variants={fadeUp}
                                custom={index}
                            >
                                <div className="service-icon-wrapper" aria-hidden="true">{service.icon}</div>
                                <h3 className="heading-5" style={{ marginBottom: '12px', color: 'var(--gray-900)' }}>{service.title}</h3>
                                <p className="body-3" style={{ color: 'var(--gray-500)', marginBottom: '24px' }}>
                                    {service.description}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => navigate(service.link)}
                                    className="service-link button-sm"
                                >
                                    <span>{service.linkText}</span>
                                    <ArrowRight size={16} aria-hidden="true" />
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* A2.8 How It Works (3 steps) */}
            <section className="section bg-white">
                <div className="container">
                    <motion.div
                        className="home-section-header text-center"
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={viewportOnce}
                    >
                        <span className="section-subtitle">How Guri24 works</span>
                        <h2 className="heading-3 m-0">From search to keys in three clear steps</h2>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={viewportOnce}
                    >
                        {howItWorksSteps.map((item, idx) => (
                            <motion.div key={item.step} className="how-step-card" variants={fadeUp} custom={idx}>
                                <div className="how-step-top">
                                    <span className="how-step-num tabular-nums">{item.step}</span>
                                    <div className="how-step-icon" aria-hidden="true">{item.icon}</div>
                                </div>
                                <h3 className="title-1" style={{ color: 'var(--gray-900)', marginBottom: '8px' }}>
                                    {item.title}
                                </h3>
                                <p className="body-5" style={{ color: 'var(--gray-500)' }}>
                                    {item.description}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* A2.10 FAQ Section (6 questions for objection handling & AEO) */}
            <section className="section" style={{ backgroundColor: 'var(--gray-50)' }}>
                <div className="container">
                    <motion.div
                        className="home-section-header text-center"
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={viewportOnce}
                    >
                        <span className="section-subtitle">Frequently asked questions</span>
                        <h2 className="heading-3 m-0">Answers before you make your move</h2>
                    </motion.div>

                    <div className="home-faq-list">
                        {faqs.map((faq, idx) => (
                            <details key={idx} className="home-faq-item">
                                <summary className="home-faq-summary title-3">
                                    <span>{faq.q}</span>
                                    <ChevronDown size={18} aria-hidden="true" className="home-faq-chevron" />
                                </summary>
                                <div className="home-faq-answer body-5">
                                    <p>{faq.a}</p>
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* A2.11 & A2.12 Risk Reversal + Final CTA */}
            <section className="home-final-cta-section">
                <div className="container">
                    <div className="home-final-cta-box">
                        <span className="caption-3 home-final-cta-badge">
                            Free to browse · 100% verified agents · Direct owner and agent contact
                        </span>
                        <h2 className="heading-2 home-final-cta-heading">
                            Ready to find your next home in East Africa?
                        </h2>
                        <p className="title-2 home-final-cta-sub">
                            Compare 1,500+ verified properties with transparent pricing and book a viewing today.
                        </p>
                        <div className="home-final-cta-actions">
                            <button
                                type="button"
                                className="btn btn-primary button-md"
                                onClick={() => navigate('/listings')}
                            >
                                <span>Search verified homes</span>
                                <ArrowRight size={18} aria-hidden="true" />
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary button-md"
                                onClick={() => navigate('/stays')}
                            >
                                <span>Explore short stays</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
