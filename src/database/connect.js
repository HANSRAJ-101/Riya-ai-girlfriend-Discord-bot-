import mongoose from 'mongoose';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

let isConnected = false;

export const connectDatabase = async () => {
  if (!config.mongoUri || config.mongoUri.includes('username:password')) {
    logger.warn('MongoDB URI is not configured or using default template. Database operations will attempt local MongoDB fallback.');
  }

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    logger.info('Successfully connected to MongoDB Database.');
  } catch (error) {
    logger.error('Failed to connect to MongoDB Database. Bot will run with limited persistent state until DB is reachable.', error);
    isConnected = false;
  }
};

export const getDbStatus = () => isConnected;
