import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js';

// verfing token 
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware for admin to check admin user or not
const adminOnly = (req, res, next) => {
  if(req.user && req.user.role ==="admin"){
    next();
  }else{
    res.status(403).josn({message:"Access denied only for admin user only"})
  }
}

export { protect, adminOnly };
