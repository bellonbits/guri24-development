import { Link } from 'react-router-dom';
import './ComparePage.css';
import { useCompare } from '../context/CompareContext';
import { Check, X, ArrowLeft, Trash2, MapPin, Bed, Bath, Square } from 'lucide-react';
import { formatPrice } from '../utils/propertyApi';

function ComparePage() {
    const { compareList, removeFromCompare, clearCompare } = useCompare();

    if (compareList.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white pt-20">
                <div className="text-center space-y-6 max-w-md px-6">
                    <h2 className="text-3xl font-bold text-text-dark">No properties to compare</h2>
                    <p className="text-gray-500 font-medium">Select properties from the listings to see them side by side.</p>
                    <Link to="/listings" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
                        <ArrowLeft size={20} />
                        Browse Properties
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-32 pb-20">
            <div className="max-w-[1440px] mx-auto px-6">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-4xl font-bold text-text-dark tracking-tight">Compare Properties</h1>
                    <button
                        className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-500 hover:text-red-500 hover:border-red-500 hover:bg-red-50 transition-all"
                        onClick={clearCompare}
                    >
                        <Trash2 size={18} />
                        Clear All
                    </button>
                </div>

                <div className="overflow-x-auto rounded-[32px] border border-gray-100 shadow-xl bg-white">
                    <table className="w-full min-w-[1000px] border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="p-8 text-left text-sm font-bold text-gray-400 uppercase tracking-widest w-[200px]">Feature</th>
                                {compareList.map(property => (
                                    <th key={property.id} className="p-8 text-left align-top min-w-[300px] border-l border-gray-100 relative group">
                                        <button
                                            className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                            onClick={() => removeFromCompare(property.id)}
                                            title="Remove"
                                        >
                                            <X size={20} />
                                        </button>
                                        <div className="space-y-4">
                                            <Link to={`/property/${property.slug}`} className="block rounded-2xl overflow-hidden aspect-[4/3] shadow-sm mb-4">
                                                <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                            </Link>
                                            <Link to={`/property/${property.slug}`} className="block text-xl font-bold text-text-dark hover:text-primary transition-colors line-clamp-2 min-h-[56px]">
                                                {property.title}
                                            </Link>
                                            <div className="text-2xl font-bold text-primary">
                                                {formatPrice(property.price, property.currency)}
                                            </div>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {[
                                { label: 'Location', icon: MapPin, render: (p) => `${p.location.city}, ${p.location.country}` },
                                { label: 'Type', render: (p) => <span className="capitalize font-bold text-text-dark">{p.type}</span> },
                                {
                                    label: 'Purpose', render: (p) => (
                                        <span className={`inline-flex px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${p.purpose.toLowerCase() === 'sell' ? 'bg-blue-50 text-blue-600' :
                                                p.purpose.toLowerCase() === 'rent' ? 'bg-orange-50 text-orange-600' :
                                                    'bg-purple-50 text-purple-600'
                                            }`}>
                                            {p.purpose}
                                        </span>
                                    )
                                },
                                { label: 'Bedrooms', icon: Bed, render: (p) => p.bedrooms || '-' },
                                { label: 'Bathrooms', icon: Bath, render: (p) => p.bathrooms || '-' },
                                { label: 'Size', icon: Square, render: (p) => `${p.size} m²` },
                                {
                                    label: 'Amenities', render: (p) => (
                                        <div className="space-y-2">
                                            {(Array.isArray(p.features) ? p.features : []).slice(0, 5).map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-sm font-bold text-gray-500">
                                                    <Check size={14} className="text-primary" strokeWidth={3} />
                                                    {feature}
                                                </div>
                                            ))}
                                            {(Array.isArray(p.features) ? p.features : []).length > 5 && (
                                                <span className="text-xs font-bold text-primary pl-6">+{(Array.isArray(p.features) ? p.features : []).length - 5} more</span>
                                            )}
                                        </div>
                                    )
                                },
                                {
                                    label: '', render: (p) => (
                                        <Link to={`/property/${p.slug}`} className="block w-full py-4 text-center bg-gray-900 text-white font-bold rounded-xl hover:bg-primary transition-all shadow-lg hover:shadow-xl">
                                            View Details
                                        </Link>
                                    )
                                }
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-8 text-sm font-bold text-gray-400 uppercase tracking-widest align-top">
                                        <div className="flex items-center gap-2">
                                            {row.icon && <row.icon size={16} />}
                                            {row.label}
                                        </div>
                                    </td>
                                    {compareList.map(property => (
                                        <td key={property.id} className="p-8 align-top border-l border-gray-100">
                                            <div className="font-bold text-text-dark">
                                                {row.render(property)}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ComparePage;
