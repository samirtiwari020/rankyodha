import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

const MAX_PORT_RETRIES = 10;

const listenWithRetry = (basePort, retries = MAX_PORT_RETRIES) =>
  new Promise((resolve, reject) => {
    const port = Number(basePort);
    const server = app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
      resolve(server);
    });

    server.on("error", (error) => {
      if (error?.code === "EADDRINUSE" && retries > 0) {
        logger.warn(`Port ${port} is in use, trying port ${port + 1}`);
        setTimeout(() => {
          listenWithRetry(port + 1, retries - 1).then(resolve).catch(reject);
        }, 100);
        return;
      }

      reject(error);
    });
  });

const startServer = async () => {
  try {
    await connectDB();
    await listenWithRetry(env.PORT);
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
