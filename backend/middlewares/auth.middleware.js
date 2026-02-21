import * as jose from 'jose';
import { sendError } from '../utils/response.utils.js';
import dotenv from 'dotenv';

dotenv.config();

// This is your project's live public key endpoint
const JWKS_URL = new URL(`${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`);
const remoteJWKSet = jose.createRemoteJWKSet(JWKS_URL);

export const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return sendError(res, 401, 'No token provided.');
        }

        const token = authHeader.split(' ')[1];

        // This fetches the public key and verifies the ES256 signature automatically
        const { payload } = await jose.jwtVerify(token, remoteJWKSet, {
            issuer: `${process.env.SUPABASE_URL}/auth/v1`,
            audience: 'authenticated',
        });

        // Attach Supabase UUID to the request
        req.user = { _id: payload.sub };
        next();
    } catch (error) {
        console.error("🔥 Auth Error:", error.message);
        return sendError(res, 401, 'Invalid or expired session. Please log in again.');
    }
};

export const restrictTo = (...roles) => (req, res, next) => next();