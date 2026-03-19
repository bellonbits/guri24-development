import { useState } from 'react';
import { Button, Input, Select } from 'antd';
import { Search } from 'lucide-react';

const SearchBar = ({ onSearch }) => {
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
                <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px', paddingLeft: '12px' }}>Location</div>
                <Input
                    placeholder="Westlands"
                    variant="borderless"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={{ fontSize: '14px', fontWeight: 500 }}
                />
            </div>

            <div style={{ width: '1px', height: '40px', background: '#e5e5e5', display: 'none', '@media (min-width: 768px)': { display: 'block' } }} />

            <div style={{ flex: '1 1 150px', minWidth: '120px' }}>
                <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px', paddingLeft: '12px' }}>Type</div>
                <Select
                    placeholder="Apartment"
                    variant="borderless"
                    value={propertyType}
                    onChange={setPropertyType}
                    style={{ width: '100%', fontSize: '14px', fontWeight: 500 }}
                    options={[
                        { label: 'Apartment', value: 'apartment' },
                        { label: 'House', value: 'house' },
                        { label: 'Villa', value: 'villa' },
                        { label: 'Land', value: 'land' }
                    ]}
                />
            </div>

            <div style={{ width: '1px', height: '40px', background: '#e5e5e5' }} />

            <div style={{ flex: '1 1 150px', minWidth: '120px' }}>
                <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px', paddingLeft: '12px' }}>Price</div>
                <Select
                    placeholder="10M - 50M"
                    variant="borderless"
                    value={priceRange}
                    onChange={setPriceRange}
                    style={{ width: '100%', fontSize: '14px', fontWeight: 500 }}
                    options={[
                        { label: 'Under 10M', value: '0-10000000' },
                        { label: '10M - 50M', value: '10000000-50000000' },
                        { label: '50M - 100M', value: '50000000-100000000' },
                        { label: 'Above 100M', value: '100000000-999999999' }
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
                Search Property
            </Button>
        </div>
    );
};

export default SearchBar;
