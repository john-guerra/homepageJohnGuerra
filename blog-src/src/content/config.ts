import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tags: z.array(z.string()).optional(),
    description: z.string().optional(),
    // "john" (default) = John wrote it himself
    // "claude" = Claude drafted on John's behalf — post must use <AIByline />
    // "claude-edited" = Claude drafted, John edited substantially
    author: z.enum(["john", "claude", "claude-edited"]).default("john"),
  }),
});

export const collections = { blog };
