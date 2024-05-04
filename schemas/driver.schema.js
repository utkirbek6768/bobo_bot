const mongoose = require("mongoose");

const DriverSchema = mongoose.Schema(
  {
    userName: { type: String },
    carNumber: { type: String },
    phoneNumber: { type: String },
    carType: { type: String },
    tariff: { type: String },
    shift: { type: Boolean, default: false }, // smenada
    queue: { type: Boolean, default: false }, // navbatda
    where: { type: String },
    telegramName: { type: String },
    chatId: { type: String },
    active: { type: Boolean },
    order: {
      id: { type: [String] },
      passengersCount: { type: Number },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Driver", DriverSchema);
