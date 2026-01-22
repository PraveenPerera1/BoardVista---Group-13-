const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id);

      next();
    } catch (error) {
      console.log(error);
      res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
      
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('User role:', req.user.role);
    console.log('Required roles:', roles);
    console.log('Has access:', roles.includes(req.user.role));
    
    if (!roles.includes(req.user.role)) {
      let message = `User role ${req.user.role} is not authorized to access this route`;
      
      // Special message for boarding creation
      if (roles.includes('owner') && req.originalUrl?.includes('/boarding') && req.method === 'POST') {
        message = 'Only owners can create boarding houses. Please register as an owner or contact support.';
      }
      
      return res.status(403).json({
        success: false,
        message: message,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
