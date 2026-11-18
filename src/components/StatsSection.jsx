import React, { useRef, useEffect } from 'react';
import { Users, Building2, Award, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeUp, slideLeft, viewportOnce } from '../utils/animations';
import { useTranslation } from 'react-i18next';
import './StatsSection.css';

const StatCounter = ({ end, suffix }) => {
    const ref = useRef(null);
    const animated = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
        if (prefersReducedMotion) {
            el.textContent = end.toLocaleString() + suffix;
            return;
        }

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !animated.current) {
                animated.current = true;
                const duration = 900;
                const startTime = performance.now();
                const tick = (now) => {
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    el.textContent = Math.round(eased * end).toLocaleString() + suffix;
                    if (progress < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            }
        }, { threshold: 0.4 });
        observer.observe(el);
        return () => observer.disconnect();
    }, [end, suffix]);

    return (
        <span ref={ref} className="stat-value tabular-nums">
            {end.toLocaleString()}{suffix}
        </span>
    );
};

const StatsSection = () => {
    const { t } = useTranslation();
    const statsData = [
        { icon: <Award size={20} strokeWidth={1.5} />, end: 10,   suffix: '+', label: t('home.stats_exp', 'Years in East Africa') },
        { icon: <Users size={20} strokeWidth={1.5} />, end: 2000, suffix: '+', label: t('home.stats_clients', 'Verified buyers and tenants') },
        { icon: <Building2 size={20} strokeWidth={1.5} />, end: 1500, suffix: '+', label: t('home.stats_props', 'Inspected properties') },
    ];

    return (
        <section className="stats-section">
            <div className="container">
                <div className="stats-grid-main">
                    {/* Problem -> Solution Argument */}
                    <motion.div
                        variants={slideLeft}
                        initial="hidden"
                        whileInView="visible"
                        viewport={viewportOnce}
                    >
                        <span className="stats-about-subtitle">
                            {t('home.stats_badge', 'Verified property marketplace')}
                        </span>
                        <h2 className="heading-3 stats-about-title">
                            {t('home.stats_about_title', 'Every listing is verified before you book a viewing')}
                        </h2>
                        <p className="body-3 stats-about-desc">
                            {t('home.stats_about_desc', 'Our local team inspects title deeds, confirms agent credentials, and verifies exact neighborhood pricing so you can buy, rent, or book short stays across East Africa without hidden fees.')}
                        </p>
                        <a href="/about" className="stats-cta-link button-sm">
                            <span>{t('home.learn_more', 'See how we verify listings')}</span>
                            <ArrowRight size={16} aria-hidden="true" />
                        </a>
                    </motion.div>

                    {/* Numbers Grid */}
                    <motion.div
                        className="stats-numbers-grid"
                        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
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
                            >
                                <div className="stat-icon-wrapper" aria-hidden="true">
                                    {stat.icon}
                                </div>
                                <StatCounter end={stat.end} suffix={stat.suffix} />
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
