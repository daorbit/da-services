import "dotenv/config";
import { connectDB } from "../infra/db/connection.js";
import { App } from "../modules/apps/models/App.js";

const [slug, name, mongoUri, dbName] = process.argv.slice(2);

if (!slug || !name || !mongoUri || !dbName) {
  console.error("usage: tsx src/scripts/seed-app.ts <slug> <name> <mongoUri> <dbName>");
  process.exit(1);
}

await connectDB();

const existing = await App.findOne({ slug: slug.toLowerCase() });
if (existing) {
  console.error(`app "${slug}" already registered`);
  process.exit(1);
}

await App.create({ slug: slug.toLowerCase(), name, mongoUri, dbName });
console.log(`app registered: ${slug}`);
process.exit(0);
