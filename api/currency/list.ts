import { getCurrencyList } from "../../services/currency";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.json(await getCurrencyList());
}
