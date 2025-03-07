import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

/*
Connection to mongo db
*/

async function connectDB() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Successfully connected to the mongoose server");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
}

export default connectDB;
