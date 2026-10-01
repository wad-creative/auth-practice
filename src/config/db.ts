import mongoose from "mongoose";

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("MongoDB Connected successfully");
  } catch (error) {
    console.log("MongoDB can't connect", error);
    process.exit(1);
  }
}

export default connectDB;
