import { useState, useEffect } from 'react';

const Profile = () => {
    // Using a dummy ID for now until you integrate your teammate's Supabase Auth
    const DUMMY_USER_ID = '123e4567-e89b-12d3-a456-426614174000';

    // State to hold all profile data
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        language: 'Marathi',
        village: '',
        district: '',
        landSize: 'Less than 2 Acres',
        soilType: 'Black Cotton',
        irrigation: 'Rain-fed',
    });

    const [profileImage, setProfileImage] = useState("https://api.dicebear.com/7.x/avataaars/svg?seed=Farmer");
    const [saveStatus, setSaveStatus] = useState('');

    // 1. FETCH DATA ON LOAD
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/profile/${DUMMY_USER_ID}`);
                if (response.ok) {
                    const data = await response.json();
                    // If data exists in the database, populate the form
                    if (Object.keys(data).length > 0) {
                        setFormData({
                            fullName: data.full_name || '',
                            phone: data.phone || '',
                            language: data.language || 'Marathi',
                            village: data.village || '',
                            district: data.district || '',
                            landSize: data.land_size || 'Less than 2 Acres',
                            soilType: data.soil_type || 'Black Cotton',
                            irrigation: data.irrigation || 'Rain-fed'
                        });
                        if (data.profile_image_url) {
                            setProfileImage(data.profile_image_url);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };

        fetchProfile();
    }, []);

    // Handle standard text/select inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle the file upload (creates a local preview for now)
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Note: In a full production app, you would upload this file to Supabase Storage first.
            const imageUrl = URL.createObjectURL(file);
            setProfileImage(imageUrl);
        }
    };

    // 2. SEND DATA ON SAVE
    const handleSave = async (e) => {
        e.preventDefault();
        setSaveStatus('Saving...');

        // Map the React state to match the Supabase database column names exactly
        const payload = {
            full_name: formData.fullName,
            phone: formData.phone,
            language: formData.language,
            village: formData.village,
            district: formData.district,
            land_size: formData.landSize,
            soil_type: formData.soilType,
            irrigation: formData.irrigation,
            profile_image_url: profileImage
        };

        try {
            const response = await fetch(`http://localhost:3000/api/profile/${DUMMY_USER_ID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setSaveStatus('Profile updated successfully!');
                setTimeout(() => setSaveStatus(''), 3000); // Clear message after 3 seconds
            } else {
                setSaveStatus('Failed to save profile.');
            }
        } catch (error) {
            console.error("Error saving profile:", error);
            setSaveStatus('Error saving profile.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-6">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Farmer Profile</h2>
                <p className="text-gray-500 mt-1">Manage your personal details and farm specifications to get personalized scheme recommendations.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">

                {/* TOP SECTION: Photo & Basic Info */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-center md:items-start">

                    {/* Photo Upload Area */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="relative h-32 w-32 rounded-full border-4 border-green-100 overflow-hidden shadow-md group">
                            <img src={profileImage} alt="Profile Preview" className="h-full w-full object-cover" />
                            {/* Hover Overlay for Camera Icon */}
                            <label className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <span className="text-white text-2xl">📷</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                        </div>
                        <span className="text-sm text-gray-500 font-medium">Click photo to update</span>
                    </div>

                    {/* Core Personal Details */}
                    <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                            <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">App Language Preference</label>
                            <select name="language" value={formData.language} onChange={handleInputChange} className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none">
                                <option value="English">English</option>
                                <option value="Marathi">Marathi</option>
                                <option value="Hindi">Hindi</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* BOTTOM SECTION: Farm & Location Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Location Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 border-b pb-3 mb-4">📍 Location Details</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Village / Taluka</label>
                                <input type="text" name="village" value={formData.village} onChange={handleInputChange} className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">District</label>
                                <input type="text" name="district" value={formData.district} onChange={handleInputChange} className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Agricultural Profile Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 border-b pb-3 mb-4">🌾 Agricultural Profile</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Total Land Size</label>
                                <select name="landSize" value={formData.landSize} onChange={handleInputChange} className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none">
                                    <option value="Less than 2 Acres">Less than 2 Acres (Marginal)</option>
                                    <option value="2 to 5 Acres">2 to 5 Acres (Small)</option>
                                    <option value="5+ Acres">5+ Acres (Large)</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Soil Type</label>
                                    <select name="soilType" value={formData.soilType} onChange={handleInputChange} className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none">
                                        <option value="Black Cotton">Black Cotton</option>
                                        <option value="Red">Red</option>
                                        <option value="Alluvial">Alluvial</option>
                                        <option value="Laterite">Laterite</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Irrigation</label>
                                    <select name="irrigation" value={formData.irrigation} onChange={handleInputChange} className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none">
                                        <option value="Rain-fed">Rain-fed</option>
                                        <option value="Drip">Drip</option>
                                        <option value="Canal">Canal</option>
                                        <option value="Borewell">Borewell</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-4 mt-6">
                    {saveStatus && (
                        <span className={`font-semibold ${saveStatus.includes('Error') || saveStatus.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
                            {saveStatus}
                        </span>
                    )}
                    <button type="submit" className="bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors">
                        Save Profile
                    </button>
                </div>

            </form>
        </div>
    );
};

export default Profile;