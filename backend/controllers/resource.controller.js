import Resource from '../models/resource.model.js';
import { haversineDistance } from '../utils/haversine.utils.js';
import { sendSuccess, sendError } from '../utils/response.utils.js';

export const createResource = async (req, res) => {
    try {
        const { type, serviceType, pricingUnit, pricePerHour, pricePerAcre, phone, description, location } = req.body;

        const resourceData = {
            provider: req.user._id,
            type,
            serviceType,
            pricingUnit,
            phone,
            description,
            location: {
                village: location?.village,
                latitude: parseFloat(location?.latitude),
                longitude: parseFloat(location?.longitude),
            },
            pricePerHour: pricingUnit === 'per_hour' ? parseFloat(pricePerHour) : undefined,
            pricePerAcre: pricingUnit === 'per_acre' ? parseFloat(pricePerAcre) : undefined,
        };

        const resource = await Resource.create(resourceData);
        return sendSuccess(res, 201, 'Resource created successfully', { resource });
    } catch (error) {
        console.error('🔥 Create Error:', error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllResources = async (req, res) => {
    try {
        const { type, serviceType, minPrice, maxPrice, sortBy, lat, lng } = req.query;
        const filter = { isAvailable: true };

        if (type) filter.type = type;
        if (serviceType) filter.serviceType = serviceType;
        if (minPrice || maxPrice) {
            const buildPriceRange = (min, max) => {
                const range = {};
                if (min) range.$gte = parseFloat(min);
                if (max) range.$lte = parseFloat(max);
                return range;
            };
            filter.$or = [
                { pricingUnit: 'per_hour', pricePerHour: buildPriceRange(minPrice, maxPrice) },
                { pricingUnit: 'per_acre', pricePerAcre: buildPriceRange(minPrice, maxPrice) },
            ];
        }

        let resources = await Resource.find(filter).lean(); // Removed populate since User model is gone

        const farmerLat = parseFloat(lat);
        const farmerLng = parseFloat(lng);
        const hasCoords = !isNaN(farmerLat) && !isNaN(farmerLng);

        resources = resources.map((r) => ({
            ...r,
            effectivePrice: r.pricingUnit === 'per_hour' ? r.pricePerHour : r.pricePerAcre,
            distanceKm: hasCoords ? haversineDistance(farmerLat, farmerLng, r.location.latitude, r.location.longitude) : null,
        }));

        if (sortBy === 'nearest' && hasCoords) {
            resources.sort((a, b) => a.distanceKm - b.distanceKm);
        } else if (sortBy === 'lowest_price') {
            resources.sort((a, b) => a.effectivePrice - b.effectivePrice);
        } else if (sortBy === 'highest_rating') {
            resources.sort((a, b) => b.ratingAverage - a.ratingAverage);
        }

        return sendSuccess(res, 200, 'Resources fetched', { count: resources.length, resources });
    } catch (error) {
        console.error('Get resources error:', error);
        return sendError(res, 500, 'Failed to fetch resources.');
    }
};

export const getMyResources = async (req, res) => {
    try {
        const resources = await Resource.find({ provider: req.user._id })
            .sort({ createdAt: -1 });

        return sendSuccess(res, 200, 'Your resources fetched', { resources });
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

export const getResourceById = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id).lean();
        if (!resource) return sendError(res, 404, 'Resource not found.');
        return sendSuccess(res, 200, 'Resource fetched', { resource });
    } catch (error) {
        return sendError(res, 500, 'Failed to fetch resource.');
    }
};

export const updateResource = async (req, res) => {
    try {
        const resource = await Resource.findOne({ _id: req.params.id, provider: req.user._id });
        if (!resource) return sendError(res, 404, 'Resource not found or you are not the owner.');

        const { type, serviceType, pricingUnit, pricePerHour, pricePerAcre, phone, description, location } = req.body;

        // Manually update to ensure data types match Mongoose schema
        if (type) resource.type = type;
        if (serviceType) resource.serviceType = serviceType;
        if (pricingUnit) resource.pricingUnit = pricingUnit;
        if (phone) resource.phone = phone;
        if (description !== undefined) resource.description = description;

        if (pricingUnit === 'per_hour') {
            resource.pricePerHour = parseFloat(pricePerHour);
            resource.pricePerAcre = undefined;
        } else if (pricingUnit === 'per_acre') {
            resource.pricePerAcre = parseFloat(pricePerAcre);
            resource.pricePerHour = undefined;
        }

        if (location) {
            resource.location = {
                village: location.village || resource.location.village,
                latitude: parseFloat(location.latitude) || resource.location.latitude,
                longitude: parseFloat(location.longitude) || resource.location.longitude,
            };
        }

        await resource.save();
        return sendSuccess(res, 200, 'Resource updated successfully', { resource });
    } catch (error) {
        console.error('🔥 Update Error:', error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findOneAndDelete({ _id: req.params.id, provider: req.user._id });
        if (!resource) return sendError(res, 404, 'Resource not found or you are not the owner.');
        return sendSuccess(res, 200, 'Resource deleted successfully.');
    } catch (error) {
        console.error('🔥 Delete Error:', error.message);
        return sendError(res, 500, 'Failed to delete resource.');
    }
};

export const toggleAvailability = async (req, res) => {
    try {
        const resource = await Resource.findOne({ _id: req.params.id, provider: req.user._id });
        if (!resource) return sendError(res, 404, 'Resource not found or you are not the owner.');

        resource.isAvailable = !resource.isAvailable;
        await resource.save();
        return sendSuccess(res, 200, `Resource marked as ${resource.isAvailable ? 'Available' : 'Busy'}`, { resource });
    } catch (error) {
        return sendError(res, 500, 'Failed to update availability.');
    }
};