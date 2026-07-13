import express from "express";
import upload from "../middleware/upload.js";
import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} from "../controllers/productController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get('/', getProducts);
router.get('/:id', getProductById);

router.post('/', authorize('admin'), upload.single('image'), createProduct);
router.put('/:id', authorize('admin'), upload.single('image'), updateProduct);
router.delete('/:id', authorize('admin'), deleteProduct);

export default router;