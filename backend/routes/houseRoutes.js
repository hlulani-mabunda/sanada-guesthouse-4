const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const { getHouses } = require("../controllers/houseController");

router.get("/", protect, getHouses);

module.exports = router;