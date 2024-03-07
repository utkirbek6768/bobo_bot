const mongoose = require("mongoose");

const QueueSchema = mongoose.Schema(
  {
    fer: { type: Array },
    tosh: { type: Array },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Queue", QueueSchema);
