import { app } from "./app.js";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";

const startServer = async (): Promise<void> => {
  await connectDb();
  app.listen(env.port, () => {
    console.log(`GigFlow API running on port ${env.port}`);
  });
};

startServer().catch((error) => {
  console.error(error);
  process.exit(1);
});
