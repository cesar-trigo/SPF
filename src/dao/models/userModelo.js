import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String },
  email: { type: String, required: true },
  password: { type: String, required: true },
  age: { type: Number, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  githubId: { type: Boolean, default: false },
});

export const userModelo = mongoose.model("users", userSchema);
