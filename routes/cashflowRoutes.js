import express from 'express';
import {
    createCashflow,
    getCashflow,
} from '../controllers/cashflowController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('cashier'));

router.route('/').post(createCashflow).get(getCashflow);

export default router