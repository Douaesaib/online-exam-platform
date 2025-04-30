const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No authentication token, access denied' });
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = verified;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token verification failed, authorization denied' });
    }
};

const isTeacher = (req, res, next) => {
    if (req.user.userType !== 'teacher') {
        return res.status(403).json({ message: 'Access denied. Teachers only.' });
    }
    next();
};

const isStudent = (req, res, next) => {
    if (req.user.userType !== 'student') {
        return res.status(403).json({ message: 'Access denied. Students only.' });
    }
    next();
};

module.exports = { auth, isTeacher, isStudent }; 