import React, { useState, useEffect } from 'react';
import './SellPage.css';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [form] = Form.useForm();

    useEffect(() => {
        if (isAuthenticated && user?.role) {
            if (['admin', 'super_admin'].includes(user.role)) {
                navigate('/admin/properties/create');
            } else if (user.role === 'agent') {
                navigate('/agent/properties/add');
            }
        }
    }, [isAuthenticated, user, navigate]);

    const onFinish = (values) => {
        console.log('Form values:', values);
        message.success(t('sell.success_msg', 'Thank you! Our team will contact you shortly.'));
        form.resetFields();
    };

    const benefits = [
        { icon: <CheckCircle size={32} />, title: t('sell.benefit_1_title', 'Verified Buyers'), desc: t('sell.benefit_1_desc', 'We connect you with pre-qualified, serious buyers ready to make offers.') },
        { icon: <DollarSign size={32} />, title: t('sell.benefit_2_title', 'Best Price'), desc: t('sell.benefit_2_desc', 'Our market analysis ensures your property is priced competitively for maximum returns.') },
        { icon: <FileText size={32} />, title: t('sell.benefit_3_title', 'Full Support'), desc: t('sell.benefit_3_desc', 'From listing to closing, we handle all paperwork and negotiations for you.') },
    ];

    return (
        <div style={{ background: '#fff', minHeight: '100vh' }}>
            <GuriPageHeader
                title={t('sell.title', 'List Your Property')}
                subtitle={t('sell.subtitle', "Listing your property for sale or rent doesn't have to be complicated. Let Guri24's experts help you get the maximum value with zero stress.")}
            />

            {/* Benefits Section */}
            <section style={{ padding: '100px 60px', background: '#f8f9fa' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <Title level={2} style={{ fontSize: '48px', fontWeight: 600, letterSpacing: '-1.5px' }}>{t('sell.why_list', 'Why List With Guri24?')}</Title>
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
                        <Title level={2} style={{ fontSize: '40px', fontWeight: 600, marginBottom: '24px' }}>{t('sell.ready_title', 'Ready to List Your Property?')}</Title>
                        <Paragraph style={{ fontSize: '18px', color: '#666', marginBottom: '48px' }}>{t('sell.ready_desc', 'Please log in or create an account to start the listing process with Guri24.')}</Paragraph>
                        <Space size="large">
                            <Button type="primary" size="large" onClick={() => navigate('/login')} style={{ background: '#1a1a1a', height: '56px', padding: '0 40px', borderRadius: '16px', fontWeight: 700 }}>{t('sell.login_btn', 'Log In')}</Button>
                            <Button size="large" onClick={() => navigate('/register')} style={{ height: '56px', padding: '0 40px', borderRadius: '16px', fontWeight: 700 }}>{t('sell.create_account_btn', 'Create Account')}</Button>
                        </Space>
                    </div>
                </section>
            ) : (
                <VerificationGate>
                    <section style={{ padding: '100px 60px' }}>
                        <div style={{ maxWidth: '1000px', margin: '0 auto', background: '#fff', padding: '64px', borderRadius: '48px', border: '1px solid #eee', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                            <Row gutter={64}>
                                <Col xs={24} lg={10}>
                                    <Title level={2} style={{ fontSize: '40px', fontWeight: 600, marginBottom: '24px' }}>{t('sell.form_title', 'List Your Property')}</Title>
                                    <Paragraph style={{ fontSize: '17px', color: '#666', lineHeight: '1.8', marginBottom: '48px' }}>
                                        {t('sell.form_desc', 'Fill out the form and one of our experts will contact you within 24 hours to discuss your property listing.')}
                                    </Paragraph>

                                    <div style={{ background: '#f8f9fa', padding: '32px', borderRadius: '24px' }}>
                                        <Title level={4} style={{ marginBottom: '24px', fontSize: '18px' }}>{t('sell.need_help', 'Need assistance?')}</Title>
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
                                                <Form.Item name="name" label={t('sell.name_label')} rules={[{ required: true }]}>
                                                    <Input placeholder={t('sell.placeholder_name')} style={{ borderRadius: '12px' }} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item name="email" label={t('sell.email_label')} rules={[{ required: true, type: 'email' }]}>
                                                    <Input placeholder={t('sell.placeholder_email')} style={{ borderRadius: '12px' }} />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item name="phone" label={t('sell.phone_label')} rules={[{ required: true }]}>
                                                    <Input placeholder={t('sell.placeholder_phone')} style={{ borderRadius: '12px' }} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item name="propertyType" label={t('sell.type_label')} rules={[{ required: true }]}>
                                                    <Select placeholder={t('sell.placeholder_type')} style={{ borderRadius: '12px' }}>
                                                        <Select.Option value="apartment">{t('categories.apartment', 'Apartment')}</Select.Option>
                                                        <Select.Option value="house">{t('categories.house', 'House')}</Select.Option>
                                                        <Select.Option value="villa">{t('categories.villa', 'Villa')}</Select.Option>
                                                        <Select.Option value="land">{t('categories.land', 'Land')}</Select.Option>
                                                        <Select.Option value="commercial">{t('categories.commercial', 'Commercial')}</Select.Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Form.Item name="location" label={t('sell.location_label')} rules={[{ required: true }]}>
                                            <Input placeholder={t('sell.placeholder_location')} style={{ borderRadius: '12px' }} />
                                        </Form.Item>
                                        <Form.Item name="description" label={t('sell.desc_label')}>
                                            <TextArea rows={4} placeholder={t('sell.placeholder_desc')} style={{ borderRadius: '12px' }} />
                                        </Form.Item>
                                        <Button type="primary" htmlType="submit" icon={<Send size={18} />} block style={{ background: '#0052cc', height: '60px', borderRadius: '16px', fontWeight: 700, fontSize: '18px', marginTop: '16px', border: 'none' }}>
                                            {t('sell.submit_btn', 'Submit Property')}
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
