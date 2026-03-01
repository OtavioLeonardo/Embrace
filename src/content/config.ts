import { defineCollection, z } from "astro:content";

const stories = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      cover: image(),
      excerpt: z.string().optional(),
      layout: z.enum(["full", "grid", "mixed", "wide"]).default("mixed"), // 布局类型
    }),
});

export const collections = {
  stories,
};
