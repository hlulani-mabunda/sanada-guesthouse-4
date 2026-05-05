const mongoose = require("mongoose");

const houseSchema = new mongoose.Schema(
  {
    houseNumber: { type: Number, required: true, unique: true, index: true },
    isOccupied: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.models.House || mongoose.model("House", houseSchema);