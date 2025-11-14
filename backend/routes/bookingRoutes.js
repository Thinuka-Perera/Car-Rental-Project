import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { upload } from '../middleware/uploads.js';

import {
  createBooking,
  deleteBooking,
  getBookings,
  getMyBookings,
  updateBooking,
  updateBookingStatus,
} from '../controllers/bookingController.js';


const bookingRouter = express.Router();

// Routes
bookingRouter.post('/', authMiddleware, upload.single('carImage'), createBooking);
bookingRouter.get('/', getBookings);
bookingRouter.get('/mybooking', authMiddleware, getMyBookings);

bookingRouter.put('/:id', upload.single('carImage'), updateBooking);
bookingRouter.patch('/:id/status', updateBookingStatus);
bookingRouter.delete('/:id', deleteBooking);

export default bookingRouter;
