// Schemas for the JSON data files. Kept free of Astro imports so the tests
// can run them under plain Node.
import { z } from "astro/zod";

export const siteSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  linkedin: z.url(),
  github: z.url(),
  resumePdf: z.string().startsWith("/"),
  availability: z.string().min(1),
  location: z.string().min(1),
  now: z.string().min(1),
});

export const projectsSchema = z.array(
  z.object({
    name: z.string().min(1),
    blurb: z.string().min(1),
    status: z.string().min(1),
    stack: z.array(z.string()),
    repo: z.url(),
    link: z.url().optional(),
  }),
);

export type Site = z.infer<typeof siteSchema>;
export type Project = z.infer<typeof projectsSchema>[number];
