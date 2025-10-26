import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    contact_number: "",
    gender: "",
    role: "User",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [idImage, setIdImage] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => formData.append(key, form[key]));

      // Only append images if role is Landlord
      if (form.role.toUpperCase() === "LANDLORD") {
        if (!profileImage || !idImage) {
          setMessage("Profile Image and ID Image are required for Landlords");
          setLoading(false);
          return;
        }
        formData.append("profile_image", profileImage);
        formData.append("id_image", idImage);
      }

      const res = await fetch("http://localhost:4000/register", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(data.error || "Something went wrong!");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Register an Account
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="border p-2 rounded"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="border p-2 rounded"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="full_name"
          placeholder="Full Name"
          className="border p-2 rounded"
          onChange={handleChange}
        />
        <div className="flex items-center border rounded p-2">
          <span className="text-gray-600 font-medium pr-2 border-r border-gray-400">
            +63
          </span>
          <input
            type="text"
            name="contact_number"
            placeholder="Enter 10-digit number"
            className="flex-1 p-2 focus:outline-none"
            maxLength={10}
            value={form.contact_number}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              if (value.length <= 10) setForm({ ...form, contact_number: value });
            }}
            required
          />
        </div>

        <select
          name="gender"
          className="border p-2 rounded"
          onChange={handleChange}
          required
        >
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>

        <select
          name="role"
          className="border p-2 rounded"
          onChange={handleChange}
          value={form.role}
        >
          <option>User</option>
          <option>Landlord</option>
          <option>Admin</option>
        </select>

        {/* Conditionally show both images if role is Landlord */}
        {form.role.toUpperCase() === "LANDLORD" && (
          <>
            <label>Profile Image (required):</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfileImage(e.target.files[0])}
              required
            />

            <label>ID Image (required):</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setIdImage(e.target.files[0])}
              required
            />
          </>
        )}

        <button
          type="submit"
          className={`p-2 rounded text-white ${
            loading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
          }`}
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      {message && <p className="mt-4 text-center text-sm">{message}</p>}
    </div>
  );
};

export default Register;
