import Stock from '../models/Stock.js';
// import Ingredient from '../models/Ingredient.js';
// import User from '../models/User.js';

export const supplyIn = async (req, res) => {
    const { ingredient_id, supplier_id, quantity, total_price, batch_number } = req.body;

    if (!ingredient_id || !quantity || quantity <= 0) {
        return res.status(400).json({ message: 'ingredient_id dan quantity (>0) wajib diisi' });
    }

    const ingredient = await Ingredient.findOne({ _id: ingredient_id, is_deleted: false });
    if (!ingredient) return res.status(404).json({ message: 'Bahan tidak ditemukan' });

    const cost_per_unit = total_price / quantity;
    const stock = await Stock.create({
        ingredient_id,
        supplier_id: supplier_id || null,
        quantity_changed: quantity,        
        cost_per_unit,
        batch_number,
        adjustment_type: 'supply_in',     
        recorded_by: req.user._id,        
    });

    //update saldo & harga modal terkini di Ingredient
    ingredient.current_stock += quantity;
    if (cost_per_unit) ingredient.last_cost_per_unit = cost_per_unit;
    await ingredient.save();

    res.status(201).json({ message: 'Supply masuk berhasil dicatat', data: stock });
};

export const stockOut = async (req, res) => {
    const { ingredient_id, quantity, adjustment_type } = req.body;

    if (!['damaged', 'expired'].includes(adjustment_type)) {
        return res.status(400).json({ message: "adjustment_type harus 'damaged' atau 'expired'" });
    }
    if (!ingredient_id || !quantity || quantity <= 0) {
        return res.status(400).json({ message: 'ingredient_id dan quantity (>0) wajib diisi' });
    }

    const ingredient = await Ingredient.findOne({ _id: ingredient_id, is_deleted: false });
    if (!ingredient) return res.status(404).json({ message: 'Bahan tidak ditemukan' });

    if (ingredient.current_stock < quantity) {
        return res.status(400).json({
        message: `Stok tidak cukup. Tersisa ${ingredient.current_stock} ${ingredient.unit}`,
        });
    }

    const stock = await Stock.create({
        ingredient_id,
        quantity_changed: -quantity,                    
        adjustment_type,                                
        cost_per_unit: ingredient.last_cost_per_unit,   
        recorded_by: req.user._id,
    });

    ingredient.current_stock -= quantity;
    await ingredient.save();

    res.status(201).json({ message: `Stok ${adjustment_type} berhasil dicatat`, data: stock });
};

export const stockOpname = async (req, res) => {
    const { ingredient_id, counted_quantity } = req.body;
    if (!ingredient_id || counted_quantity === undefined || counted_quantity < 0) {
    return res.status(400).json({ message: 'ingredient_id dan counted_quantity (>=0) wajib diisi' });
  }

    const ingredient = await Ingredient.findOne({ _id: ingredient_id, is_deleted: false });
    if (!ingredient) return res.status(404).json({ message: 'Bahan tidak ditemukan' });

    const delta = counted_quantity - ingredient.current_stock;

    const stock = await Stock.create({
        ingredient_id,
        quantity_changed: delta,
        adjustment_type: 'stock_opname',
        cost_per_unit: ingredient.last_cost_per_unit,
        recorded_by: req.user._id,
    });

    ingredient.current_stock = counted_quantity;
    await ingredient.save();

    res.status(201).json({ message: 'Stock opname berhasil dicatat', data: stock });
}

export const getStock = async (req, res) => {
    const {ingredient_id, adjustment_type} = req.query;
    const filter = {};
    if (ingredient_id) filter.ingredient_id = ingredient_id;
    if (adjustment_type) filter.adjustment_type = adjustment_type;

    const stocks = await Stock.find(filter)
        .populate('ingredient_id', 'ingredient_name sku unit')
        .populate('supplier_id', 'supplier_name')
        .populate('recorded_by', 'name')
        .sort({ created_at: -1 });   
    res.json({ message: 'Data stok berhasil diambil', data: stocks });
}

export const getStockById = async (req, res) => {
    const stock = await Stock.findById(req.params.id)
        .populate('ingredient_id', 'ingredient_name sku unit')
        .populate('supplier_id', 'supplier_name')
        .populate('recorded_by', 'name');
    if (!stock) return res.status(404).json({ message: 'Data stok tidak ditemukan' });
    res.json({ message: 'Data stok berhasil diambil', data: stock });
};

export const updateStock = async (req, res) => {
    const stock = await Stock.findById(req.params.id);
    if (!stock) return res.status(404).json({ message: 'Data stok tidak ditemukan' });
    
    const {batch_number, supplier_id} = req.body;
    if (batch_number !== undefined) stock.batch_number = batch_number;
    if (supplier_id !== undefined) stock.supplier_id = supplier_id;

    await stock.save();
    res.json({ message: 'Data stok berhasil diperbarui', data: stock });
}

export const deleteStock = async (req,res) => {
    const stock = await Stock.findByIdAndDelete(req.params.id);
    if (!stock) return res.status(404).json({ message: 'Data stok tidak ditemukan' });

    await Ingredient.updateOne(
        { _id: stock.ingredient_id },
        { $inc: { current_stock: -stock.quantity_changed } }
    );

    await Stock.deleteOne();
    res.json({ message: 'Data stok berhasil dihapus', data: stock });
}