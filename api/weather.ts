import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: Request, res: VercelResponse) {
  try {
    const apiRes = await fetch(
      `http://api.weatherapi.com/v1/current.json?key=${
        process.env.WEATHER_API_KEY
      }&q=${encodeURIComponent("lat,long")}`
    );
    const data = await apiRes.json();
    res.json(data);
  } catch {
    res.status(500);
  }
}
