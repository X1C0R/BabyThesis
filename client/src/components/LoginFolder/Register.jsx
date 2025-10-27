import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../images/logo.png";
import Navbar from "../Navbar";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    contact_number: "",
    gender: "",
    role: "User",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [idImage, setIdImage] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleLogout = async () => {
    // Since user is not logged in on registration page, just redirect
    navigate("/");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    }
    
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!form.contact_number.trim()) {
      newErrors.contact_number = "Contact number is required";
    }
    
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (!form.gender) {
      newErrors.gender = "Gender is required";
    }

    if (form.role.toUpperCase() === "LANDLORD") {
      if (!profileImage) {
        newErrors.profileImage = "Profile image is required for Landlords";
      }
      if (!idImage) {
        newErrors.idImage = "ID image is required for Landlords";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    
    if (!validateForm()) {
      setMessage("Please fix the errors before submitting.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (key !== "confirmPassword") {
          formData.append(key, form[key]);
        }
      });

      // Only append images if role is Landlord
      if (form.role.toUpperCase() === "LANDLORD") {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar user={null} onLogout={handleLogout} />
      
      <div className="pt-24 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-100">
          <div className="flex flex-col lg:flex-row">
            {/* Left Side - Branding */}
            <div className="lg:w-1/3 bg-gradient-to-br from-blue-500 to-purple-600 p-8 lg:p-12 flex flex-col justify-center items-center relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48"></div>
              
              <div className="relative z-10 text-center px-4">
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 mb-4 inline-block">
                  <img src={logo} alt="Logo" className="h-12 w-12 mx-auto" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
                  AccommodationHub
                </h1>
                <p className="text-white/90 text-sm mb-6">
                  Find Your Perfect Stay
                </p>
                <div className="flex space-x-2 md:space-x-3 justify-center">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-white">500+</div>
                    <div className="text-white/80 text-xs">Hotels</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-white">50+</div>
                    <div className="text-white/80 text-xs">Cities</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-white">10K+</div>
                    <div className="text-white/80 text-xs">Guests</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="lg:w-2/3 p-6 lg:p-8">
              <div className="max-w-lg mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Create Your Account
                </h2>
                <p className="text-gray-600 mb-6 text-sm">
                  Join AccommodationHub and discover amazing places to stay
                </p>

                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={form.full_name}
                      placeholder="Enter your full name"
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all text-sm"
                      onChange={handleChange}
                      required
                    />
                    {errors.full_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      placeholder="Enter your email"
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all text-sm"
                      onChange={handleChange}
                      required
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Contact Number *
                    </label>
                    <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden focus-within:border-blue-500 transition-all">
                      <span className="text-gray-600 font-medium px-3 py-2.5 border-r-2 border-gray-200 bg-gray-50 text-sm">
                        +63
                      </span>
                      <input
                        type="text"
                        name="contact_number"
                        placeholder="Enter 10-digit number"
                        className="flex-1 px-3 py-2.5 focus:outline-none text-sm"
                        maxLength={10}
                        value={form.contact_number}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 10) setForm({ ...form, contact_number: value });
                        }}
                        required
                      />
                    </div>
                    {errors.contact_number && (
                      <p className="text-red-500 text-sm mt-1">{errors.contact_number}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        placeholder="Enter password"
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all pr-10 text-sm"
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-lg"
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={form.confirmPassword}
                        placeholder="Confirm password"
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all pr-10 text-sm"
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-lg"
                      >
                        {showConfirmPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Gender and Role */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Gender *
                      </label>
                      <select
                        name="gender"
                        value={form.gender}
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all text-sm"
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Gender</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                      {errors.gender && (
                        <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Role *
                      </label>
                      <select
                        name="role"
                        value={form.role}
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all text-sm"
                        onChange={handleChange}
                        required
                      >
                        <option value="User">User</option>
                        <option value="Landlord">Landlord</option>
                      </select>
                    </div>
                  </div>

                  {/* Landlord Images */}
                  {form.role === "Landlord" && (
                    <div className="space-y-3 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                        🏠 Landlord Verification (Required)
                      </h3>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Profile Image *
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setProfileImage(e.target.files[0])}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all bg-white text-xs"
                          required
                        />
                        {errors.profileImage && (
                          <p className="text-red-500 text-xs mt-1">{errors.profileImage}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          ID Image *
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setIdImage(e.target.files[0])}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all bg-white text-xs"
                          required
                        />
                        {errors.idImage && (
                          <p className="text-red-500 text-xs mt-1">{errors.idImage}</p>
                        )}
                      </div>
                      <p className="text-xs text-gray-600">
                        📋 Upload profile photo and valid ID for verification. Your account will be reviewed by admin.
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <span className="animate-spin mr-2">⏳</span>
                        Creating Account...
                      </span>
                    ) : (
                      "✨ Create Account"
                    )}
                  </button>
                </form>

                {/* Message */}
                {message && (
                  <div className={`mt-4 p-3 rounded-lg text-center text-sm ${
                    message.includes("successful") 
                      ? "bg-green-100 text-green-700 border-2 border-green-300" 
                      : "bg-red-100 text-red-700 border-2 border-red-300"
                  }`}>
                    {message}
                  </div>
                )}

                {/* Login Link */}
                <p className="mt-4 text-center text-gray-600 text-sm">
                  Already have an account?{" "}
                  <button
                    onClick={() => navigate("/login")}
                    className="text-blue-600 font-semibold hover:text-blue-700 hover:underline"
                  >
                    Log in
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
