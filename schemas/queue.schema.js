const mongoose = require("mongoose");

const QueueSchema = mongoose.Schema(
  {
    fer: [
      {
        chatId: { type: String },
      },
    ],
    tosh: [
      {
        chatId: { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Queue", QueueSchema);
