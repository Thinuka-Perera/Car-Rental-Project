import express from 'express';
import { confirmPayment, createCheckoutSession } from '../controllers/paymentController.js';

const paymentRouter = express.Router();

// Routes
paymentRouter.post('/create-checkout-session', createCheckoutSession);
paymentRouter.get('/confirm', confirmPayment);

export default paymentRouter;