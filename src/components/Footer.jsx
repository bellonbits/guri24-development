import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowRight, Send } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();
    const [email, setEmail] = useState('');

    const columns = [
        {
            title: t('footer.company'),
            links: [
                { label: t('footer.about_us'), path: '/about' },
                { label: t('footer.our_services'), path: '/services' },
                { label: t('footer.blog_insights'), path: '/blog' },
                { label: t('footer.careers'), path: '/contact' },
                { label: t('footer.contact_us'), path: '/contact' },
            ]
        },
        {
            title: t('footer.properties'),
            links: [
                { label: t('footer.buy_property'), path: '/buy' },
                { label: t('footer.rent_property'), path: '/rent' },
                { label: t('footer.short_term_stays'), path: '/stays' },
                { label: t('footer.all_listings'), path: '/listings' },
                { label: t('footer.list_your_property'), path: '/sell' },
            ]
        },
        {
            title: t('footer.support'),
            links: [
                { label: t('footer.help_center'), path: '/help' },
                { label: t('footer.privacy_policy'), path: '/privacy' },
                { label: t('footer.terms_of_service'), path: '/about' },
                { label: t('footer.cookie_policy'), path: '/about' },
                { label: t('footer.sitemap'), path: '/listings' },
            ]
        },
    ];

    const socials = [
        { Icon: Facebook, label: 'Facebook', href: '#' },
        { Icon: Twitter, label: 'Twitter', href: '#' },
        { Icon: Linkedin, label: 'LinkedIn', href: '#' },
        { Icon: Instagram, label: 'Instagram', href: '#' },
    ];

    return (
        <footer className="guri-footer">
            {/* Newsletter Banner */}
            <div className="footer-newsletter-strip">
                <div className="container footer-newsletter-inner">
                    <div className="footer-newsletter-text">
                        <h3>{t('footer.newsletter_title')}</h3>
                        <p>{t('footer.newsletter_desc')}</p>
                    </div>
                    <form
                        className="footer-newsletter-form"
                        onSubmit={(e) => { e.preventDefault(); setEmail(''); }}
                    >
                        <div className="footer-newsletter-input-wrap">
                            <Mail size={16} className="footer-newsletter-icon" />
                            <input
                                type="email"
                                placeholder={t('footer.email_placeholder')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="footer-newsletter-btn">
                            {t('footer.subscribe')} <Send size={14} />
                        </button>
                    </form>
                </div>
            </div>

            {/* Main Footer Body */}
            <div className="footer-body">
                <div className="container footer-grid">
                    {/* Brand Column */}
                    <div className="footer-brand-col">
                        <Link to="/" className="footer-logo-link">
                            <img
                                src="https://guri24.com/logo.png"
                                alt="Guri24"
                                className="footer-logo"
                                onError={(e) => { e.target.src = '/logo.png'; }}
                            />
                        </Link>
                        <p className="footer-brand-desc">
                            {t('footer.brand_desc')}
                        </p>

                        {/* Contact Info */}
                        <div className="footer-contact-stack">
                            <a href="tel:+254706070747" className="footer-contact-row">
                                <div className="footer-contact-dot"><Phone size={13} /></div>
                                <span>+254 706 070 747</span>
                            </a>
                            <a href="mailto:support@guri24.com" className="footer-contact-row">
                                <div className="footer-contact-dot"><Mail size={13} /></div>
                                <span>support@guri24.com</span>
                            </a>
                            <div className="footer-contact-row">
                                <div className="footer-contact-dot"><MapPin size={13} /></div>
                                <span>Westpark Towers Suite 503, Off Muthithi Road, Nairobi</span>
                            </div>
                        </div>

                        {/* Socials */}
                        <div className="footer-socials">
                            {socials.map(({ Icon, label, href }) => (
                                <a key={label} href={href} aria-label={label} className="footer-social-btn">
                                    <Icon size={15} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link Columns */}
                    {columns.map((col) => (
                        <div key={col.title} className="footer-link-col">
                            <h6 className="footer-col-title">{col.title}</h6>
                            <ul className="footer-link-list">
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        <Link to={link.path} className="footer-link">
                                            <ArrowRight size={12} className="footer-link-arrow" />
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="footer-bottom-bar">
                <div className="container footer-bottom-inner">
                    <p className="footer-copy">
                        {t('footer.copyright', { year: currentYear })}
                    </p>
                    <div className="footer-bottom-links">
                        <Link to="/privacy" className="footer-bottom-link">{t('footer.privacy')}</Link>
                        <span className="footer-bottom-sep">·</span>
                        <Link to="/about" className="footer-bottom-link">{t('footer.terms')}</Link>
                        <span className="footer-bottom-sep">·</span>
                        <Link to="/about" className="footer-bottom-link">{t('footer.cookies')}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
