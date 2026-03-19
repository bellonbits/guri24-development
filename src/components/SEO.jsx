import { useEffect } from 'react';

const SEO = ({ title, description }) => {
    useEffect(() => {
        const defaultTitle = "Guri24 - East Africa's Trusted Real Estate Platform";
        const defaultDescription = "Find your dream home with Guri24. The leading platform for buying, selling, and renting properties across East Africa.";

        document.title = title ? `${title} | Guri24` : defaultTitle;

        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', description || defaultDescription);
        }
    }, [title, description]);

    return null;
};

export default SEO;
