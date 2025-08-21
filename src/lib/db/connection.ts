import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI!;

export async function connectMongoose() {
  // Already connected 
  if (mongoose.connection.readyState === 1) {
    return;
  // Pending connection
  } else if (mongoose.connection.readyState === 2) {
    await new Promise<void>((resolve, reject) => {
      mongoose.connection.once("connected", () => resolve());
      mongoose.connection.once("error", (err) => reject(err));
    });
    return;
  }
  // No connection
  await mongoose.connect(MONGO_URI);
}

