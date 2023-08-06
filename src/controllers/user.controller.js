const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { registerValidation, loginValidation } = require("../utils/validations");
const { JWT_SECRET } = require("../configs/env.config");

const handleResponse = (res, status, data = null, error = null) => {
  const response = { status };
  if (data) response.data = data;
  if (error) response.error = error;
  return res.status(status).json(response);
};

const registerUser = async (req, res) => {
  try {
    const { error } = registerValidation(req.body);
    if (error) return handleResponse(res, 400, null, error.details[0].message);

    const emailExists = await User.findOne({
      where: { email: req.body.email },
    });
    if (emailExists)
      return handleResponse(res, 409, null, "Email already exists");

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    return handleResponse(res, 200, { userId: user.id });
  } catch (err) {
    console.error(err);
    return handleResponse(res, 500, null, "Server Error");
  }
};

const loginUser = async (req, res) => {
  try {
    const { error } = loginValidation(req.body);
    if (error) return handleResponse(res, 400, null, error.details[0].message);

    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) return handleResponse(res, 401, null, "Invalid credentials");

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword)
      return handleResponse(res, 401, null, "Invalid credentials");

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    return handleResponse(res, 200, { token });
  } catch (err) {
    console.error(err);
    return handleResponse(res, 500, null, "Server Error");
  }
};

module.exports = {
  registerUser,
  loginUser,
};
