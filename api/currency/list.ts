import { getCurrencyList } from "../../services/currency.js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    res.json(await getCurrencyList());
  } catch {
    res.status(500).end();
  }
}
