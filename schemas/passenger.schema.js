const mongoose = require("mongoose");

const PassengerSchema = mongoose.Schema(
  {
    userName: { type: String },
    phoneNumber: { type: String },
    chatId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Passenger", PassengerSchema);
