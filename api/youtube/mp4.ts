import type { VercelRequest, VercelResponse } from "@vercel/node";
import YTDL from "../../services/ytdl";
import { toSafeFilename } from "../../services/utils";
import path from "path";
import fs from "fs";

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

  if (!filename || typeof filename !== "string") {
    const info = await YTDL.info(source);
    if (!info) return res.status(500).end();
    filename = info?.title;
  }

  if (!filename.endsWith(".mp4")) filename += ".mp4";
  filename = toSafeFilename(filename);

  try {
    const uuid = crypto.randomUUID();
    const cacheFilepath = `public/ytdl-cache/${uuid}/${filename}.mp4`;
    try {
      fs.mkdirSync(path.dirname(cacheFilepath), { recursive: true });
    } catch {}
    YTDL.mp4(source, { output: cacheFilepath })
      .stream.on("close", () => {
        res.redirect(
          `/api/youtube/mp4-download?filename=${encodeURIComponent(
            filename
          )}&uuid=${uuid}`
        );
      })
      .on("error", () => res.status(500).end());
  } catch (error) {
    res.status(500).end();
  }
}
