// robot-app-backend/src/middleware/adminMiddleware.js
const adminMiddleware = (req, res, next) => {
    try {
        console.log('🛡️ Admin middleware checking...');
        
        // Check if user exists and has admin role
        if (!req.user) {
            console.log('❌ No user in request');
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        
        console.log('🔍 User role:', req.user.role);
        
        if (req.user.role !== 'admin') {
            console.log('❌ User is not admin');
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }
        
        console.log('✅ Admin access granted');
        next();
        
    } catch (error) {
        console.error('Admin middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error in admin validation'
        });
    }
};

module.exports = adminMiddleware;