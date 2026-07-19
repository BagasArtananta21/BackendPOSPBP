import express from "express";
import {
    getActiveShift,
    startShift,
    endShift,
    getShiftSummary,
    extendShift
} from "../controllers/shiftController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, authorize('cashier'));

router.get('/', getActiveShift);
router.post('/start', startShift);
router.post('/end', endShift);
router.get("/summary", getShiftSummary);
router.post('/extend', extendShift);

export default router;