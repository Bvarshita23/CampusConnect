import React, { useState } from "react";
import axios from "axios";

const AddSingleFaculty = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    designation: "",
    experience: "",
  });

  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    Object.keys(form).forEach((key) => fd.append(key, form[key]));
    fd.append("role", "faculty");
    if (photo) fd.append("photo", photo);

    try {
      const res = await axios.post("/api/v1/auth/register", fd, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setMessage("Faculty added successfully!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div>
      <h2>Add Faculty</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name"
          onChange={handleChange}
          required
        />
        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <input
          name="department"
          placeholder="Department"
          onChange={handleChange}
          required
        />
        <input
          name="designation"
          placeholder="Designation"
          onChange={handleChange}
          required
        />
        <input
          name="experience"
          placeholder="Years of Experience"
          onChange={handleChange}
          required
        />
        <input type="file" onChange={(e) => setPhoto(e.target.files[0])} />

        <button type="submit">Add Faculty</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default AddSingleFaculty;
