import express from "express";
import {
    getDailySummary,
    getLowStock,
    getActiveCashiers,
    getSalesTrend,
    getRecentTransactions
} from "../controllers/dashboardController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/summary', getDailySummary);
router.get('/low-stock', getLowStock);
router.get('/active-cashier', getActiveCashiers);
router.get('/recent-transactions', getRecentTransactions);
router.get('/sales-trend', getSalesTrend);

export default router;
