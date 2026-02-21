import { validationResult } from 'express-validator';
import { sendError } from '../utils/response.utils.js';

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const firstError = errors.array()[0].msg;
        return sendError(res, 422, firstError);
    }
    next();
};