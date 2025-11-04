import User from "../models/User.js";
export const createUser = async (req, res) => {
  const { name, email, password, role, department } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: "User already exists" });
  const user = await User.create({ name, email, password, role, department });
  res.status(201).json(user);
};

export const listUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};
