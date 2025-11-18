import Booking from "../models/Booking.js";

export const createBooking = async (req, res) => {
  try {
    const { faculty, date, time, reason } = req.body;

    const booking = await Booking.create({
      student: req.user._id,
      faculty,
      date,
      time,
      reason,
    });

    res.json({ success: true, booking });
  } catch {
    res.status(500).json({ success: false });
  }
};

export const getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ student: req.user._id }).populate(
    "faculty",
    "name"
  );
  res.json({ success: true, bookings });
};

export const getFacultyBookings = async (req, res) => {
  const bookings = await Booking.find({ faculty: req.user._id }).populate(
    "student",
    "name"
  );
  res.json({ success: true, bookings });
};

export const approveBooking = async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status: "Approved" },
    { new: true }
  );
  res.json({ success: true, booking });
};

export const rejectBooking = async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status: "Rejected" },
    { new: true }
  );
  res.json({ success: true, booking });
};
