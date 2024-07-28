import { exchangeCurrency } from "../../services/currency.js";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Booleanish } from "../../services/utils.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const from = req.query["from"] || req.body?.["from"];
    const to = req.query["to"] || req.body?.["to"];
    const human = Booleanish(req.query["h"] || req.body?.["h"]);

    if (human) {
      res.setHeader("Content-Type", "text/plain");
      res.send(`1 ${from} = ${await exchangeCurrency(from, to)} ${to}`);
    } else {
      res.json(await exchangeCurrency(from, to));
    }
  } catch {
    res.status(500).end();
  }
}
