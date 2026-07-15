import Modifier from "../models/Modifier.js";

export const createModifier = async (req, res) => {
    const {group_id, modifier_name, extra_price, recipe} = req.body;
    const modifier = await Modifier.create({
        group_id,
        modifier_name,
        extra_price,
        recipe
    });
    res.json({ message: 'Modifier berhasil ditambahkan', data: modifier });
}

export const getModifiers = async (req, res) => {
    const {search, group_id} = req.query;
    const filter = {is_deleted: false};

    if (group_id) filter.group_id = group_id;
    if (search) filter.modifier_name = {$regex: search, $options: 'i'};

    const modifiers = await Modifier.find(filter)
    .populate('group_id', 'group_name selection_type is_required')
    .populate('recipe.ingredient_id', 'ingredient_name sku unit')
    .sort({modifier_name: 1});
    res.json({ message: 'Modifier berhasil diambil', data: modifiers });
}

export const getModifierById = async (req, res) => {
    const modifier = await Modifier.findOne({_id: req.params.id, is_deleted: false})
    .populate('group_id', 'group_name selection_type is_required')
    .populate('recipe.ingredient_id', 'ingredient_name sku unit');
    if (!modifier) return res.status(404).json({message: 'Modifier Tidak Ditemukan'});
    res.json({ message: 'Modifier berhasil diambil', data: modifier });
}

export const updateModifier = async (req, res) => {
    const modifier = await Modifier.findOne({_id: req.params.id, is_deleted: false});
    if (!modifier) return res.status(404).json({message: 'Modifier Tidak Ditemukan'});

    const {group_id, modifier_name, extra_price, recipe, is_available} = req.body;
    if (group_id !== undefined) modifier.group_id = group_id;
    if (modifier_name !== undefined) modifier.modifier_name = modifier_name;
    if (extra_price !== undefined) modifier.extra_price = extra_price;
    if (recipe !== undefined) modifier.recipe = recipe;
    if (is_available !== undefined) modifier.is_available = is_available;
    
    await modifier.save();
    res.json({ message: 'Modifier berhasil diperbarui', data: modifier });
}

export const deleteModifier = async (req, res) => {
    const modifier = await Modifier.findOneAndUpdate(
        { _id: req.params.id, is_deleted: false },
        { is_deleted: true },
        { new: true }
    );
    if (!modifier) return res.status(404).json({ message: 'Modifier tidak ditemukan' });
    res.json({ message: 'Modifier berhasil dihapus', id: modifier._id });
}