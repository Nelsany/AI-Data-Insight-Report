import Fastify from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import multipart from "@fastify/multipart";
import { env } from "./env";
import { registerParseRoutes } from "./routes/parse";
import { registerTaskRoutes } from "./routes/tasks";
import { registerReportRoutes } from "./routes/reports";

export function buildServer() {
  const app = Fastify({
    logger: {
      transport:
        env.NODE_ENV === "development"
          ? {
              target: "pino-pretty",
              options: { translateTime: "SYS:standard", ignore: "pid,hostname" },
            }
          : undefined,
    },
    // 允许更大的导入文件（CSV/XLSX）
    bodyLimit: 30 * 1024 * 1024,
  });

  app.register(cors, {
    origin: [env.FRONTEND_ORIGIN],
    credentials: true,
  });

  // 文件上传（CSV/XLSX）
  app.register(multipart, {
    limits: {
      fileSize: 30 * 1024 * 1024,
      files: 1,
    },
  });

  app.register(swagger, {
    openapi: {
      info: {
        title: "ReviewLens Backend",
        version: "0.1.0",
      },
    },
  });
  app.register(swaggerUI, { routePrefix: "/docs" });

  app.get("/healthz", async () => ({ ok: true }));

  app.register(registerParseRoutes);
  app.register(registerTaskRoutes);
  app.register(registerReportRoutes);

  return app;
}
