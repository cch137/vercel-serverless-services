import type { VercelRequest, VercelResponse } from "@vercel/node";
import YTDL from "../../services/ytdl.js";
import { Booleanish } from "../../services/utils.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!(req.method === "GET" || req.method === "POST"))
    return res.status(200).end();

  const full = Booleanish(req.query["full"] || req.body?.["full"]);
  const _source =
    req.query["src"] ||
    req.body?.["src"] ||
    req.query["source"] ||
    req.body?.["source"];
  const id = req.query["id"] || req.body?.["id"];

  const source = _source || (id ? `https://youtu.be/${id}` : null);

  if (!source || typeof source !== "string") return res.status(400).end();

  try {
    return res.json(await YTDL.info(source, full));
  } catch (error) {
    res.status(500).json({ error });
  }
}
