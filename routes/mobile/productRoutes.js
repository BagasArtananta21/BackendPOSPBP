import express from "express";
import { protect } from "../../middleware/auth.js";
import {
    getProductCustomization
} from "../../controllers/mobile/productController.js";

const router = express.Router();

router.use(protect);
router.get(
    "/:id/customization",
    getProductCustomization
);

export default router;