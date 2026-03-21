import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowRight, Send } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const [email, setEmail] = useState('');

    const columns = [
        {
            title: 'Company',
            links: [
                { label: 'About Us', path: '/about' },
                { label: 'Our Services', path: '/services' },
                { label: 'Blog & Insights', path: '/blog' },
                { label: 'Careers', path: '/contact' },
                { label: 'Contact Us', path: '/contact' },
            ]
        },
        {
            title: 'Properties',
            links: [
                { label: 'Buy Property', path: '/buy' },
                { label: 'Rent Property', path: '/rent' },
                { label: 'Short-Term Stays', path: '/stays' },
                { label: 'All Listings', path: '/listings' },
                { label: 'List Your Property', path: '/sell' },
            ]
        },
        {
            title: 'Support',
            links: [
                { label: 'Help Center', path: '/help' },
                { label: 'Privacy Policy', path: '/about' },
                { label: 'Terms of Service', path: '/about' },
                { label: 'Cookie Policy', path: '/about' },
                { label: 'Sitemap', path: '/listings' },
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
                        <h3>Stay ahead of the market</h3>
                        <p>Get the latest listings, market trends, and property insights straight to your inbox.</p>
                    </div>
                    <form
                        className="footer-newsletter-form"
                        onSubmit={(e) => { e.preventDefault(); setEmail(''); }}
                    >
                        <div className="footer-newsletter-input-wrap">
                            <Mail size={16} className="footer-newsletter-icon" />
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="footer-newsletter-btn">
                            Subscribe <Send size={14} />
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
                            East Africa's most trusted real estate platform. We connect buyers, sellers, and investors with verified properties across Kenya and beyond.
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
                        © {currentYear} Guri24 Real Estate Ltd. All rights reserved.
                    </p>
                    <div className="footer-bottom-links">
                        <Link to="/about" className="footer-bottom-link">Privacy</Link>
                        <span className="footer-bottom-sep">·</span>
                        <Link to="/about" className="footer-bottom-link">Terms</Link>
                        <span className="footer-bottom-sep">·</span>
                        <Link to="/about" className="footer-bottom-link">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
