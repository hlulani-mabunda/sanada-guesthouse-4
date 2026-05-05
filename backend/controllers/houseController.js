const House = require("../models/House");

exports.getHouses = async (req, res) => {
  try {
    const houses = await House.find().sort({ houseNumber: 1 });
    res.json(houses);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};