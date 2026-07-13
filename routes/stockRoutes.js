import express from "express";
import {
    supplyIn,
    stockOut,
    stockOpname,
    getStock,
    getStockById,
    updateStock,
    deleteStock
} from "../controllers/stockController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, authorize('admin'));

router.route('/').post(supplyIn).get(getStock);
router.route('/:id').get(getStockById).put(updateStock).delete(deleteStock);
router.route('/opname').post(stockOpname);
router.route('/out').post(stockOut);

export default router;
