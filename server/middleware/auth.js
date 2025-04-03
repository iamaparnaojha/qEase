import jwt from 'jsonwebtoken';  // ✅ Use import instead of require()

export const authUser = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers?.authorization?.startsWith('Bearer ') 
            ? req.headers.authorization.split(" ")[1] 
            : null;

            // console.log(token)

        if (!token) {
            return res.status(401).json({ error: "Please login to continue" });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: "Invalid token, please login again" });
        }
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Token expired, please login again" });
        }
        res.status(500).json({ error: "Server error, please try again" });
    }
};
