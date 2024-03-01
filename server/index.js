import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { socketFunc } from './socket/socket.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://chat-nine-black.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});


// Variables
const PORT = process.env.PORT || 4040;
const MDB_URL = process.env.MDB_URL;

// Connect to Database
mongoose
  .connect(MDB_URL, { serverSelectionTimeoutMS: 30000 })
  .then(() => {
    console.log('MDB connected');
  })
  .catch((err) => {
    console.error('MDB connection error:', err);
  });

// Routes
app.use('/', authRoutes);
app.use('/', userRoutes);

// Server
const WebServer = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Socket
socketFunc(WebServer);
