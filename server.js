import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import ingredientRoutes from './routes/ingredientRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import modifierRoutes from './routes/modifierRoutes.js';
import modifierGroupRoutes from './routes/modifierGroupRoutes.js';
import productRoutes from './routes/productRoutes.js';
import shiftRoutes from './routes/shiftRoutes.js';
import cashflow from './routes/cashflowRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import userManageRoutes from './routes/userManageRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import staffReportRouter from './routes/staffReportRoutes.js';
import transactionDetailReportRoutes from './routes/transactionDetailReportRoutes.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

app.use('/uploads', express.static('uploads'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/modifiers', modifierRoutes);
app.use('/api/modifier-groups', modifierGroupRoutes);
app.use('/api/products', productRoutes);
app.use('/api/shift', shiftRoutes);
app.use('/api/cashflow', cashflow);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userManageRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/staff-reports', staffReportRouter);
app.use('/api/transaction-reports', transactionDetailReportRoutes);
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
