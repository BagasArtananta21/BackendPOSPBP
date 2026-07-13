import express from "express";
import {
    createModifierGroup,
    getModifierGroups,
    getModifierGroupById,
    updateModifierGroup,
    deleteModifierGroup,
} from "../controllers/modifierGroupController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, authorize('admin'));

router.route('/').post(createModifierGroup).get(getModifierGroups);
router.route('/:id').get(getModifierGroupById).put(updateModifierGroup).delete(deleteModifierGroup);

export default router;