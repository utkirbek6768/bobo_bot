const mongoose = require("mongoose");

const DriverSchema = mongoose.Schema(
  {
    userName: { type: String },
    carNumber: { type: String },
    carType: { type: String },
    where: { type: String },
    tariff: { type: String },
    active: { type: Boolean },
    chatId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Driver", DriverSchema);
