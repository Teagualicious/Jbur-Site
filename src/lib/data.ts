// Every contact detail lives in src/data/site.json, once. Parsing here fails
// the build if a field is missing or malformed.
import siteJson from "../data/site.json";
import projectsJson from "../data/projects.json";
import { projectsSchema, siteSchema } from "./schemas.ts";

export const site = siteSchema.parse(siteJson);
export const projects = projectsSchema.parse(projectsJson);
