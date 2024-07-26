import type { VercelRequest, VercelResponse } from "@vercel/node";
import { search } from "../../services/search";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const query = req.query["query"] || req.body["query"];
    res.json(await search(query, { engine: "ddg" }));
  } catch {
    res.status(500).end();
  }
}
