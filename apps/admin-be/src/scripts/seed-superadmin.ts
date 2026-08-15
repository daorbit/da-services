import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "../infra/db/connection.js";
import { AdminUser } from "../modules/identity/models/AdminUser.js";

const email = process.argv[2];
const password = process.argv[3];
const name = process.argv[4] ?? "Super Admin";

if (!email || !password) {
  console.error("usage: tsx src/scripts/seed-superadmin.ts <email> <password> [name]");
  process.exit(1);
}

await connectDB();

const existing = await AdminUser.findOne({ email: email.toLowerCase().trim() });
if (existing) {
  console.error(`admin user ${email} already exists`);
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 10);
await AdminUser.create({
  email: email.toLowerCase().trim(),
  passwordHash,
  name,
  role: "super_admin",
  apps: [],
});

console.log(`super_admin created: ${email}`);
process.exit(0);
