import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    phone: String,
    address: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", UserSchema);
