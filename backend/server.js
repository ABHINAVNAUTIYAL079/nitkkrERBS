import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './lib/db.js';

import authUserRoutes from './routes/authUser.js';
import authDriverRoutes from './routes/authDriver.js';
import authAdminRoutes from './routes/authAdmin.js';
import authCommonRoutes from './routes/authCommon.js';
import bookingsRoutes from './routes/bookings.js';
import adminDriversRoutes from './routes/adminDrivers.js';
import driverRoutes from './routes/driver.js';
import trackingRoutes from './routes/tracking.js';

dotenv.config(); // Load env variables from root .env

const app = express();

// Middlewares
app.use(cors({
    origin: process.env.VITE_APP_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Connect to Database
connectDB();

// Routes
app.use('/api/auth/user', authUserRoutes);
app.use('/api/auth/driver', authDriverRoutes);
app.use('/api/auth/admin', authAdminRoutes);
app.use('/api/auth', authCommonRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/admin/drivers', adminDriversRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/tracking', trackingRoutes);

// Base route
app.get('/', (req, res) => {
    res.send('NIT KKR E-Rickshaw API is running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
