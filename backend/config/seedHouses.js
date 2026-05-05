const House = require("../models/House");

const seedHouses = async () => {
  try {
    const count = await House.countDocuments();

    if (count === 0) {
      const houses = [];

      for (let i = 1; i <= 25; i++) {
        houses.push({ houseNumber: i });
      }

      await House.insertMany(houses);
      console.log("25 Houses Created ✅");
    } else {
      console.log("Houses already exist");
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = seedHouses;