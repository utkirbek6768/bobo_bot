const mongoose = require("mongoose");

const DriverSchema = mongoose.Schema(
  {
    where: { type: String },
    whereto: { type: Boolean },
    passengerscount: { type: String },
    delivery: { type: Boolean },
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Driver", DriverSchema);
