import app from './app.js';
import connectDatabase from './db/connect-database.js';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  await connectDatabase();
  app.listen(process.env.PORT, () => {
    console.log('🚀 Server running...');
    console.log(`http://localhost:${process.env.PORT}`);
  });
}

startServer();
