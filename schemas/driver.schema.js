const mongoose = require("mongoose");

const DriverSchema = mongoose.Schema(
  {
    userName: { type: String },
    carNumber: { type: String },
    cartype: { type: String },
    active: { type: Boolean },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Driver", DriverSchema);
