import express from 'express';
import { 
    createTransaction,
    getTransactions,
    getTransactionById,
    voidTransaction
} from '../controllers/transactionController.js';
import {protect, authorize} from '../middleware/auth.js';

const router = express.Router();
router.use(protect, authorize('cashier'));

router.route('/').post(createTransaction).get(getTransactions);
router.route('/:id').get(getTransactionById);
router.route('/:id/void').patch(voidTransaction);
export default router;