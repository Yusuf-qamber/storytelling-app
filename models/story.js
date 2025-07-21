const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const storySchema = new Schema(
  {
    title: { type: String, required: true },
    date: String,
    genre: String,
    story: { type: String, required: true },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Story", storySchema);
