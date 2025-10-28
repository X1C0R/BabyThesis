import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ fixed import
import { supabase } from "../supabased/supabasedClient";
import { showSuccess, showError } from "../../utils/modalUtils";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) {
        showError(error.message, "Login Failed");
        setLoading(false);
        return;
      }

      if (data.user) {
        showSuccess("Login successful! Redirecting...", "Success");
        setLoading(false); // Reset loading state
        // Give time for user to see the success message before redirect
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        showError("Login failed. No user data returned.", "Login Failed");
        setLoading(false);
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      showError("Something went wrong. Please try again later.", "Error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 pt-24">
      <div className="pb-12 px-4">
        <div className="max-w-md mx-auto bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2 text-center">
            Welcome Back
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Sign in to your EssentiaLokal account
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all text-sm"
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all text-sm"
                onChange={handleChange}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl text-white font-semibold bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
              disabled={loading}
            >
              {loading ? "⏳ Logging in..." : "🔐 Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600 text-sm">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-blue-600 font-semibold hover:text-blue-700 hover:underline"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
