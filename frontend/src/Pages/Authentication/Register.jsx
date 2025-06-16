import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    email: "",
    password: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (error === "google_auth_failed") {
      setError("Google authentication failed. Please try again.");
    } else if (token) {
      localStorage.setItem("token", token);
      navigate("/dashboard");
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5005/api/auth/signup",
        formData,
        { withCredentials: true }
      );

      if (response.data) {
        localStorage.setItem("token", response.data.token);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5005/auth/google";
  };

  return (
    <div className="fixed inset-0 min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-indigo-900/50 to-black overflow-hidden">
      <div className="bg-gray-900/80 border border-gray-700 shadow-xl rounded-2xl p-8 backdrop-blur-lg w-full max-w-md">
        <h1 className="text-3xl font-semibold text-white mb-6 text-center">
          Register for Idea Incubator
        </h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="firstName"
              className="text-sm font-medium text-gray-300 uppercase tracking-wide"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="border border-gray-600 rounded-xl bg-gray-700/50 text-white py-3 px-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200 placeholder-gray-400 w-full"
              placeholder="Enter your first name"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="lastName"
              className="text-sm font-medium text-gray-300 uppercase tracking-wide"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="border border-gray-600 rounded-xl bg-gray-700/50 text-white py-3 px-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200 placeholder-gray-400 w-full"
              placeholder="Enter your last name"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="mobileNumber"
              className="text-sm font-medium text-gray-300 uppercase tracking-wide"
            >
              Mobile Number
            </label>
            <input
              type="tel"
              id="mobileNumber"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              className="border border-gray-600 rounded-xl bg-gray-700/50 text-white py-3 px-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200 placeholder-gray-400 w-full"
              placeholder="Enter your mobile number"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-300 uppercase tracking-wide"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="border border-gray-600 rounded-xl bg-gray-700/50 text-white py-3 px-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200 placeholder-gray-400 w-full"
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-300 uppercase tracking-wide"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="border border-gray-600 rounded-xl bg-gray-700/50 text-white py-3 px-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200 placeholder-gray-400 w-full"
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="address"
              className="text-sm font-medium text-gray-300 uppercase tracking-wide"
            >
              Address (Optional)
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="border border-gray-600 rounded-xl bg-gray-700/50 text-white py-3 px-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200 placeholder-gray-400 w-full"
              placeholder="Enter your address"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className={`w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl py-3 transition-all duration-200 shadow-md hover:shadow-lg ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Registering..." : "Sign Up"}
          </button>
        </form>
        <div className="mt-6">
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-gray-700 hover:bg-gray-600 transition duration-300 shadow-md text-white rounded-xl py-3 flex items-center justify-center gap-2"
          >
            Sign up with Google
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.344-7.574 7.439-7.574c2.327 0 3.925.994 4.817 1.852l3.283-3.164C18.189 1.954 15.575 0 12.24 0 5.58 0 .01 5.588.01 12.248c0 6.66 5.57 12.248 12.23 12.248 7.038 0 11.74-4.942 11.74-12.248 0-.815-.073-1.615-.22-2.39h-11.52z"
              />
            </svg>
          </button>
        </div>
        <p className="mt-4 text-sm text-gray-400 text-center">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-purple-400 hover:text-purple-300 font-medium"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
