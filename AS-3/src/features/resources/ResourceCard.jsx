import { FaMapMarkerAlt, FaPhone, FaStar } from 'react-icons/fa';

const TYPE_ICONS = { Tractor: '🚜', Labour: '👨‍🌾', 'Irrigation Equipment': '💧' };

const ResourceCard = ({ resource }) => {
    const price = resource.pricingUnit === 'per_hour' ? resource.pricePerHour : resource.pricePerAcre;
    const priceLabel = resource.pricingUnit === 'per_hour' ? '/hr' : '/acre';

    return (
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <span className="text-3xl bg-slate-50 w-12 h-12 flex items-center justify-center rounded-2xl">
                        {TYPE_ICONS[resource.type] || '🌾'}
                    </span>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">{resource.type}</p>
                        <h3 className="font-extrabold text-slate-800 text-lg">{resource.serviceType}</h3>
                    </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${resource.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {resource.isAvailable ? '✓ Available' : '✗ Busy'}
                </span>
            </div>

            <div className="flex-grow">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-3 font-medium">
                    <FaMapMarkerAlt className="text-red-400" />
                    <span>{resource.location?.village || 'Unknown Village'}</span>
                    {resource.distanceKm != null && (
                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md text-xs font-bold ml-auto">
                            📍 {resource.distanceKm.toFixed(1)} km away
                        </span>
                    )}
                </div>
                <div className="bg-slate-50 p-3 rounded-xl mb-4 border border-slate-100 flex items-baseline">
                    <span className="text-2xl font-black text-slate-800">₹{price?.toLocaleString()}</span>
                    <span className="text-slate-500 font-medium ml-1 text-sm">{priceLabel}</span>
                </div>
                {resource.description && (
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">{resource.description}</p>
                )}
            </div>

            <div className="flex gap-2 mt-auto">
                <button className="flex-1 bg-green-600 text-white py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                    <FaPhone /> Contact
                </button>
                <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold">
                    <FaStar className="text-amber-400" />
                </button>
            </div>
        </div>
    );
};

export default ResourceCard;