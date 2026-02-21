import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// GET Profile
export const getProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "Row not found"

        // If no profile exists yet, return empty/default data
        res.json(data || {});
    } catch (error) {
        console.error("Fetch Profile Error:", error);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
};

// UPDATE Profile
export const updateProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const profileData = req.body;

        // Upsert will update if it exists, or insert if it's new
        const { data, error } = await supabase
            .from('profiles')
            .upsert({ id: userId, ...profileData })
            .select()
            .single();

        if (error) throw error;

        res.json({ message: "Profile updated successfully", data });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ error: "Failed to update profile" });
    }
};