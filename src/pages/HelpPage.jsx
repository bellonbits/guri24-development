import React from 'react';
import GuriPageHeader from '../components/GuriPageHeader';
import { Typography, Row, Col, Collapse } from 'antd';
import { HelpCircle, MessageCircle, Phone, Mail } from 'lucide-react';
import './HelpPage.css';

const { Title, Paragraph, Text: AntText } = Typography;

const HelpPage = () => {
    const faqs = [
        {
            key: '1',
            label: 'How do I list my property?',
            children: <p>Listing a property on Guri24 is simple. Click the "List Property" button in the navigation bar, create an account if you haven't already, and follow the step-by-step guide to add your property details and high-quality images.</p>,
        },
        {
            key: '2',
            label: 'How can I contact an agent?',
            children: <p>Each property listing has an "Inquiry" section where you can directly message the listing agent. You can also find their contact number and email address on the property details page.</p>,
        },
        {
            key: '3',
            label: 'What is StayHub?',
            children: <p>StayHub is Guri24's specialized platform for short-term rentals and vacation stays. It's designed for travelers looking for comfortable, verified accommodations across East Africa.</p>,
        },
    ];

    return (
        <div className="help-page">
            <GuriPageHeader
                title="Help Center"
                subtitle="Find answers to common questions and get support from our dedicated team."
            />

            <section className="section">
                <div className="container">
                    <Row gutter={[48, 48]}>
                        <Col xs={24} lg={16}>
                            <Title level={2} className="mb-8">Frequently Asked Questions</Title>
                            <Collapse
                                ghost
                                accordion
                                items={faqs}
                                expandIcon={({ isActive }) => <HelpCircle size={20} className={isActive ? 'text-primary' : 'text-gray-400'} />}
                                className="help-collapse"
                            />
                        </Col>

                        <Col xs={24} lg={8}>
                            <div className="contact-card">
                                <Title level={3}>Still need help?</Title>
                                <Paragraph className="text-muted">
                                    Our support team is available 24/7 to assist you with any inquiries.
                                </Paragraph>

                                <div className="contact-methods">
                                    <div className="method">
                                        <MessageCircle size={20} />
                                        <span>Live Chat</span>
                                    </div>
                                    <div className="method">
                                        <Phone size={20} />
                                        <span>+254 706 070 747</span>
                                    </div>
                                    <div className="method">
                                        <Mail size={20} />
                                        <span>support@guri24.com</span>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </section>
        </div>
    );
};

export default HelpPage;
