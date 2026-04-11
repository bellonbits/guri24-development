import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './ContactPage.css';
import {
    Phone,
    Mail,
    User,
    Briefcase,
    ChevronDown,
    ArrowRight,
    MapPin
} from 'lucide-react';
import SEO from '../components/SEO';

const ContactPage = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        jobPosition: '',
        services: [],
        message: ''
    });

    const services = [
        t('contact.service_management'),
        t('contact.service_buying'),
        t('contact.service_selling'),
        t('contact.service_consultation'),
        t('contact.service_investment'),
        t('contact.service_other')
    ];

    const toggleService = (service) => {
        setFormData(prev => ({
            ...prev,
            services: prev.services.includes(service)
                ? prev.services.filter(s => s !== service)
                : [...prev.services, service]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(t('contact.thank_you'));
    };

    return (
        <div className="contact-page-wrapper">
            <SEO
                title="Contact Us | Guri24"
                description="Get in touch with Guri24."
            />

            <div className="contact-container">
                <div className="contact-grid">

                    {/* Left Column: Info */}
                    <div className="contact-info">
                        <div className="contact-badge">
                            {t('contact.badge')}
                        </div>
                        <h1 className="contact-heading">
                            {t('contact.heading')}
                        </h1>
                        <p className="contact-subheading">
                            {t('contact.subheading')}
                        </p>

                        <div className="contact-details">
                            <div className="contact-detail-item">
                                <div className="detail-icon">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <p className="detail-label">{t('contact.email_label')}</p>
                                    <a href="mailto:hello@guri24.com" className="detail-link">hello@guri24.com</a>
                                </div>
                            </div>
                            <div className="contact-detail-item">
                                <div className="detail-icon">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p className="detail-label">{t('contact.call_label')}</p>
                                    <a href="tel:+254706070747" className="detail-link">+254 706 070 747</a>
                                </div>
                            </div>
                            <div className="contact-detail-item">
                                <div className="detail-icon">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p className="detail-label">{t('contact.visit_label')}</p>
                                    <p className="detail-text">{t('contact.visit_address')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Form */}
                    <div className="contact-form-card">
                        <form onSubmit={handleSubmit} className="contact-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">{t('contact.full_name')}</label>
                                    <div className="input-wrapper">
                                        <User className="input-icon" size={18} />
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder={t('contact.full_name_placeholder')}
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">{t('contact.email_address')}</label>
                                    <div className="input-wrapper">
                                        <Mail className="input-icon" size={18} />
                                        <input
                                            type="email"
                                            className="form-input"
                                            placeholder={t('contact.email_placeholder')}
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">{t('contact.phone_number')}</label>
                                    <div className="input-wrapper">
                                        <Phone className="input-icon" size={18} />
                                        <input
                                            type="tel"
                                            className="form-input"
                                            placeholder={t('contact.phone_placeholder')}
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">{t('contact.i_am')}</label>
                                    <div className="input-wrapper">
                                        <Briefcase className="input-icon" size={18} />
                                        <select
                                            className="form-select"
                                            value={formData.jobPosition}
                                            onChange={(e) => setFormData({ ...formData, jobPosition: e.target.value })}
                                        >
                                            <option value="" disabled>{t('contact.select_option')}</option>
                                            <option value="Buyer">{t('contact.buyer')}</option>
                                            <option value="Seller">{t('contact.seller')}</option>
                                            <option value="Agent">{t('contact.agent')}</option>
                                            <option value="Investor">{t('contact.investor')}</option>
                                            <option value="Other">{t('contact.other')}</option>
                                        </select>
                                        <ChevronDown className="select-icon" size={18} />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">{t('contact.services_label')}</label>
                                <div className="services-grid">
                                    {services.map((service) => (
                                        <button
                                            key={service}
                                            type="button"
                                            onClick={() => toggleService(service)}
                                            className={`service-chip ${formData.services.includes(service) ? 'active' : ''}`}
                                        >
                                            {service}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">{t('contact.message_label')}</label>
                                <textarea
                                    className="form-textarea"
                                    placeholder={t('contact.message_placeholder')}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    required
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="submit-button"
                            >
                                {t('contact.send_message')}
                                <ArrowRight size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
