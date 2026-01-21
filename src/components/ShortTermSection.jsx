import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, Calendar, MapPin } from 'lucide-react';
import './ShortTermSection.css';

function ShortTermSection() {
    const { t } = useTranslation();
    return (
        <section className="short-term-section">
            <div className="container">
                <div className="short-term-content">
                    <div className="short-term-text">
                        <span className="badge-new">New Service</span>
                        <h2>Experience Luxury<br />Short-Term Stays</h2>
                        <p>
                            Discover our curated collection of premium apartments and homes
                            perfect for your next vacation, business trip, or weekend getaway.
                            Enjoy hotel-grade amenities with the comfort of a home.
                        </p>

                        <div className="short-term-search-mini">
                            <div className="mini-input">
                                <MapPin size={16} />
                                <input type="text" placeholder="Where to?" />
                            </div>
                            <Link to="/stays" className="btn-mini-search">
                                Explore
                            </Link>
                        </div>

                        <div className="features-list">
                            <div className="feature">
                                <Sparkles size={20} />
                                <span>Premium Cleaning</span>
                            </div>
                            <div className="feature">
                                <Calendar size={20} />
                                <span>Flexible Check-in</span>
                            </div>
                        </div>

                        <Link to="/stays" className="btn-explore">
                            View All Stays
                        </Link>
                    </div>

                    <div className="short-term-visual">
                        {/* We use a CSS background or a composed grid of images here */}
                        <div className="visual-card card-1"></div>
                        <div className="visual-card card-2"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ShortTermSection;
