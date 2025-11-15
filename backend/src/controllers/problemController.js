import Problem from "../models/Problem.js";

/**
 * ✅ Create new problem
 */
export const createProblem = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const newProblem = await Problem.create({
      title,
      description,
      category,
      postedBy: req.user._id,
      status: "Pending",
    });

    res.status(201).json({
      success: true,
      message: "Problem reported successfully",
      problem: newProblem,
    });
  } catch (err) {
    console.error("createProblem error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to report problem" });
  }
};

/**
 * ✅ Get all problems (everyone)
 */
export const getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find()
      .populate("postedBy", "name email role")
      .sort({ createdAt: -1 });
    res.json({ success: true, problems });
  } catch (err) {
    console.error("getAllProblems error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch problems" });
  }
};

/**
 * ✅ Get logged-in user's problems only
 */
export const getMyProblems = async (req, res) => {
  try {
    const problems = await Problem.find({ postedBy: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, problems });
  } catch (err) {
    console.error("getMyProblems error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch user's problems" });
  }
};

/**
 * ✅ Update problem status (admin/superadmin)
 */
export const updateProblemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const problem = await Problem.findById(id);
    if (!problem)
      return res
        .status(404)
        .json({ success: false, message: "Problem not found" });

    problem.status = status || problem.status;
    await problem.save();

    res.json({
      success: true,
      message: "Problem status updated",
      problem,
    });
  } catch (err) {
    console.error("updateProblemStatus error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to update status" });
  }
};
