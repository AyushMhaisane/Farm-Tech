import { useState, useEffect, useCallback } from 'react';
import { resourceService } from '../../services/api.service';
import { supabase } from '../../supabaseClient';
import ResourceCard from './ResourceCard';
import FilterBar from './FilterBar';
import { FaSeedling } from 'react-icons/fa';

const FarmerDashboard = () => {
    const [userEmail, setUserEmail] = useState('Farmer');
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ type: '', serviceType: '', minPrice: '', maxPrice: '', sortBy: 'nearest' });
    const [coords, setCoords] = useState(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) setUserEmail(user.email);
        });
    }, []);

    useEffect(() => {
        if (!coords && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                ({ coords: c }) => setCoords({ lat: c.latitude, lng: c.longitude }),
                () => console.warn("GPS disabled")
            );
        }
    }, [coords]);

    const fetchResources = useCallback(async () => {
        setLoading(true);
        try {
            const params = { ...filters };
            if (coords) { params.lat = coords.lat; params.lng = coords.lng; }
            Object.keys(params).forEach((k) => !params[k] && delete params[k]);

            const res = await resourceService.getAll(params);
            setResources(res.data.data.resources);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filters, coords]);

    useEffect(() => { fetchResources(); }, [fetchResources]);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h2 className="text-3xl font-extrabold text-slate-800 flex items-center gap-2 mb-1">
                    <FaSeedling className="text-green-600" /> Equipment Explorer
                </h2>
                <p className="text-slate-500 font-medium">Logged in as {userEmail}</p>
            </div>

            <FilterBar filters={filters} onChange={setFilters} />

            {loading ? (
                <div className="text-center py-20 text-slate-500 font-bold">Loading equipment...</div>
            ) : resources.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
                    <p className="text-slate-500 font-bold">No resources found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.map((r) => <ResourceCard key={r._id} resource={r} />)}
                </div>
            )}
        </div>
    );
};

export default FarmerDashboard;