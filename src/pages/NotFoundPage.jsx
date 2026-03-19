import React from 'react';
import { Button, Result, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

const { Title, Paragraph } = Typography;

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fff',
            padding: '20px'
        }}>
            <Result
                status="404"
                title={<Title level={1} style={{ fontSize: '72px', margin: 0 }}>404</Title>}
                subTitle={
                    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                        <Title level={3} style={{ marginBottom: '16px' }}>Page Not Found</Title>
                        <Paragraph style={{ fontSize: '16px', color: '#666' }}>
                            Oops! It looks like the property or page you're looking for doesn't exist or has been moved.
                        </Paragraph>
                    </div>
                }
                extra={
                    <Button
                        type="primary"
                        size="large"
                        icon={<Home size={18} />}
                        onClick={() => navigate('/')}
                        style={{
                            background: '#0052cc',
                            height: '56px',
                            padding: '0 32px',
                            borderRadius: '16px',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        Back to Home
                    </Button>
                }
            />
        </div>
    );
};

export default NotFoundPage;
