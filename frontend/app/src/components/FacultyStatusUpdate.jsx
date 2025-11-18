import React, { useState } from "react";
import api from "../utils/api"; // ✅ FIXED

export default function FacultyStatusUpdate() {
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  const updateStatus = async () => {
    try {
      const res = await api.put("/faculty/status/update", {
        status,
        message,
      }); // ✅ FIXED — NOW USING api

      console.log("Updated", res);
      alert("Status updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update");
    }
  };

  return (
    <div>
      <h1>Update Status</h1>

      <select onChange={(e) => setStatus(e.target.value)}>
        <option value="">Select Status</option>
        <option value="Available">Available</option>
        <option value="In Class">In Class</option>
        <option value="Busy">Busy</option>
        <option value="On Leave">On Leave</option>
        <option value="Offline">Offline</option>
      </select>

      <input
        type="text"
        placeholder="Message"
        onChange={(e) => setMessage(e.target.value)}
      />

      <button onClick={updateStatus}>Update</button>
    </div>
  );
}
