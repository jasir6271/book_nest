import { jwtSecret } from './config.js';
import mongoose from 'mongoose';
import app from './app.js';
const port = Number(process.env.PORT || 8800);
try {
 if (!process.env.MONGO_URL || !jwtSecret || jwtSecret === 'replace-with-a-long-random-secret') throw new Error('Set MONGO_URL and a unique JWT_SECRET in .env or server/.env before starting the API.');
 await mongoose.connect(process.env.MONGO_URL,{serverSelectionTimeoutMS:10000});
 console.log('MongoDB connected');
 app.listen(port,()=>console.log('BookNest API listening on port '+port));
} catch(error) { console.error('API startup failed: '+error.message); process.exitCode=1; }
