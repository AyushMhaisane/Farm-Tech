import express from 'express';
import { body } from 'express-validator';
import {
    createResource, getAllResources, getMyResources,
    getResourceById, updateResource, deleteResource, toggleAvailability
} from '../controllers/resource.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = express.Router();

const resourceValidation = [
    body('type').isIn(['Tractor', 'Labour', 'Irrigation Equipment']).withMessage('Invalid resource type'),
    body('serviceType').isIn(['Sowing', 'Ploughing', 'Irrigation', 'Fertilization']).withMessage('Invalid service type'),
    body('pricingUnit').isIn(['per_hour', 'per_acre']).withMessage('Pricing unit must be per_hour or per_acre'),
    body('location.village').trim().notEmpty().withMessage('Village name is required'),
    body('location.latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
    body('location.longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
];

router.get('/', protect, getAllResources);
router.get('/my', protect, restrictTo('provider'), getMyResources);
router.post('/', protect, restrictTo('provider'), resourceValidation, validate, createResource);
router.put('/:id', protect, restrictTo('provider'), updateResource);
router.delete('/:id', protect, restrictTo('provider'), deleteResource);
router.patch('/:id/availability', protect, restrictTo('provider'), toggleAvailability);
router.get('/:id', protect, getResourceById);

export default router;