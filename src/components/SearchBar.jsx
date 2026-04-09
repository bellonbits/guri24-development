import { useState } from 'react';
import { Button, Input, Select } from 'antd';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SearchBar = ({ onSearch }) => {
    const { t } = useTranslation();
    const [location, setLocation] = useState('');
    const [propertyType, setPropertyType] = useState('');
    const [priceRange, setPriceRange] = useState('');

    const handleSearch = () => {
        if (onSearch) {
            onSearch({ location, propertyType, priceRange });
        }
    };

    return (
        <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            flexWrap: 'wrap'
        }}>
            <div style={{ flex: '1 1 200px', minWidth: '150px' }}>
                <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px', paddingLeft: '12px' }}>{t('searchbar.location_label')}</div>
                <Input
                    placeholder={t('searchbar.location_placeholder')}
                    variant="borderless"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={{ fontSize: '14px', fontWeight: 500 }}
                />
            </div>

            <div style={{ width: '1px', height: '40px', background: '#e5e5e5', display: 'none', '@media (min-width: 768px)': { display: 'block' } }} />

            <div style={{ flex: '1 1 150px', minWidth: '120px' }}>
                <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px', paddingLeft: '12px' }}>{t('searchbar.type_label')}</div>
                <Select
                    placeholder={t('searchbar.type_placeholder')}
                    variant="borderless"
                    value={propertyType}
                    onChange={setPropertyType}
                    style={{ width: '100%', fontSize: '14px', fontWeight: 500 }}
                    options={[
                        { label: t('categories.apartment'), value: 'apartment' },
                        { label: t('categories.house'), value: 'house' },
                        { label: t('categories.villa'), value: 'villa' },
                        { label: t('categories.land'), value: 'land' },
                        { label: t('categories.commercial'), value: 'commercial' }
                    ]}
                />
            </div>

            <div style={{ width: '1px', height: '40px', background: '#e5e5e5' }} />

            <div style={{ flex: '1 1 150px', minWidth: '120px' }}>
                <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px', paddingLeft: '12px' }}>{t('searchbar.price_label')}</div>
                <Select
                    placeholder={t('searchbar.price_placeholder')}
                    variant="borderless"
                    value={priceRange}
                    onChange={setPriceRange}
                    style={{ width: '100%', fontSize: '14px', fontWeight: 500 }}
                    options={[
                        { label: t('searchbar.under_10m'), value: '0-10000000' },
                        { label: t('searchbar.10m_50m'), value: '10000000-50000000' },
                        { label: t('searchbar.50m_100m'), value: '50000000-100000000' },
                        { label: t('searchbar.above_100m'), value: '100000000-999999999' }
                    ]}
                />
            </div>

            <Button
                type="primary"
                size="large"
                icon={<Search size={18} />}
                onClick={handleSearch}
                style={{
                    background: '#1a1a1a',
                    border: 'none',
                    borderRadius: '16px',
                    height: '52px',
                    padding: '0 32px',
                    fontSize: '15px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}
            >
                {t('searchbar.search_property')}
            </Button>
        </div>
    );
};

export default SearchBar;
