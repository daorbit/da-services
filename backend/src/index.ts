import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./infra/db/connection.js";

const PORT = process.env.PORT ?? 4100;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`admin-be running on http://localhost:${PORT}`);
  });
}

start().catch((e) => {
  console.error("Startup failed:", e);
  process.exit(1);
});
