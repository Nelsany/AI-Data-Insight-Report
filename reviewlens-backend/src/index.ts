import { env } from "./env";
import { buildServer } from "./server";
import { startWorker } from "./worker";

async function main() {
  const app = buildServer();
  startWorker();

  await app.listen({ port: env.PORT, host: "0.0.0.0" });
  app.log.info(`Backend ready: http://localhost:${env.PORT}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
