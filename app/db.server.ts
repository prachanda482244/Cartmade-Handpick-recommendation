// import { MongoClient, ObjectId as BSONObjectId } from "mongodb";

// // Define MongoDB connection string
// const connectionString: string | any = process.env.CONNECTION_STRING;

// // Check if the connection string is provided
// if (!connectionString) {
//   throw new Error(
//     "No connection string provided. Please set the CONNECTION_STRING environment variable.",
//   );
// }

// // Declare MongoDB client
// let mongodb: MongoClient;

// // Connect to MongoDB
// async function connectToMongoDB() {
//   try {
//     mongodb = new MongoClient(connectionString);
//     await mongodb.connect();
//     console.log("Connected to MongoDB");
//   } catch (error) {
//     console.error("Error connecting to MongoDB:", error);
//     throw error;
//   }
// }

// // Call connect function in development
// if (process.env.NODE_ENV !== "production") {
//   connectToMongoDB();
// }

// export { mongodb, BSONObjectId as ObjectId };

import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient;
}

const prisma: PrismaClient = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
}

export default prisma;
