import express from "express";
import { getStaffReport, getStaffShiftDetails } from "../controllers/staffReportController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();
router.use(protect, authorize('admin'));

router.get('/', getStaffReport);
router.get('/:cashier_id/shifts', getStaffShiftDetails);

export default router;