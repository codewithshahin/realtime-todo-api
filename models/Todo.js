import mongoose from "mongoose";

const TodoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
    },
    done: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Todo", TodoSchema);
