import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: "", password: "" });
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
        "http://localhost:5005/api/auth/login",
        {
          email: formData.email,
          password: formData.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err.response?.data);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Login failed. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5005/auth/google";
  };

  return (
    <div className="fixed inset-0 min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-600 via-green-800/50 to-black overflow-hidden">
      <div className="bg-gray-900/80 border border-green-600 shadow-xl rounded-2xl p-8 backdrop-blur-lg w-full max-w-md">
        <h1 className="text-3xl font-semibold text-white mb-6 text-center">
          Login
        </h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-300 uppercase tracking-wide"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="border border-gray-600 rounded-xl bg-gray-700/50 text-white py-3 px-4 focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm transition-all duration-200 placeholder-gray-400 w-full"
              disabled={loading}
              required
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
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="border border-gray-600 rounded-xl bg-gray-700/50 text-white py-3 px-4 focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm transition-all duration-200 placeholder-gray-400 w-full"
              disabled={loading}
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white rounded-xl py-3 transition-all duration-200 shadow-md hover:shadow-lg ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-gray-700 hover:bg-gray-600 transition duration-300 shadow-md text-white rounded-xl py-3 flex items-center justify-center gap-2"
          >
            Login with Google
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.344-7.574 7.439-7.574c2.327 0 3.925.994 4.817 1.852l3.283-3.164C18.189 1.954 15.575 0 12.24 0 5.58 0 .01 5.588.01 12.248c0 6.66 5.57 12.248 12.23 12.248 7.038 0 11.74-4.942 11.74-12.248 0-.815-.073-1.615-.22-2.39h-11.52z"
              />
            </svg>
          </button>
        </div>
        <p className="mt-4 text-sm text-gray-400 text-center">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-green-400 hover:text-green-300 font-medium"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
