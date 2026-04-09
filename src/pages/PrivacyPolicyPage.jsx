import React from 'react';
import { Typography, Divider } from 'antd';
import GuriPageHeader from '../components/GuriPageHeader';

const { Title, Paragraph, Text } = Typography;

const PrivacyPolicyPage = () => {
    return (
        <div className="privacy-policy-page">
            <GuriPageHeader title="Privacy Policy" subtitle="How we handle your sensitive user and device data" />
            
            <div className="container" style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto', background: 'var(--white)', borderRadius: 'var(--radius-2xl)', marginTop: '40px', marginBottom: '40px', boxShadow: 'var(--shadow-sm)' }}>
                <Typography>
                    <Title level={4}>Last Updated: {new Date().toLocaleDateString()}</Title>
                    <Paragraph>
                        Welcome to Guri24 ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and share information about you when you use our website, mobile applications, and other online products and services (collectively, the "Services").
                    </Paragraph>

                    <Divider />

                    <Title level={3}>1. Information We Collect</Title>
                    <Paragraph>
                        We collect information you provide directly to us. For example, we collect information when you create an account, update your profile, use the interactive features of our Services, fill out a form, request customer support, or otherwise communicate with us.
                    </Paragraph>
                    <ul>
                        <li><Text strong>Personal Data:</Text> Name, email address, phone number, and account credentials.</li>
                        <li><Text strong>Device Data:</Text> IP address, device type, operating system, and browser information.</li>
                        <li><Text strong>Location Data:</Text> With your permission, we may collect precise geolocation data to show you nearby properties.</li>
                    </ul>

                    <Title level={3}>2. How We Use Your Information</Title>
                    <Paragraph>
                        We use the information we collect to:
                    </Paragraph>
                    <ul>
                        <li>Provide, maintain, and improve our Services.</li>
                        <li>Process transactions and send related information, including confirmations and receipts.</li>
                        <li>Send technical notices, updates, security alerts, and support and administrative messages.</li>
                        <li>Respond to your comments, questions, and requests, and provide customer service.</li>
                        <li>Communicate with you about products, services, offers, promotions, and events.</li>
                    </ul>

                    <Title level={3}>3. Sharing of Information</Title>
                    <Paragraph>
                        We do not share your personal information with third parties except as described in this privacy policy:
                    </Paragraph>
                    <ul>
                        <li><Text strong>With Service Providers:</Text> We may share information with vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.</li>
                        <li><Text strong>Legal Requirements:</Text> We may disclose information if we believe in good faith that such disclosure is necessary to comply with any applicable law, regulation, legal process, or governmental request.</li>
                    </ul>

                    <Title level={3}>4. Children's Privacy</Title>
                    <Paragraph>
                        Our Services do not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If we discover that a child under 13 has provided us with personal information, we immediately delete this from our servers. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so that we will be able to do necessary actions.
                    </Paragraph>

                    <Title level={3}>5. Your Rights and Choices</Title>
                    <Paragraph>
                        You have the right to access, update, or delete your personal information. You can do this through your account settings or by contacting us directly. You may also opt out of receiving promotional communications from us by following the instructions in those messages.
                    </Paragraph>

                    <Title level={3}>6. Data Retention and Account Deletion</Title>
                    <Paragraph>
                        We retain your personal information only for as long as is necessary to fulfill the purposes for which it was collected, comply with our legal obligations, resolve disputes, and enforce our agreements.
                    </Paragraph>
                    <Paragraph>
                        <Text strong>Account Deletion:</Text> You may request the deletion of your account and associated personal data at any time. You can delete your account directly through the settings menu in the mobile app and website, by visiting our dedicated deletion page at <a href="/delete">guri24.com/delete</a>, or by contacting our support team at <a href="mailto:support@guri24.com">support@guri24.com</a>. Upon receiving a deletion request, we will securely delete or anonymize your data within 30 days, except for information we are legally required to retain (such as transaction records).
                    </Paragraph>

                    <Title level={3}>7. Changes to This Privacy Policy</Title>
                    <Paragraph>
                        We may change this Privacy Policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy and, in some cases, we may provide you with additional notice (such as adding a statement to our homepage or sending you a notification).
                    </Paragraph>

                    <Title level={3}>8. Contact Us</Title>
                    <Paragraph>
                        If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:privacy@guri24.com">privacy@guri24.com</a>
                    </Paragraph>
                </Typography>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
