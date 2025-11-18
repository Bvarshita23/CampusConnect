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
      department: req.user.department || null, // store creator's dept
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
      .populate("postedBy", "name email role department")
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
 * ✅ Update problem status (admin/superadmin/department_admin/functional_admin)
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

/**
 * ✅ Delete problem with role-based permissions
 * - superadmin: can delete any problem
 * - functional_admin: can delete any problem
 * - department_admin: can delete only problems from their department
 * - normal user: can delete only own problem
 */
export const deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id).populate(
      "postedBy",
      "department"
    );

    if (!problem) {
      return res
        .status(404)
        .json({ success: false, message: "Problem not found" });
    }

    const role = req.user.role;
    const userDept = req.user.department;

    // Superadmin => delete any
    if (role === "superadmin") {
      await problem.deleteOne();
      return res.json({
        success: true,
        message: "Problem deleted successfully",
      });
    }

    // Functional admin => delete any
    if (role === "functional_admin") {
      await problem.deleteOne();
      return res.json({
        success: true,
        message: "Problem deleted successfully",
      });
    }

    // Department admin => only same department
    if (role === "department_admin") {
      if (problem.postedBy?.department !== userDept) {
        return res.status(403).json({
          success: false,
          message: "You can only delete problems from your department",
        });
      }
      await problem.deleteOne();
      return res.json({
        success: true,
        message: "Problem deleted successfully",
      });
    }

    // Normal user => only delete own problem
    if (String(problem.postedBy?._id) !== String(req.user._id)) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to delete this problem",
        });
    }

    await problem.deleteOne();
    res.json({ success: true, message: "Problem deleted successfully" });
  } catch (err) {
    console.error("deleteProblem error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete problem" });
  }
};
