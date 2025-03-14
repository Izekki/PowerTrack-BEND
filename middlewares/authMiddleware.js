// middlewares/authMiddleware.js

import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';

const SECRET_JWT_KEY = process.env.JWT_SECRET;

export const authMiddleware = (req, res, next) => {
    console.log(" -- Solicitud de usuario", req.hostname, req.ip)
    const token = req.cookies?.access_token
    req.session = { user: null }

    try {
        if (token) {
            const data = jwt.verify(token, SECRET_JWT_KEY)
            req.session.user = data
        }
    } catch { }

    next()
}

