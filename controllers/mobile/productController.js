import Product from "../../models/Product.js";
import Modifier from "../../models/Modifier.js";
import ModifierGroup from "../../models/ModifierGroup.js";

export const getProductCustomization = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id)
            .select(
                "_id product_name category price image_url is_available"
            )
            .lean();

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Produk tidak ditemukan"
            });
        }
        const groups = await ModifierGroup.find({
            _id: {
                $in: product.modifier_groups
            },
            is_deleted: false
        }).lean();

        const groupIds = groups.map(g => g._id);
        const modifiers = await Modifier.find({
            group_id: {
                $in: groupIds
            },
            is_deleted: false,
            is_available: true
        }).lean();

        const modifierGroups = groups.map(group => {
            return {
                ...group,
                modifiers: modifiers.filter(
                    modifier =>
                        modifier.group_id.toString() ===
                        group._id.toString()
                )
            }
        });

        return res.json({
            success: true,
            data: {
                product,
                modifierGroups
            }
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};