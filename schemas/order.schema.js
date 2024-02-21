const mongoose = require("mongoose");

const OrderSchema = mongoose.Schema(
  {
    where: { type: String },
    whereto: { type: String },
    passengersCount: { type: String },
    delivery: { type: Boolean },
    description: { type: String },
    orderStatus: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
