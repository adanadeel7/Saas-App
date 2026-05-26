import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/invoiceforge');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error Connecting to MongoDB: ${error.message}`);
    // Do not crash the application in dev if DB is not available, just log.
    // In production we would exit, but for dev convenience, let's just log.
  }
};

export default connectDB;
