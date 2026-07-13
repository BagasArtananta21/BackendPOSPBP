import Ingredient from '../models/Ingredient.js';

export const createIngredients = async (req, res) => {
    const {ingredient_name, sku, unit, current_stock, minimum_stock, last_cost_per_unit} = req.body;
    const ingredients = await Ingredient.create({
        ingredient_name,
        sku,
        unit,
        current_stock,
        minimum_stock,
        last_cost_per_unit,
    });
    res.json({ message: 'Bahan Baku berhasil ditambahkan', data: ingredients });
};

export const getIngredients = async (req, res) => {
    const {search, lowStock} = req.query;
    const filter = {is_deleted: false};

    if (search) {
        filter.$or = [
            {ingredient_name: {$regex: search, $options: 'i'}},
            {sku: {$regex: search, $options: 'i'}},
        ];
    }

    if (lowStock == 'true'){
        filter.$expr = {$lte: ['$current_stock', '$minimum_stock']};
    } 

    const ingredients = await Ingredient.find(filter).sort({ingredient_name: 1});
    res.json({ message: 'Bahan Baku berhasil diambil', data: ingredients });
}

export const getIngredientById = async (req, res) => {
    const ingredient = await Ingredient.findOne({_id: req.params.id, is_deleted: false});
    if (!ingredient) return res.status(404).json({message: 'Bahan Baku Tidak Ditemukan'});
    res.json({ message: 'Bahan Baku berhasil diambil', data: ingredient });
}

export const updateIngredient = async (req, res) => {
    const ingredient = await Ingredient.findOne({_id: req.params.id, is_deleted: false});
    if (!ingredient) return res.status(404).json({message: 'Bahan Baku Tidak Ditemukan'});

    const {ingredient_name, sku, unit, current_stock, minimum_stock, last_cost_per_unit} = req.body;
    if (ingredient_name !== undefined) ingredient.ingredient_name = ingredient_name;
    if (sku !== undefined) ingredient.sku = sku;
    if (unit !== undefined) ingredient.unit = unit;
    if (current_stock !== undefined) ingredient.current_stock = current_stock;
    if (minimum_stock !== undefined) ingredient.minimum_stock = minimum_stock;
    if (last_cost_per_unit !== undefined) ingredient.last_cost_per_unit = last_cost_per_unit;

    await ingredient.save();
    res.json({ message: 'Bahan Baku berhasil diperbarui', data: ingredient });
}

export const deleteIngredient = async (req, res) => {
  const ingredient = await Ingredient.findOneAndUpdate(
    { _id: req.params.id, is_deleted: false },
    { is_deleted: true },
    { new: true }
  );
  if (!ingredient) return res.status(404).json({ message: 'Ingredient tidak ditemukan' });
  res.json({ message: 'Ingredient dihapus', id: ingredient._id });
};