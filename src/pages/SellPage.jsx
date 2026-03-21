import React, { useState } from 'react';
import './SellPage.css';
import { useNavigate } from 'react-router-dom';
import { Typography, Row, Col, Card, Button, Input, Select, Space, Form, message } from 'antd';
import {
    CheckCircle,
    DollarSign,
    FileText,
    Send,
    Phone,
    Mail,
    User,
    Building
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import VerificationGate from '../components/VerificationGate';
import GuriPageHeader from '../components/GuriPageHeader';

const { Title, Text: AntText, Paragraph } = Typography;
const { TextArea } = Input;

const SellPage = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const onFinish = (values) => {
        console.log('Form values:', values);
        message.success('Thank you! Our team will contact you shortly.');
        form.resetFields();
    };

    const benefits = [
        { icon: <CheckCircle size={32} />, title: 'Verified Buyers', desc: 'We connect you with pre-qualified, serious buyers ready to make offers.' },
        { icon: <DollarSign size={32} />, title: 'Best Price', desc: 'Our market analysis ensures your property is priced competitively for maximum returns.' },
        { icon: <FileText size={32} />, title: 'Full Support', desc: 'From listing to closing, we handle all paperwork and negotiations for you.' },
    ];

    return (
        <div style={{ background: '#fff', minHeight: '100vh' }}>
            <GuriPageHeader
                title="Sell Your Property"
                subtitle="Selling property doesn't have to be complicated. Let Guri24's experts help you get the maximum value with zero stress."
            />

            {/* Benefits Section */}
            <section style={{ padding: '100px 60px', background: '#f8f9fa' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <Title level={2} style={{ fontSize: '48px', fontWeight: 600, letterSpacing: '-1.5px' }}>Why Sell With Guri24?</Title>
                    </div>

                    <Row gutter={[40, 40]}>
                        {benefits.map((benefit, i) => (
                            <Col xs={24} md={8} key={i}>
                                <div style={{ background: '#fff', padding: '48px', borderRadius: '40px', textAlign: 'center', height: '100%', border: '1px solid #eee' }}>
                                    <div style={{
                                        width: '80px', height: '80px', background: 'rgba(0, 82, 204, 0.1)', color: '#0052cc',
                                        borderRadius: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        margin: '0 auto 32px'
                                    }}>
                                        {benefit.icon}
                                    </div>
                                    <Title level={3} style={{ marginBottom: '16px', fontSize: '24px' }}>{benefit.title}</Title>
                                    <Paragraph style={{ fontSize: '16px', color: '#666', lineHeight: '1.6' }}>{benefit.desc}</Paragraph>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </div>
            </section>

            {/* Form Section */}
            {!isAuthenticated ? (
                <section style={{ padding: '120px 60px', textAlign: 'center' }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <Title level={2} style={{ fontSize: '40px', fontWeight: 600, marginBottom: '24px' }}>Ready to List Your Property?</Title>
                        <Paragraph style={{ fontSize: '18px', color: '#666', marginBottom: '48px' }}>Please log in or create an account to start the listing process with Guri24.</Paragraph>
                        <Space size="large">
                            <Button type="primary" size="large" onClick={() => navigate('/login')} style={{ background: '#1a1a1a', height: '56px', padding: '0 40px', borderRadius: '16px', fontWeight: 700 }}>Log In</Button>
                            <Button size="large" onClick={() => navigate('/register')} style={{ height: '56px', padding: '0 40px', borderRadius: '16px', fontWeight: 700 }}>Create Account</Button>
                        </Space>
                    </div>
                </section>
            ) : (
                <VerificationGate>
                    <section style={{ padding: '100px 60px' }}>
                        <div style={{ maxWidth: '1000px', margin: '0 auto', background: '#fff', padding: '64px', borderRadius: '48px', border: '1px solid #eee', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                            <Row gutter={64}>
                                <Col xs={24} lg={10}>
                                    <Title level={2} style={{ fontSize: '40px', fontWeight: 600, marginBottom: '24px' }}>List Your Property</Title>
                                    <Paragraph style={{ fontSize: '17px', color: '#666', lineHeight: '1.8', marginBottom: '48px' }}>
                                        Fill out the form and one of our experts will contact you within 24 hours to discuss your property listing.
                                    </Paragraph>

                                    <div style={{ background: '#f8f9fa', padding: '32px', borderRadius: '24px' }}>
                                        <Title level={4} style={{ marginBottom: '24px', fontSize: '18px' }}>Need assistance?</Title>
                                        <Space orientation="vertical" size="middle">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <Phone size={18} color="#0052cc" />
                                                <AntText style={{ fontWeight: 600 }}>+254 706 070 747</AntText>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <Mail size={18} color="#0052cc" />
                                                <AntText style={{ fontWeight: 600 }}>support@guri24.com</AntText>
                                            </div>
                                        </Space>
                                    </div>
                                </Col>
                                <Col xs={24} lg={14}>
                                    <Form form={form} layout="vertical" onFinish={onFinish} size="large">
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item name="name" label="Your Name" rules={[{ required: true }]}>
                                                    <Input placeholder="John Doe" style={{ borderRadius: '12px' }} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email' }]}>
                                                    <Input placeholder="john@example.com" style={{ borderRadius: '12px' }} />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item name="phone" label="Phone Number" rules={[{ required: true }]}>
                                                    <Input placeholder="+254 7XX XXX XXX" style={{ borderRadius: '12px' }} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item name="propertyType" label="Property Type" rules={[{ required: true }]}>
                                                    <Select placeholder="Select type" style={{ borderRadius: '12px' }}>
                                                        <Select.Option value="apartment">Apartment</Select.Option>
                                                        <Select.Option value="house">House</Select.Option>
                                                        <Select.Option value="villa">Villa</Select.Option>
                                                        <Select.Option value="land">Land</Select.Option>
                                                        <Select.Option value="commercial">Commercial</Select.Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Form.Item name="location" label="Property Location" rules={[{ required: true }]}>
                                            <Input placeholder="e.g., Westlands, Nairobi" style={{ borderRadius: '12px' }} />
                                        </Form.Item>
                                        <Form.Item name="description" label="Property Description">
                                            <TextArea rows={4} placeholder="Describe your property details..." style={{ borderRadius: '12px' }} />
                                        </Form.Item>
                                        <Button type="primary" htmlType="submit" icon={<Send size={18} />} block style={{ background: '#0052cc', height: '60px', borderRadius: '16px', fontWeight: 700, fontSize: '18px', marginTop: '16px', border: 'none' }}>
                                            Submit Property
                                        </Button>
                                    </Form>
                                </Col>
                            </Row>
                        </div>
                    </section>
                </VerificationGate>
            )}
        </div>
    );
};

export default SellPage;
