import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Coin from '../models/Coin.js';

// Resolve directory paths since we are using ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const seedDB = async () => {
  let connection;
  try {
    // 1. Establish Database Connection
    console.log('🔌 Connecting to MongoDB for seeding...');
    connection = await mongoose.connect(process.env.MONGO_URI);
    console.log(`🔌 Connected to host: ${connection.connection.host}`);

    // 2. Safeguard Check: Check for existing data
    const recordCount = await Coin.countDocuments();
    const shouldClear = process.argv.includes('--clear') || process.argv.includes('--force');

    if (recordCount > 0 && !shouldClear) {
      console.warn(`\n⚠️  WARNING: Collection already contains ${recordCount} records!`);
      console.log('Seeding aborted to prevent data loss or duplicates.');
      console.log('To clear the database and seed fresh, run: npm run seed -- --clear\n');
      await mongoose.connection.close();
      process.exit(0);
    }

    // 3. Load Dataset File
    const datasetPath = path.join(__dirname, '../data/dataset.json');
    if (!fs.existsSync(datasetPath)) {
      throw new Error(`Dataset file not found at: ${datasetPath}. Please place your JSON data there.`);
    }

    console.log('📖 Reading dataset file...');
    const rawData = fs.readFileSync(datasetPath, 'utf8');
    const dataset = JSON.parse(rawData);

    if (!Array.isArray(dataset)) {
      throw new Error('Dataset format is invalid. It must be an array of objects.');
    }

    // 4. Clear existing data if cleared/forced
    if (shouldClear) {
      console.log('🧹 Clearing existing cryptocurrency records...');
      await Coin.deleteMany({});
      console.log('🧹 Database collection cleared successfully.');
    }

    // 5. Insert New Data
    console.log(`🚀 Seeding ${dataset.length} cryptocurrency records...`);
    const startTime = Date.now();
    const result = await Coin.insertMany(dataset);
    const endTime = Date.now();

    console.log('🎉 Seeding completed successfully!');
    console.log(`📦 Seeded: ${result.length} documents.`);
    console.log(`⏱️  Elapsed Time: ${((endTime - startTime) / 1000).toFixed(2)} seconds`);

  } catch (error) {
    console.error('❌ Seeding process failed:', error);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('🔌 Disconnected from MongoDB.');
    }
  }
};

seedDB();
