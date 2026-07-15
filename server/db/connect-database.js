import mongoose from 'mongoose';

async function connectDatabase() {
  try {
    await mongoose.connect(process.env.DATABASE_URI);
    console.log('📊 Database Connected...');
  } catch (error) {
    console.log('❌ Failed to Connect DB');
    process.exit(1);
  }
}

export default connectDatabase;
