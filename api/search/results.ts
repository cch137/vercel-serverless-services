import { search, searchToText } from "../../services/search.js";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Booleanish } from "../../services/utils.js";

export default async function searchResults(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const query = req.query["query"] || req.body?.["query"];
    const engine = req.query["engine"] || req.body?.["engine"];
    const human = Booleanish(req.query["h"] || req.body?.["h"]);
    const url = Booleanish(req.query["url"] || req.body?.["url"]);
    const v2 = Booleanish(req.query["v2"] || req.body?.["v2"]);

    if (human) {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.send(await searchToText(query, { engine, url, v2 }));
    } else {
      res.json(await search(query, { engine }));
    }
  } catch {
    res.status(500).end();
  }
}
