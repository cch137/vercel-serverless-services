import { searchToText } from "../../services/search";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Booleanish } from "../../services/utils";

export default async function searchResultsH(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const query = req.query["query"] || req.body["query"];
    const url = Booleanish(req.query["url"] || req.body["url"]);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send(await searchToText(query, { engine: "ddg", url }));
  } catch {
    res.status(500).end();
  }
}
