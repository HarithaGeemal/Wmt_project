import mongoose from 'mongoose';
import 'dotenv/config';

async function check() {
  await mongoose.connect(process.env.DATABASE_URL);
  const db = mongoose.connection.db;

  const users = await db.collection('User').find({}).limit(1).toArray();
  const categories = await db.collection('Category').find({}).limit(1).toArray();
  
  console.log("Users:", JSON.stringify(users, null, 2));
  console.log("Categories:", JSON.stringify(categories, null, 2));

  process.exit(0);
}

check().catch(console.error);
