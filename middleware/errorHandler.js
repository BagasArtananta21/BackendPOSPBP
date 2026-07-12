// 404 untuk route yang tidak terdaftar
export const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route tidak ditemukan: ${req.originalUrl}` });
};

// Error handler terpusat. Express 5 otomatis meneruskan error dari
// controller async ke sini, jadi controller tidak perlu try/catch.
export const errorHandler = (err, req, res, next) => {
  console.error(err);

  let status = err.statusCode || 500;
  let message = err.message || 'Server error';

  // Mongoose: duplicate key (mis. username sudah dipakai)
  if (err.code === 11000) {
    status = 409;
    message = `Data duplikat pada field: ${Object.keys(err.keyValue).join(', ')}`;
  }
  // Mongoose: validation error
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }
  // Mongoose: cast error (ObjectId tidak valid)
  if (err.name === 'CastError') {
    status = 400;
    message = `Nilai tidak valid untuk field ${err.path}`;
  }

  res.status(status).json({ message });
};
