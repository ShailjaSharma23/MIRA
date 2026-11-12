import mongoose from "mongoose";
import fs from "fs";
import path from "path";

// Read .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
let uri = process.env.MONGODB_URI;

if (!uri && fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("MONGODB_URI=")) {
      uri = trimmed.replace("MONGODB_URI=", "").replace(/["']/g, "").trim();
      break;
    }
  }
}

async function testConnection() {
  if (!uri) {
    console.error("❌ MONGODB_URI not found in environment or .env.local");
    process.exit(1);
  }

  console.log("🔄 Attempting to connect to MongoDB Atlas...");
  console.log(`📡 Host: ${uri.split("@")[1]?.split("/")[0] || "hidden"}`);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ Successfully connected to MongoDB Atlas!");

    const dbName = mongoose.connection.name;
    console.log(`📁 Active Database: "${dbName}"`);

    // Ping
    const pingRes = await mongoose.connection.db.admin().ping();
    console.log("🏓 Ping response:", pingRes);

    console.log("\n🎉 Your MongoDB Atlas setup is 100% working and ready for MIRA!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    if (error.message.includes("bad auth") || error.message.includes("Authentication failed")) {
      console.log("💡 Tip: Double check your database username and password in the connection string.");
    } else if (error.message.includes("whitelist") || error.message.includes("server selection timeout")) {
      console.log("💡 Tip: Make sure your IP is whitelisted (0.0.0.0/0) in MongoDB Atlas under Network Access.");
    }
    process.exit(1);
  }
}

testConnection();
