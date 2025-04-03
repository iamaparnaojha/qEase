import jwt from 'jsonwebtoken';  // ✅ Use import instead of require()

export const authUser = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ error: "Please login to continue" });
        }

        // Remove Bearer prefix if present
        const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;

        // Verify token
        const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: "Invalid token, please login again" });
        }
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Token expired, please login again" });
        }
        console.error('Auth error:', err);
        res.status(500).json({ error: "Server error, please try again" });
    }
};
