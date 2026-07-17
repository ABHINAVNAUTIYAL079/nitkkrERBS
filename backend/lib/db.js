import mongoose from "mongoose";

const cached = global.mongoose ?? { conn: null, promise: null };

if (!global.mongoose) {
    global.mongoose = cached;
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
        throw new Error("MONGODB_URI environment variable is not defined");
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: true,
            serverSelectionTimeoutMS: 10000, // 10s timeout for Atlas cold-start
        };
        cached.promise = mongoose.connect(MONGODB_URI, opts);
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default dbConnect;
