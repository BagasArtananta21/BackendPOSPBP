import express from "express";
import {
    getSalesSummary,
    getTopSalesProducts,
    getSalesTrend,
    getTransactionList
} from "../controllers/transactionReportDetailController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, authorize('admin'));

router.get("/summary", getSalesSummary);
router.get("/top-products", getTopSalesProducts);
router.get("/trend", getSalesTrend);
router.get("/transaction-list", getTransactionList);

export default router;