import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const JWT_SECRET = "your_jwt_secret_here"; 

export default async function authMiddleware(req, res, next) {

    const authHeader = req.headers.authorization;


     //Check if token is provided
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized — token missing.",
      });
    }

    // Extract token (after "Bearer ")
    const token = authHeader.split(" ")[1];

    try{
        const payload = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(payload.id).select('-password')

        if(!user) {
            return res.status(401).json({
                success:false,
                message:'User Not Found'
            })
        }

        req.user = user;
        next();
    }

    catch(err){
        console.error('JWT Verification failed', err);
        return res.status(401).json({
            success:false,
            message: "Token missing invalid or expired"
        })
    }
    
}