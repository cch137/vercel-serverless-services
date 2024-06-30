import type { VercelRequest, VercelResponse } from "@vercel/node";
import mongoose from "../services/db";

export default (() => {
  console.log("build func");
  return async function handler1(req: VercelRequest, res: VercelResponse) {
    const user = await mongoose.connection
      .collection("x-users")
      .findOne({ name: "cch137" });
    return res.json({
      user,
    });
  };
})();
