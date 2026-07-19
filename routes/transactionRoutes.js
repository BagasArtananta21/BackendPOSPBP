import express from 'express';
import { 
    createTransaction,
    getTransactions,
    getTransactionById,
    voidTransaction,
    getTransactionQris
} from '../controllers/transactionController.js';
import {protect, authorize} from '../middleware/auth.js';

const router = express.Router();
router.use(protect, authorize('cashier'));

router.route('/').post(createTransaction).get(getTransactions);
router.route('/:id').get(getTransactionById);
router.route('/:id/void').patch(voidTransaction);
router.route('/:id/qris').get(getTransactionQris);

export default router;