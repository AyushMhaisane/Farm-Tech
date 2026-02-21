import { FaFilter, FaSortAmountDown } from 'react-icons/fa';

const RESOURCE_TYPES = ['Tractor', 'Labour', 'Irrigation Equipment'];
const SERVICE_TYPES = ['Sowing', 'Ploughing', 'Irrigation', 'Fertilization'];
const SORT_OPTIONS = [
    { value: 'nearest', label: '📍 Nearest First' },
    { value: 'lowest_price', label: '💰 Lowest Price' },
    { value: 'highest_rating', label: '⭐ Highest Rating' },
];

const FilterBar = ({ filters, onChange }) => {
    const handleChange = (e) => onChange((f) => ({ ...f, [e.target.name]: e.target.value }));
    const handleReset = () => onChange({ type: '', serviceType: '', minPrice: '', maxPrice: '', sortBy: 'nearest' });

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500 flex items-center gap-1"><FaFilter size={10} /> Type</label>
                    <select name="type" className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={filters.type} onChange={handleChange}>
                        <option value="">All Types</option>
                        {RESOURCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500">Service</label>
                    <select name="serviceType" className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={filters.serviceType} onChange={handleChange}>
                        <option value="">All Services</option>
                        {SERVICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500">Min Price (₹)</label>
                    <input type="number" name="minPrice" className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" placeholder="0" value={filters.minPrice} onChange={handleChange} />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500">Max Price (₹)</label>
                    <input type="number" name="maxPrice" className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" placeholder="Any" value={filters.maxPrice} onChange={handleChange} />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500 flex items-center gap-1"><FaSortAmountDown size={10} /> Sort By</label>
                    <select name="sortBy" className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={filters.sortBy} onChange={handleChange}>
                        {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
                <div className="flex items-end">
                    <button className="w-full p-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg text-sm font-bold" onClick={handleReset}>
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterBar;