import { useState, useEffect } from 'react';
import { resourceService } from '../../services/api.service';
import ResourceFormModal from './ResourceFormModal';

const ProviderDashboard = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // NEW: State to hold the resource being edited
    const [editingResource, setEditingResource] = useState(null);

    // Function to fetch your resources from MongoDB
    const fetchResources = async () => {
        try {
            setLoading(true);
            const res = await resourceService.getMy();
            setResources(res.data.data.resources);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Run this when the page first loads
    useEffect(() => {
        fetchResources();
    }, []);

    // NEW: Handle deleting a resource
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this equipment?")) {
            try {
                await resourceService.delete(id);
                // Remove the deleted item from the state immediately without reloading the page
                setResources(prev => prev.filter(item => item._id !== id));
                alert("Equipment removed successfully.");
            } catch (err) {
                console.error("Delete error:", err);
                alert("Failed to delete resource. Check the console.");
            }
        }
    };

    // NEW: Handle opening the modal in edit mode
    const handleEdit = (resource) => {
        setEditingResource(resource);
        setIsModalOpen(true);
    };

    // NEW: Handle opening the modal for a new resource
    const handleAddNew = () => {
        setEditingResource(null);
        setIsModalOpen(true);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800">My Listed Equipment</h2>
                <button
                    onClick={handleAddNew}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-green-700 transition-all"
                >
                    + Add New Resource
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-500 font-medium">Loading your equipment...</div>
            ) : resources.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold">You haven't listed any equipment yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.map((item) => (
                        <div key={item._id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-start mb-3">
                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                                    {item.type}
                                </span>
                                <span className="text-slate-900 font-extrabold text-lg">
                                    ₹{item.pricingUnit === 'per_hour' ? item.pricePerHour : item.pricePerAcre}
                                    <span className="text-slate-400 text-xs font-normal">/{item.pricingUnit.replace('_', ' ')}</span>
                                </span>
                            </div>
                            <h3 className="font-bold text-slate-800 text-lg">{item.serviceType}</h3>
                            <p className="text-slate-500 text-sm mb-4">📍 {item.location.village}</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(item)}
                                    className="flex-1 py-2 bg-slate-50 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(item._id)}
                                    className="px-4 py-2 bg-red-50 text-red-500 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <ResourceFormModal
                    // NEW: Pass the resource to edit (will be null if adding new)
                    resource={editingResource}
                    isEditing={!!editingResource}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingResource(null);
                    }}
                    onSaved={() => {
                        setIsModalOpen(false);
                        setEditingResource(null);
                        fetchResources(); // Refresh the list after saving
                    }}
                />
            )}
        </div>
    );
};

export default ProviderDashboard;