import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const uuid = req.query["uuid"] || req.body?.["uuid"];
  const filename = req.query["filename"] || req.body?.["filename"];

  if (
    (uuid && typeof uuid !== "string") ||
    (filename && typeof filename !== "string")
  )
    return res.status(400).end();

  const filepath = `public/ytdl-cache/${uuid}/${filename}.mp4`;

  if (!fs.existsSync(filepath) || !fs.statSync(filepath).isFile())
    return res.status(404).end();

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${encodeURIComponent(filename)}"`
  );
  res.setHeader("Content-Type", "video/mp4");

  fs.createReadStream(filepath).pipe(res);
}
