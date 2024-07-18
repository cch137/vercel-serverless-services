import type { VercelRequest, VercelResponse } from "@vercel/node";

const cors = (res: VercelResponse) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  return res;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return cors(res).status(200).end();
  const [input, init] = typeof req.body === "string" ? [req.body] : req.body;
  if (!input || typeof input !== "string") return res.status(400).end();
  if (init && typeof init !== "object") return res.status(400).end();
  try {
    const proxied = await fetch(input, init);
    res.status(proxied.status).statusMessage ||= proxied.statusText;
    proxied.headers.forEach((v, k) => {
      if (/content-length/i.test(k)) return;
      if (/content-encoding/i.test(k)) return;
      if (/set-cookie/i.test(k)) k = `proxy-${k}`;
      res.appendHeader(k, v);
    });
    cors(res);
    const reader = proxied.body?.getReader();
    if (!reader) return res.end();
    while (true) {
      const { value, done } = await reader.read();
      if (value) res.write(value);
      if (done) break;
    }
    res.end();
  } catch (err) {
    cors(res)
      .status(500)
      .setHeader("Content-Type", "text/plain")
      .setHeader("Error", err instanceof Error ? err.message : String(err));
  }
}
