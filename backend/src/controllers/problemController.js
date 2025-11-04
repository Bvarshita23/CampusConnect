import Problem from "../models/Problem.js";

/**
 * Create a new problem report
 * Roles: student, faculty (any authenticated user)
 */
export const createProblem = async (req, res) => {
  try {
    const { title, description, category, department } = req.body;
    if (!title || !description || !department) {
      return res
        .status(400)
        .json({ message: "title, description, and department are required." });
    }

    const doc = await Problem.create({
      title,
      description,
      category: category || "Other",
      department,
      submittedBy: {
        _id: req.user._id,
        name: req.user.name || req.user.email?.split("@")[0],
        email: req.user.email,
        role: req.user.role,
      },
    });

    return res.status(201).json({ message: "Problem submitted", problem: doc });
  } catch (err) {
    console.error("createProblem error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get problems (role-aware)
 * - student: only own problems
 * - faculty: by department (their department if present in profile query param or token), or all if admin flag provided
 * - admin: all problems with optional filters
 * Query params: status, category, department, search, page, limit
 */
export const getProblems = async (req, res) => {
  try {
    const { role, department: userDept } = req.user;
    const {
      status,
      category,
      department,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const q = {};
    if (status) q.status = status;
    if (category) q.category = category;

    // role-based scoping
    if (role === "student") {
      q["submittedBy._id"] = req.user._id;
    } else if (role === "faculty") {
      q.department = department || userDept || q.department; // faculty sees own department by default
    } else if (role === "admin") {
      if (department) q.department = department;
    }

    // simple search on title/description
    if (search) {
      q.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Problem.find(q).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Problem.countDocuments(q),
    ]);

    return res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      problems: items,
    });
  } catch (err) {
    console.error("getProblems error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update status (admin or department faculty)
 * Allowed status: OPEN | IN_PROGRESS | RESOLVED | REJECTED
 */
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ["OPEN", "IN_PROGRESS", "RESOLVED", "REJECTED"];
    if (!allowed.includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const problem = await Problem.findById(id);
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    // authorization: admins always; faculty only for their department
    if (
      req.user.role === "faculty" &&
      req.user.department !== problem.department
    ) {
      return res
        .status(403)
        .json({ message: "Not allowed to update other departments." });
    }

    problem.status = status;
    await problem.save();
    return res.json({ message: "Status updated", problem });
  } catch (err) {
    console.error("updateStatus error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Add a comment (any authenticated user who can see the problem)
 */
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text?.trim())
      return res.status(400).json({ message: "Comment text required" });

    const problem = await Problem.findById(id);
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    // visibility check
    if (
      req.user.role === "student" &&
      String(problem.submittedBy._id) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: "Not allowed." });
    }
    if (
      req.user.role === "faculty" &&
      req.user.department !== problem.department
    ) {
      return res.status(403).json({ message: "Not allowed." });
    }

    problem.comments.push({
      by: {
        _id: req.user._id,
        name: req.user.name || req.user.email,
        role: req.user.role,
      },
      text,
    });
    await problem.save();
    return res.json({ message: "Comment added", problem });
  } catch (err) {
    console.error("addComment error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
