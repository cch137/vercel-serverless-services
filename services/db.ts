import mongoose from "mongoose";

mongoose
  .connect(String(process.env.DB_URI))
  .then(() => console.log("connected to mongodb"))
  .catch(() => console.log("faield to connect mongodb"));

export default mongoose;
