const mongoose = require("mongoose");

const OrderSchema = mongoose.Schema(
  {
    where: { type: String },
    whereto: { type: String },
    passengersCount: { type: String },
    delivery: { type: Boolean },
    phoneNumber: { type: String },
    userName: { type: String },
    description: { type: String },
    orderStatus: { type: String },
    passengersChatId: { type: String },
    driverChatId: { type: String },
    driverId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
