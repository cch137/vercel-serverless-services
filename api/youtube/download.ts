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
  const downloadId = req.query["d"] || req.body?.["d"];
  let format = req.query["f"] || req.body?.["f"];
  let filename = req.query["filename"] || req.body?.["filename"];

  if (downloadId && typeof downloadId === "string") {
    const dirname = `public/ytdl-cache/${downloadId}/`;

    if (!fs.existsSync(dirname)) {
      res.status(404).end();
      return;
    }

    if (!filename || !fs.existsSync(dirname + filename)) {
      filename = fs.readdirSync(dirname)[0];
      if (!filename) {
        res.status(404).end();
        return;
      }
    }

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(filename)}"`
    );
    res.setHeader("Content-Type", "video/mp4");

    fs.createReadStream(dirname + filename).pipe(res);

    return;
  }

  const source = _source || (id ? `https://youtu.be/${id}` : null);

  if (!source || typeof source !== "string") return res.status(400).end();

  if (!filename || typeof filename !== "string") {
    const info = await YTDL.info(source);
    if (!info) return res.status(500).end();
    filename = info?.title;
  }

  if (typeof format === "string") format = format.toLowerCase();

  if (!filename.endsWith(`.${format}`)) filename += `.${format}`;
  filename = toSafeFilename(filename);

  if (format === "mp4") {
    try {
      const uuid = crypto.randomUUID();
      const cacheFilepath = `public/ytdl-cache/${uuid}/${filename}`;
      try {
        fs.mkdirSync(path.dirname(cacheFilepath), { recursive: true });
      } catch {}
      YTDL.mp4(source, { output: cacheFilepath })
        .stream.on("close", () => {
          res.redirect(`/api/youtube/download?d=${uuid}`);
        })
        .on("error", () => res.status(500).end());
    } catch {
      res.status(500).end();
    }
    return;
  }

  try {
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(filename)}"`
    );
    res.setHeader("Content-Type", "audio/mpeg");
    YTDL.mp3(source).stream.pipe(res);
  } catch {
    res.status(500).end();
  }
}
