import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
import mobileProductRoutes from "./routes/mobile/productRoutes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
app.use("/api/mobile/products", mobileProductRoutes);
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
  // Add '0.0.0.0' right before the callback function
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} (Listening on all interfaces)`);
  });
});
