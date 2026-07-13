import express from "express";
import {
    createSupplier,
    getSuppliers,
    getSuppliersById,
    updateSupplier,
    deleteSupplier,
} from "../controllers/supplierController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, authorize('admin'));

router.route('/').post(createSupplier).get(getSuppliers);
router.route('/:id').get(getSuppliersById).put(updateSupplier).delete(deleteSupplier);

export default router;