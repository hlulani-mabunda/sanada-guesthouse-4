const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  createBooking,
  releaseHouse,
  getBookings
} = require("../controllers/bookingController");

router.post("/", protect, createBooking);
router.post("/release", protect, releaseHouse);
router.get("/", protect, getBookings);

module.exports = router;