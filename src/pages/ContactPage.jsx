import { useState } from 'react';
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
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        jobPosition: '',
        services: [],
        message: ''
    });

    const services = [
        'Property Management',
        'Buying A Home',
        'Selling Property',
        'Consultation',
        'Investment',
        'Other'
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
        alert('Thank you! We will be in touch shortly.');
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
                            Contact Us
                        </div>
                        <h1 className="contact-heading">
                            Let's Get In Touch.
                        </h1>
                        <p className="contact-subheading">
                            We are here to help with your real estate needs. Whether you are buying, selling, or renting, reach out to us.
                        </p>

                        <div className="contact-details">
                            <div className="contact-detail-item">
                                <div className="detail-icon">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <p className="detail-label">Email Us</p>
                                    <a href="mailto:hello@guri24.com" className="detail-link">hello@guri24.com</a>
                                </div>
                            </div>
                            <div className="contact-detail-item">
                                <div className="detail-icon">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p className="detail-label">Call Us</p>
                                    <a href="tel:+254706070747" className="detail-link">+254 706 070 747</a>
                                </div>
                            </div>
                            <div className="contact-detail-item">
                                <div className="detail-icon">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p className="detail-label">Visit Us</p>
                                    <p className="detail-text">Westpark Towers, Nairobi</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Form */}
                    <div className="contact-form-card">
                        <form onSubmit={handleSubmit} className="contact-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <div className="input-wrapper">
                                        <User className="input-icon" size={18} />
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Enter your name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <div className="input-wrapper">
                                        <Mail className="input-icon" size={18} />
                                        <input
                                            type="email"
                                            className="form-input"
                                            placeholder="Enter your email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Phone Number</label>
                                    <div className="input-wrapper">
                                        <Phone className="input-icon" size={18} />
                                        <input
                                            type="tel"
                                            className="form-input"
                                            placeholder="Enter phone number"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">I am a...</label>
                                    <div className="input-wrapper">
                                        <Briefcase className="input-icon" size={18} />
                                        <select
                                            className="form-select"
                                            value={formData.jobPosition}
                                            onChange={(e) => setFormData({ ...formData, jobPosition: e.target.value })}
                                        >
                                            <option value="" disabled>Select option...</option>
                                            <option value="Buyer">Property Buyer</option>
                                            <option value="Seller">Property Seller</option>
                                            <option value="Agent">Real Estate Agent</option>
                                            <option value="Investor">Investor</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <ChevronDown className="select-icon" size={18} />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Services</label>
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
                                <label className="form-label">Message</label>
                                <textarea
                                    className="form-textarea"
                                    placeholder="Tell us about your needs..."
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    required
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="submit-button"
                            >
                                Send Message
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
