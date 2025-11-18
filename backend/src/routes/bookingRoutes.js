import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  createBooking,
  getMyBookings,
  getFacultyBookings,
  approveBooking,
  rejectBooking,
} from "../controllers/bookingController.js";

const router = express.Router();

router.post("/create", verifyToken, createBooking);
router.get("/student/my", verifyToken, getMyBookings);
router.get("/faculty/my", verifyToken, getFacultyBookings);
router.put("/approve/:id", verifyToken, approveBooking);
router.put("/reject/:id", verifyToken, rejectBooking);

export default router;
