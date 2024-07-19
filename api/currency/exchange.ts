import { exchangeCurrency } from "../../services/currency";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const from = req.query["from"] || req.body["from"];
    const to = req.query["to"] || req.body["to"];
    res.json(await exchangeCurrency(from, to));
  } catch {
    res.status(500);
  }
}
