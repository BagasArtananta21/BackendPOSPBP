import express from "express";

import {
    createIngredient,
    getIngredients,
    getIngredientById,
    updateIngredient,
    deleteIngredient,
} from "../controllers/ingredientController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, authorize('admin'));

router.route('/').post(createIngredient).get(getIngredients);
router.route('/:id').get(getIngredientById).put(updateIngredient).delete(deleteIngredient);

export default router;