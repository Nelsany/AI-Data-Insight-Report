import { Queue } from "bullmq";
import { env } from "../env";
import IORedis from "ioredis";

export const connection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const taskQueue = new Queue("tasks", { connection });

export type RunTaskJob = { taskId: string };
