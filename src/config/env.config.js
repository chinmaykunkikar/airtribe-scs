require("dotenv").config();

const { PORT, JWT_SECRET } = process.env;

module.exports = {
  PORT,
  JWT_SECRET,
};
