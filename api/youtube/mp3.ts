import type { VercelRequest, VercelResponse } from "@vercel/node";
import YTDL from "../../services/ytdl";
import { toSafeFilename } from "../../services/utils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!(req.method === "GET" || req.method === "POST"))
    return res.status(200).end();

  const _source =
    req.query["src"] ||
    req.body?.["src"] ||
    req.query["source"] ||
    req.body?.["source"];
  const id = req.query["id"] || req.body?.["id"];

  const source = _source || (id ? `https://youtu.be/${id}` : null);

  if (!source || typeof source !== "string") return res.status(400).end();

  let filename = req.query["filename"] || req.body?.["filename"];
  filename = toSafeFilename(filename);

  if (!filename || typeof filename !== "string") {
    const info = await YTDL.info(source);
    if (!info) return res.status(500).end();
    filename = info?.title;
  }

  if (!filename.endsWith(".mp3")) filename += ".mp3";

  try {
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(filename)}"`
    );
    res.setHeader("Content-Type", "audio/mpeg");
    YTDL.mp3(source).stream.pipe(res);
  } catch (error) {
    res.status(500).json({ error });
  }
}
