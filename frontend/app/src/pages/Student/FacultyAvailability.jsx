import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function BookSlot() {
  const [faculty, setFaculty] = useState("");
  const [facultyList, setFacultyList] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    loadFaculty();
  }, []);

  // LOAD FACULTY LIST
  const loadFaculty = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await axios.get(
        "http://localhost:8080/api/v1/auth/all-users",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // NOTE: axios responses store data in res.data
      const onlyFaculty = res.data.users.filter((u) => u.role === "faculty");
      setFacultyList(onlyFaculty);
    } catch (err) {
      toast.error("Failed to load faculty list");
    }
  };

  // SUBMIT SLOT BOOKING
  const submit = async () => {
    if (!faculty || !date || !time) {
      toast.error("Please fill all fields");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "http://localhost:8080/api/v1/bookings/create",
        { faculty, date, time, reason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Booking request sent!");
      setFaculty("");
      setDate("");
      setTime("");
      setReason("");
    } catch (err) {
      toast.error("Booking failed");
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded-lg max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Book a Slot</h2>

      <label className="block mb-1 mt-3">Select Faculty</label>
      <select
        className="w-full border p-2 rounded"
        value={faculty}
        onChange={(e) => setFaculty(e.target.value)}
      >
        <option value="">Select faculty</option>
        {facultyList.map((f) => (
          <option key={f._id} value={f._id}>
            {f.name}
          </option>
        ))}
      </select>

      <label className="block mb-1 mt-3">Date</label>
      <input
        type="date"
        className="w-full border p-2 rounded"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <label className="block mb-1 mt-3">Time</label>
      <input
        type="time"
        className="w-full border p-2 rounded"
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />

      <label className="block mb-1 mt-3">Reason</label>
      <input
        type="text"
        className="w-full border p-2 rounded"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />

      <button
        onClick={submit}
        className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
      >
        Book
      </button>
    </div>
  );
}
