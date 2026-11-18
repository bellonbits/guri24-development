import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '../utils/animations';
import GuriFilterBar from './GuriFilterBar';
import { useTranslation } from 'react-i18next';

const GuriHero = ({ onSearch }) => {
    const { t } = useTranslation();

    return (
        <section
            className="guri-hero-section"
            style={{
                position: 'relative',
                minHeight: '600px',
                backgroundColor: '#181818',
                backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1280&q=75')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                paddingTop: '64px',
                paddingBottom: '64px',
            }}
        >
            {/* Flat high-contrast dark scrim for WCAG AAA legibility over photography */}
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(10, 15, 26, 0.68)',
                }}
            />

            <motion.div
                className="container w-full"
                style={{ position: 'relative', zIndex: 1 }}
                variants={staggerContainer}
                initial={false}
                animate="visible"
            >
                {/* Proof signal badge */}
                <motion.div className="flex justify-center" style={{ marginBottom: '16px' }} variants={fadeUp} custom={0}>
                    <span
                        className="caption-3"
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.12)',
                            border: '1px solid rgba(255, 255, 255, 0.24)',
                            color: '#ffffff',
                            borderRadius: '9999px',
                            padding: '8px 16px',
                            backdropFilter: 'blur(8px)',
                            letterSpacing: '0.02em',
                        }}
                    >
                        {t('home.hero_badge', 'Verified real estate across East Africa')}
                    </span>
                </motion.div>

                {/* B5. Hero Headline — max-width 680px, meaningful line break, left-to-right #FFFFFF -> #9B9B9B text gradient */}
                <motion.h1
                    className="heading-1"
                    variants={fadeUp}
                    custom={1}
                    style={{
                        maxWidth: '680px',
                        marginInline: 'auto',
                        marginBottom: '16px',
                        textAlign: 'center',
                        backgroundImage: 'linear-gradient(to right, #FFFFFF 0%, #9B9B9B 100%)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                    }}
                >
                    {t('home.hero_title_p1', 'Find your next home')}
                    <br />
                    {t('home.hero_title_p2', 'with verified local agents')}
                </motion.h1>

                {/* B5. Subheadline — max-width 680px, clarifies how and adds specificity */}
                <motion.p
                    className="title-2"
                    variants={fadeUp}
                    custom={2}
                    style={{
                        maxWidth: '680px',
                        marginInline: 'auto',
                        color: 'rgba(255, 255, 255, 0.86)',
                        textAlign: 'center',
                        marginBottom: '32px',
                    }}
                >
                    {t('home.hero_subtitle', 'Browse 1,500+ inspected homes, apartments, and short stays across Kenya and East Africa with transparent pricing.')}
                </motion.p>

                {/* Primary Action Search Bar */}
                <motion.div variants={fadeUp} custom={3} style={{ maxWidth: '860px', margin: '0 auto' }}>
                    <GuriFilterBar onSearch={onSearch} />
                </motion.div>

                {/* Proof strip (A2.4: one proof signal above the fold, tabular numbers) */}
                <motion.div
                    variants={fadeUp}
                    custom={4}
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: '12px 24px',
                        marginTop: '32px',
                    }}
                >
                    {[
                        { num: '10+', text: t('home.stats_exp', 'Years in East Africa') },
                        { num: '2,000+', text: t('home.stats_clients', 'Verified buyers and tenants') },
                        { num: '1,500+', text: t('home.stats_props', 'Inspected listings') },
                    ].map(({ num, text }) => (
                        <div
                            key={text}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '9999px',
                                padding: '8px 16px',
                                backdropFilter: 'blur(6px)',
                            }}
                        >
                            <span
                                className="body-4 tabular-nums"
                                style={{
                                    color: '#ffffff',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {num}
                            </span>
                            <span
                                className="caption-1"
                                style={{
                                    color: 'rgba(255, 255, 255, 0.82)',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {text}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </motion.div>
        </section>
    );
};

export default GuriHero;
