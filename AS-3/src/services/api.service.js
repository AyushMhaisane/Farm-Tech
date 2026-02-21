import axios from 'axios';
// Import your Supabase client (adjust the path if yours is named differently)
import { supabase } from '../supabaseClient';

const API_BASE = 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

// Grab the token dynamically from Supabase
api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
});

// We deleted authService since Supabase handles login now!

export const resourceService = {
    getAll: (params) => api.get('/resources', { params }),
    getMy: () => api.get('/resources/my'),
    getById: (id) => api.get(`/resources/${id}`),
    create: (data) => api.post('/resources', data),
    update: (id, data) => api.put(`/resources/${id}`, data),
    delete: (id) => api.delete(`/resources/${id}`),
    toggleAvailability: (id) => api.patch(`/resources/${id}/availability`),

};

// Ratings (Stubbed for now)
export const ratingService = {};

// Requirements (Stubbed for now)
export const requirementService = {};

// Contacts (Stubbed for now)
export const contactService = {};

export default api;