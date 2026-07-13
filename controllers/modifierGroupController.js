import ModifierGroup from "../models/ModifierGroup.js";

export const createModifierGroup = async (req, res) => {
    const {group_name, selection_type, is_required, max_select} = req.body;
    const modifierGroup = await ModifierGroup.create({
        group_name,
        selection_type,
        is_required,
        max_select
    });
    res.json({ message: 'Modifier Group berhasil ditambahkan', data: modifierGroup });
}

export const getModifierGroups = async (req, res) => {
    const {search} = req.query;
    const filter = {is_deleted: false};

    if (search) filter.group_name = {$regex: search, $options: 'i'};

    const modifierGroups = await ModifierGroup.find(filter).sort({group_name: 1});
    res.json({ message: 'Modifier Group berhasil diambil', data: modifierGroups });
}

export const getModifierGroupById = async (req, res) => {
    const modifierGroup = await ModifierGroup.findOne({_id: req.params.id, is_deleted: false});
    if (!modifierGroup) return res.status(404).json({message: 'Modifier Group Tidak Ditemukan'});
    res.json({ message: 'Modifier Group berhasil diambil', data: modifierGroup });
}

export const updateModifierGroup = async (req, res) => {
    const modifierGroup = await ModifierGroup.findOne({_id: req.params.id, is_deleted: false});
    if (!modifierGroup) return res.status(404).json({message: 'Modifier Group Tidak Ditemukan'});

    const {group_name, selected_type, is_required, max_select} = req.body;
    if (group_name !== undefined) modifierGroup.group_name = group_name;
    if (selected_type !== undefined) modifierGroup.selected_type = selected_type;
    if (is_required !== undefined) modifierGroup.is_required = is_required;
    if (max_select !== undefined) modifierGroup.max_select = max_select;

    await modifierGroup.save();
    res.json({ message: 'Modifier Group berhasil diperbarui', data: modifierGroup });
}

export const deleteModifierGroup = async (req, res) => {
    const modifierGroup = await ModifierGroup.findOneAndUpdate(
        { _id: req.params.id, is_deleted: false},
        { is_deleted: true},
        { new: true}
    );
    if (!modifierGroup) return res.status(404).json({ message: 'Modifier Group tidak ditemukan' });
    res.json({ message: 'Modifier Group berhasil dihapus', id: modifierGroup._id });
}