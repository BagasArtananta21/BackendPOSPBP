import express from "express";

import {
    createIngredients,
    getIngredients,
    getIngredientById,
    updateIngredient,
    deleteIngredient,
} from "../controllers/ingredientController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, authorize('admin'));

router.route('/').post(createIngredients).get(getIngredients);
router.route('/:id').get(getIngredientById).put(updateIngredient).delete(deleteIngredient);

export default router;