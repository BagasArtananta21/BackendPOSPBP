import express from 'express';
import {
    createModifier,
    getModifiers,
    getModifierById,
    updateModifier,
    deleteModifier,
} from '../controllers/modifierController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.route('/').post(createModifier).get(getModifiers);
router.route('/:id').get(getModifierById).put(updateModifier).delete(deleteModifier);

export default router;
