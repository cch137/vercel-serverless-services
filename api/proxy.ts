import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler1(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const [input, init] = typeof req.body === "string" ? [req.body] : req.body;
  if (typeof input !== "string") return res.status(400).end();
  if (init && typeof init !== "object") return res.status(400).end();
  try {
    const proxyRes = await fetch(input, init);
    res.status(proxyRes.status).statusMessage ||= proxyRes.statusText;
    proxyRes.headers.forEach((v, k) => {
      if (/content-length/i.test(k)) return;
      if (/content-encoding/i.test(k)) return;
      if (/set-cookie/i.test(k)) k = `proxy-${k}`;
      res.appendHeader(k, v);
    });
    const reader = proxyRes.body?.getReader();
    if (!reader) return res.end();
    while (true) {
      const { value, done } = await reader.read();
      if (value) res.write(value);
      if (done) break;
    }
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).send(err instanceof Error ? err.message : err);
  }
}
