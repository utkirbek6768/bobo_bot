const mongoose = require("mongoose");

const DriverSchema = mongoose.Schema(
  {
    userName: { type: String },
    carNumber: { type: String },
    carType: { type: String },
    tariff: { type: String },
    shift: { type: Boolean }, // smenada
    queue: { type: Boolean }, // navbatda
    where: { type: String },
    queueIndex: { type: String }, // navbatda raqami
    chatId: { type: String },
    order: { type: Boolean },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Driver", DriverSchema);
