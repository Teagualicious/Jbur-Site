// Content collections. A schema violation fails the build. See spec section 6.
import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const caseStudies = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/case-studies" }),
  schema: z.object({
    title: z.string(),
    summary: z.string().max(280),
    date: z.coerce.date(),
    launched: z.coerce.date(),
    period: z.string(),
    context: z.string(),
    role: z.string(),
    status: z.enum(["Live", "Pilot", "In progress", "Retired"]),
    tools: z.array(z.string()),
    replaced: z.string().optional(),
    steps: z
      .object({ total: z.number().int().positive(), people: z.number().int().nonnegative() })
      .refine((s) => s.people <= s.total, { message: "steps.people can't exceed steps.total" })
      .optional(),
    // Every figure says how it was arrived at. See spec 8.3.
    outcome: z
      .object({ text: z.string(), basis: z.enum(["measured", "estimated", "illustrative"]) })
      .optional(),
    draft: z.boolean().default(false),
  }),
});

const fieldLogs = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/field-logs" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()),
    related: reference("case-studies").optional(),
    draft: z.boolean().default(false),
  }),
});

const writing = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/writing" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { "case-studies": caseStudies, "field-logs": fieldLogs, writing };
