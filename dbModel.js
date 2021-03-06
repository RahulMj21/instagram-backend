const mongoose = require("mongoose");

const instance = mongoose.Schema(
  {
    caption: String,
    name: String,
    userImg: String,
    imageUrl: String,
    comments: Array,
  },
  {
    timestamps: true,
  }
);

const dbModel = mongoose.model("posts", instance);

module.exports = dbModel;
