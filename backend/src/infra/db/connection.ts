import mongoose from "mongoose";

let connected = false;

const DB_NAME = process.env.MONGODB_DB ?? "da-services";

export async function connectDB(): Promise<void> {
  if (connected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set");

  await mongoose.connect(uri, { dbName: DB_NAME });

  connected = true;
  console.log(`MongoDB connected — database "${mongoose.connection.name}"`);
}
