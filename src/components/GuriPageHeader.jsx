import React from 'react';
import { Typography } from 'antd';
import './GuriPageHeader.css';

const { Title, Text: AntText } = Typography;

const GuriPageHeader = ({ title, subtitle }) => {
    return (
        <section className="guri-page-header">
            <div className="container-narrow">
                <Title level={1}>
                    {title}
                </Title>
                {subtitle && (
                    <AntText className="subtitle">
                        {subtitle}
                    </AntText>
                )}
            </div>
        </section>
    );
};

export default GuriPageHeader;
