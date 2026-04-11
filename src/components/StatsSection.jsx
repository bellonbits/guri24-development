import React, { useRef, useEffect } from 'react';
import { Users, Building2, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeUp, slideLeft, slideRight, viewportOnce } from '../utils/animations';
import { useTranslation } from 'react-i18next';
import './StatsSection.css';

const StatCounter = ({ end, suffix, color }) => {
    const ref = useRef(null);
    const animated = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !animated.current) {
                animated.current = true;
                const duration = 1200;
                const startTime = performance.now();
                const tick = (now) => {
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    // easeOutQuad
                    const eased = 1 - (1 - progress) * (1 - progress);
                    el.textContent = Math.round(eased * end).toLocaleString() + suffix;
                    if (progress < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            }
        }, { threshold: 0.5 });
        observer.observe(el);
        return () => observer.disconnect();
    }, [end, suffix]);

    return (
        <span
            ref={ref}
            className="stat-value"
            style={{ color }}
        >
            0{suffix}
        </span>
    );
};

const StatsSection = () => {
    const { t } = useTranslation();
    const statsData = [
        { icon: <Award size={28} />, end: 10,    suffix: '+', label: t('home.stats_exp', 'Years of Experience'), color: '#1a5f9e' },
        { icon: <Users size={28} />, end: 2000,  suffix: '+', label: t('home.stats_clients', 'Happy Clients'),        color: '#0d3b66' },
        { icon: <Building2 size={28} />, end: 1500, suffix: '+', label: t('home.stats_props', 'Verified Properties'), color: '#3498db' },
    ];

    return (
    <section className="section" style={{ background: '#f0f4f9', paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div className="container">
            <div className="stats-grid-main">
                {/* Content */}
                <motion.div
                    variants={slideLeft}
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOnce}
                >
                    <h2 className="stats-about-title">
                        {t('home.stats_about_title', 'Your trusted partner for smarter real estate decisions')}
                    </h2>
                    <p className="stats-about-desc">
                        {t('home.stats_about_desc', 'Our experienced agents blend deep market insight, modern technology, and personalized service to deliver transparent guidance, strong results, and long-term value across East Africa.')}
                    </p>
                    <motion.a
                        href="/about"
                        whileHover={{ x: 6 }}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginTop: '24px',
                            color: '#1a5f9e',
                            fontWeight: 700,
                            fontSize: '15px',
                            textDecoration: 'none',
                        }}
                    >
                        {t('home.learn_more', 'Learn more about us')} →
                    </motion.a>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    className="stats-numbers-grid"
                    variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOnce}
                >
                    {statsData.map((stat, i) => (
                        <motion.div
                            key={i}
                            className="stat-item"
                            variants={fadeUp}
                            custom={i}
                            whileHover={{ scale: 1.04, transition: { duration: 0.2 } }}
                        >
                            <div
                                className="stat-icon-wrapper"
                                style={{ background: `${stat.color}12`, borderColor: `${stat.color}20`, color: stat.color }}
                            >
                                {stat.icon}
                            </div>
                            <StatCounter end={stat.end} suffix={stat.suffix} color={stat.color} />
                            <span className="stat-label">{stat.label}</span>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    </section>
    );
};

export default StatsSection;
