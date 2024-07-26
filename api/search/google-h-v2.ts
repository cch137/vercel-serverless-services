import { googleSearchToTextV2 } from "../../services/search";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function searchResultsH(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const query = req.query["query"] || req.body["query"];
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send(await googleSearchToTextV2(query));
  } catch {
    res.status(500).end();
  }
}
