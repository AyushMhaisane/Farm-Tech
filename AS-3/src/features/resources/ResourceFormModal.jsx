import { useState } from 'react';
import { resourceService } from '../../services/api.service';

const RESOURCE_TYPES = ['Tractor', 'Labour', 'Irrigation Equipment'];
const SERVICE_TYPES = ['Sowing', 'Ploughing', 'Irrigation', 'Fertilization'];

const defaultForm = {
    type: '', serviceType: '', pricingUnit: 'per_hour',
    pricePerHour: '', pricePerAcre: '', phone: '', description: '',
    village: '', latitude: '', longitude: '',
};

const ResourceFormModal = ({ resource, onClose, onSaved }) => {
    const isEditing = !!resource;
    const [form, setForm] = useState(isEditing ? { ...defaultForm, ...resource } : defaultForm);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleUseLocation = () => {
        if (!navigator.geolocation) return alert('Geolocation not supported');
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                setForm((f) => ({ ...f, latitude: coords.latitude.toFixed(6), longitude: coords.longitude.toFixed(6) }));
            },
            () => alert('Could not get location')
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // 1. Format the data exactly how the MongoDB schema expects it
            const payload = {
                type: form.type,
                serviceType: form.serviceType,
                pricingUnit: form.pricingUnit,
                pricePerHour: form.pricingUnit === 'per_hour' ? parseFloat(form.pricePerHour) : undefined,
                pricePerAcre: form.pricingUnit === 'per_acre' ? parseFloat(form.pricePerAcre) : undefined,
                phone: form.phone,
                location: {
                    village: form.village,
                    latitude: parseFloat(form.latitude),
                    longitude: parseFloat(form.longitude),
                }
            };

            // 2. Send it to the backend!
            if (isEditing) {
                await resourceService.update(resource._id, payload);
                alert('🚜 Resource updated successfully!');
            } else {
                await resourceService.create(payload);
                alert('🚜 Resource listed successfully!');
            }

            onSaved(); // Close the modal and refresh the list
        } catch (err) {
            console.error("API Error:", err);
            alert(err.response?.data?.message || 'Failed to save resource. Check the console.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in">

                {/* Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">
                        {isEditing ? '✏️ Edit Resource' : '➕ Add New Resource'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors text-2xl font-bold">
                        ×
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Resource Type *</label>
                            <select name="type" value={form.type} onChange={handleChange} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none">
                                <option value="">Select type</option>
                                {RESOURCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Service Type *</label>
                            <select name="serviceType" value={form.serviceType} onChange={handleChange} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none">
                                <option value="">Select service</option>
                                {SERVICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Pricing Unit *</label>
                        <div className="flex gap-4">
                            {['per_hour', 'per_acre'].map((u) => (
                                <label key={u} className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                                    <input type="radio" name="pricingUnit" value={u} checked={form.pricingUnit === u} onChange={handleChange} className="w-4 h-4 text-green-600 focus:ring-green-500" />
                                    {u === 'per_hour' ? '₹ Per Hour' : '₹ Per Acre'}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Price (₹) *</label>
                            <input type="number" name={form.pricingUnit === 'per_hour' ? 'pricePerHour' : 'pricePerAcre'} value={form.pricingUnit === 'per_hour' ? form.pricePerHour : form.pricePerAcre} onChange={handleChange} required placeholder="e.g. 500" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number *</label>
                            <input type="tel" name="phone" value={form.phone} onChange={handleChange} required placeholder="9876543210" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Village / Location *</label>
                        <input type="text" name="village" value={form.village} onChange={handleChange} required placeholder="Enter village name" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>

                    <div>
                        <div className="flex justify-between items-end mb-1">
                            <label className="block text-sm font-bold text-slate-700">GPS Coordinates *</label>
                            <button type="button" onClick={handleUseLocation} className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded">📍 Auto-detect</button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" step="any" name="latitude" value={form.latitude} onChange={handleChange} required placeholder="Latitude" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                            <input type="number" step="any" name="longitude" value={form.longitude} onChange={handleChange} required placeholder="Longitude" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <button type="button" onClick={onClose} className="px-6 py-3 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                        <button type="submit" disabled={submitting} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-md transition-colors disabled:opacity-50">
                            {submitting ? 'Saving...' : isEditing ? 'Update Resource' : 'List Resource'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResourceFormModal;