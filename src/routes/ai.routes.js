const express = require("express");
const { askQuestion } = require("../controllers/ai.controller.js");

const router = express.Router();

router.post("/ask", askQuestion);

module.exports = router;
