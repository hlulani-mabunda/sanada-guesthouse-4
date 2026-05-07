const Booking = require("../models/Booking");
const House = require("../models/House");

// CREATE BOOKING
exports.createBooking = async (req, res) => {
  try {
    const {
      customerName,
      houseNumber,
      date,
      time,
      duration,
      durationType,
      amountPaid,
      staff
    } = req.body;

    const house = await House.findOne({ houseNumber });

    if (!house) {
      return res.status(404).json({ msg: "House not found" });
    }

    if (house.isOccupied) {
      return res.status(400).json({ msg: "House already occupied" });
    }

    const booking = await Booking.create({
      customerName,
      houseNumber,
      date,
      time,
      duration,
      durationType,
      amountPaid,
      staff
    });

    // Mark house as occupied
    house.isOccupied = true;
    await house.save();

    res.json(booking);

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};



// RELEASE HOUSE (CHECK-OUT)
exports.releaseHouse = async (req, res) => {
  try {
    const { houseNumber } = req.body;

    const house = await House.findOne({ houseNumber });

    if (!house) {
      return res.status(404).json({ msg: "House not found" });
    }

    house.isOccupied = false;
    await house.save();

    res.json({ msg: "House released successfully" });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};



// GET ALL BOOKINGS (MANAGER VIEW)
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("staff", "name email")
      .sort({ createdAt: -1 });

    res.json(bookings);

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};