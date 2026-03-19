import { useState, useEffect } from 'react';
import { Typography, Button, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Home, TrendingUp, Key, ArrowRight } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import GuriHero from '../components/GuriHero';
import StatsSection from '../components/StatsSection';
import BlogSection from '../components/BlogSection';
import { propertyApi, transformProperty } from '../utils/propertyApi';
import SEO from '../components/SEO';
import './HomePage.css';

const { Title, Text: AntText } = Typography;

const HomePage = () => {
    const navigate = useNavigate();
    const [featuredProperties, setFeaturedProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                setLoading(true);
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
                    } catch (e) {
                        return null;
                    }
                }).filter(p => p !== null);

                setFeaturedProperties(transformed);
            } catch (error) {
                console.error('HomePage: Failed to fetch properties:', error);
                setFeaturedProperties([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, []);

    const services = [
        {
            icon: <Home size={28} />,
            title: 'Buy Property',
            description: 'Find exceptional properties tailored to your lifestyle and budget. Our curated listings feature verified homes across prime locations.',
            link: '/listings?purpose=sale',
            linkText: 'Explore Properties'
        },
        {
            icon: <TrendingUp size={28} />,
            title: 'Sell Property',
            description: 'List your property with expert guidance. We connect you with serious buyers and handle the entire sales process professionally.',
            link: '/contact',
            linkText: 'Get Started'
        },
        {
            icon: <Key size={28} />,
            title: 'Rent Property',
            description: 'Discover quality rental properties from apartments to luxury homes. Flexible terms and verified listings for your peace of mind.',
            link: '/listings?purpose=rent',
            linkText: 'View Rentals'
        }
    ];

    return (
        <div className="home-page">
            <SEO
                title="Find Your Dream Property with Confidence"
                description="Search thousands of verified properties for sale and rent across East Africa. Expert guidance for buyers, sellers, and investors."
            />

            <GuriHero
                loading={loading}
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
                    <div className="home-section-header flex justify-between items-end">
                        <div>
                            <span className="section-subtitle">★ Featured</span>
                            <Title level={2} className="m-0">Featured Properties</Title>
                        </div>
                        <Button
                            shape="round"
                            size="large"
                            className="btn-outline px-8"
                            onClick={() => navigate('/listings')}
                        >
                            Explore All
                        </Button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Spin size="large" />
                        </div>
                    ) : featuredProperties.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-[32px]">
                            <AntText type="secondary" className="text-lg block mb-4">No properties found at the moment.</AntText>
                            <Button type="link" onClick={() => navigate('/listings')}>View all listings</Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {featuredProperties.map((property) => (
                                <PropertyCard key={property.id} property={property} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Services Section */}
            <section className="section bg-gray-50">
                <div className="container">
                    <div className="home-section-header text-center">
                        <span className="section-subtitle">★ Our Services</span>
                        <Title level={2} className="m-0">Comprehensive Real Estate Solutions</Title>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {services.map((service, index) => (
                            <div key={index} className="card-minimal">
                                <div className="service-icon-wrapper">
                                    {service.icon}
                                </div>
                                <Title level={3} className="text-2xl mb-4">
                                    {service.title}
                                </Title>
                                <AntText className="text-gray-500 text-base leading-relaxed mb-6 block">
                                    {service.description}
                                </AntText>
                                <Button
                                    type="link"
                                    onClick={() => navigate(service.link)}
                                    className="service-link"
                                >
                                    {service.linkText} <ArrowRight size={18} />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <BlogSection />
        </div>
    );
};

export default HomePage;
