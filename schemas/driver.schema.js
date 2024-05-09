const mongoose = require("mongoose");

const DriverSchema = mongoose.Schema(
  {
    userName: { type: String, required: true },
    carNumber: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    carType: { type: String },
    tariff: { type: String },
    approvedByAdmin: { type: Boolean, default: false },
    shift: { type: Boolean, default: false },
    queue: { type: Boolean, default: false },
    where: { type: String },
    telegramName: { type: String },
    chatId: { type: String, required: true, unique: true },
    active: { type: Boolean, default: true },
    order: {
      id: { type: [mongoose.Schema.Types.ObjectId], default: [] },
      passengersCount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Driver", DriverSchema);
