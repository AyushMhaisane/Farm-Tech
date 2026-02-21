import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
    provider: { type: String, required: true, ref: 'User', index: true }, type: { type: String, enum: ['Tractor', 'Labour', 'Irrigation Equipment'], required: true },
    serviceType: { type: String, enum: ['Sowing', 'Ploughing', 'Irrigation', 'Fertilization'], required: true },
    pricePerHour: { type: Number, min: 0 },
    pricePerAcre: { type: Number, min: 0 },
    pricingUnit: { type: String, enum: ['per_hour', 'per_acre'], required: true, default: 'per_hour' },
    location: {
        village: { type: String, required: true, trim: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
    },
    phone: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    isAvailable: { type: Boolean, default: true, index: true },
    ratingTotal: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    ratingAverage: { type: Number, default: 5.0, min: 1, max: 5 },
}, { timestamps: true });

resourceSchema.virtual('effectivePrice').get(function () {
    return this.pricingUnit === 'per_hour' ? this.pricePerHour : this.pricePerAcre;
});

resourceSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Resource', resourceSchema);