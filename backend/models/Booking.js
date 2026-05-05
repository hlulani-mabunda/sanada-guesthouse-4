const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    houseNumber: { type: Number, required: true, index: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    duration: { type: Number, required: true },
    durationType: { type: String, enum: ["hours", "days"], required: true },
    amountPaid: { type: Number, required: true, default: 0 },
    staff: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);