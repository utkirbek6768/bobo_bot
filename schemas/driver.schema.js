const mongoose = require("mongoose");

const DriverSchema = mongoose.Schema(
  {
    userName: { type: String },
    carNumber: { type: String },
    carType: { type: String },
    tariff: { type: String },
    shift: { type: Boolean, default: false }, // smenada
    queue: { type: Boolean, default: false }, // navbatda
    where: { type: String },
    queueIndex: { type: Number, default: 0 }, // navbatda raqami
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
