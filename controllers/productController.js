import Product from "../models/Product.js";

const withAvailableStock = (product) => {
    const p = product.toObject();
    const in_stock = p.recipe.every((item) => {
        const ing = item.ingredient_id;
        return ing && ing.current_stock >= item.quantity_required;
    });
    return {...p, in_stock, available: p.is_available && in_stock};
};

export const createProduct = async (req, res) => {
    const { product_name, category, price, recipe, modifier_groups } = req.body;

    let parsedRecipe = [];
    let parsedGroups = [];
    try {
        if (recipe) parsedRecipe = typeof recipe === 'string' ? JSON.parse(recipe) : recipe;
        if (modifier_groups) parsedGroups = typeof modifier_groups === 'string' ? JSON.parse(modifier_groups) : modifier_groups;
    } catch {
        return res.status(400).json({ message: 'Format recipe / modifier_groups harus JSON valid' });
    }

    const image_url = req.file ? `/uploads/${req.file.filename}` : undefined;

    const product = await Product.create({
        product_name,
        category,
        price,
        image_url,
        recipe: parsedRecipe,
        modifier_groups: parsedGroups,
    });
    res.status(201).json({ message: 'Produk berhasil ditambahkan', data: product });
};

export const getProducts = async (req, res) => {
    const { category, search } = req.query;
    const filter = { is_deleted: false };
    
    if(category) filter.category = category;
    if(search) filter.product_name = { $regex: search, $options: 'i' };

    const products = await Product.find(filter)
        .populate('recipe.ingredient_id', 'ingredient_name current_stock unit')
        .populate('modifier_groups', 'group_name selection_type is_required max_select');
    if(!products) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    res.json({ message: 'Produk berhasil diambil', data: products.map(withAvailableStock) });
};

export const getProductById = async (req, res) => {
    const product = await Product.findOne({_id: req.params.id, is_deleted:false})
        .populate('recipe.ingredient_id', 'ingredient_name current_stock unit')
        .populate('modifier_groups', 'group_name selection_type is_required max_select');
    if(!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    res.json({ message: 'Produk berhasil diambil', data: withAvailableStock(product) });
}

export const updateProduct = async (req, res) => {
    const product = await Product.findOne({ _id: req.params.id, is_deleted: false });
    if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });

    const { product_name, category, price, recipe, modifier_groups, is_available } = req.body;
    if (product_name !== undefined) product.product_name = product_name;
    if (category !== undefined) product.category = category;
    if (price !== undefined) product.price = price;
    if (is_available !== undefined) product.is_available = is_available;

    try {
        if (recipe !== undefined) product.recipe = typeof recipe === 'string' ? JSON.parse(recipe) : recipe;
        if (modifier_groups !== undefined) product.modifier_groups = typeof modifier_groups === 'string' ? JSON.parse(modifier_groups) : modifier_groups;
    } catch {
        return res.status(400).json({ message: 'Format recipe / modifier_groups harus JSON valid' });
    }

    if (req.file) product.image_url = `/uploads/${req.file.filename}`;

    await product.save();
    res.json({ message: 'Produk berhasil diperbarui', data: product });
};


export const deleteProduct = async (req, res) => {
    const product = await Product.findOneAndUpdate(
        { _id: req.params.id, is_deleted: false },
        { is_deleted: true },
        { new: true }
    );
    if(!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    res.json({ message: 'Produk berhasil dihapus', id: product._id }
    )
}