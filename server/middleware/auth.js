import jwt from 'jsonwebtoken';  // ✅ Use import instead of require()

export const authUser = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.headers.authorization;
        console.log('Auth token:', token);

        if (!token) {
            return res.status(401).json({ error: "Please login to continue" });
        }

        // Remove Bearer prefix if present
        const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;
        console.log('Token value:', tokenValue);

        // Verify token
        const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);

        // Set user object in request
        req.user = {
            _id: decoded.id,
            id: decoded.id,
            userType: decoded.userType
        };
        console.log('Set user:', req.user);

        next();
    } catch (err) {
        console.error('Auth error:', {
            message: err.message,
            stack: err.stack,
            token: req.headers.authorization
        });
        
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: "Invalid token, please login again" });
        }
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Token expired, please login again" });
        }
        res.status(500).json({ error: "Server error, please try again" });
    }
};
