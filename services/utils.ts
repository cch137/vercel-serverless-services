import { VercelRequest } from "@vercel/node";

export function Booleanish(value: any) {
  if (typeof value !== "string") return Boolean(value);
  if (value === "false" || value === "0") return false;
  return true;
}
