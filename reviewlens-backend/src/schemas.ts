import { z } from "zod";

export const CategorySchema = z.enum(["香水", "口红", "面膜"]);
export const RatingFilterSchema = z.enum(["全部", "好评", "中评", "差评"]);

export const TaskConfigSchema = z.object({
  sampleSize: z.number().int().min(200).max(5000),
  timeRangeMonths: z.number().int().min(1).max(12),
  ratingFilter: RatingFilterSchema,
  analysisFocus: z.string().min(1).max(200),
});

export const ParseRequestSchema = z.object({ prompt: z.string().min(1).max(1000) });
export const ParseResponseSchema = z.object({
  category: CategorySchema,
  keyword: z.string().min(1).max(100),
  config: TaskConfigSchema,
});

export const CreateTaskRequestSchema = z.object({
  prompt: z.string().min(1).max(1000),
  category: CategorySchema.optional(),
  keyword: z.string().min(1).max(100).optional(),
  config: TaskConfigSchema.partial().optional(),
});

