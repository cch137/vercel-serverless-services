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
  const uuid = req.query["uuid"] || req.body?.["uuid"];
  let format = req.query["f"] || req.body?.["f"];
  let filename = req.query["filename"] || req.body?.["filename"];

  if (
    uuid &&
    typeof uuid === "string" &&
    filename &&
    typeof filename !== "string"
  ) {
    const filepath = `public/ytdl-cache/${uuid}/${filename}.mp4`;

    if (!fs.existsSync(filepath) || !fs.statSync(filepath).isFile())
      return res.status(404).end();

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(filename)}"`
    );
    res.setHeader("Content-Type", "video/mp4");

    fs.createReadStream(filepath).pipe(res);

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
  if (format !== "mp3" || format !== "mp4") format = "mp3";

  if (!filename.endsWith(`.${format}`)) filename += `.${format}`;
  filename = toSafeFilename(filename);

  if (format === "mp3") {
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
    return;
  }

  try {
    const uuid = crypto.randomUUID();
    const cacheFilepath = `public/ytdl-cache/${uuid}/${filename}.mp4`;
    try {
      fs.mkdirSync(path.dirname(cacheFilepath), { recursive: true });
    } catch {}
    YTDL.mp4(source, { output: cacheFilepath })
      .stream.on("close", () => {
        res.redirect(
          `/api/youtube/mp4?filename=${encodeURIComponent(
            filename
          )}&uuid=${uuid}&f=mp4`
        );
      })
      .on("error", () => res.status(500).end());
  } catch (error) {
    res.status(500).end();
  }
}
