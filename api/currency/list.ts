import { getCurrencyList } from "../../services/currency";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export async function handler(req: VercelRequest, res: VercelResponse) {
  return res.json(await getCurrencyList());
}
