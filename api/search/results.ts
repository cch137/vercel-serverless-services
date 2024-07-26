import { search } from "../../services/search";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function searchResults(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const query = req.query["query"] || req.body["query"];
    const engine = req.query["engine"] || req.body["engine"];
    res.json(await search(query, { engine }));
  } catch {
    res.status(500).end();
  }
}
