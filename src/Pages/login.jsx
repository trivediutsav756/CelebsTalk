import { useState } from "react";
import axios from "axios";
import header from "../assets/header.png";
import { useAppContext } from "../Central_Store/app_context";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { baseUrl } = useAppContext();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.email.trim()) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(form.email)) return "Enter a valid email";
    if (!form.password.trim()) return "Password is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errorMsg = validate();

    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    setError("");
    setLoading(true);

    try {
        setLoading(true);

        const response = await axios.post(`${baseUrl}/login/`, form);

        const data = response.data; // ✅ correct for axios

        const validData = data.data;
        console.log(validData);
        // Successful login
        if (validData?.email === form.email) {
            localStorage.setItem("isAuth", "true");
            window.location.href = "/dashboard";
            setForm({ email: "", password: "" });
        } else {
            setError("Invalid email or password");
        }

    } catch (err) {
        setError(err.response?.data?.message || err.message || "Unable to login");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-10">

        {/* Illustration */}
        <img
          src={header}
          alt="illustration"
          className="w-60 mx-auto drop-shadow-lg"
        />

        <h2 className="text-2xl font-semibold mt-3 text-center">Welcome</h2>
        <p className="text-gray-500 text-center">Login to your admin account</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          
          {/* Error Message */}
          {error && (
            <div className="bg-[#ffe6f0] text-[#940aea] p-2 rounded text-sm text-center">
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              className="w-full border px-4 py-2 rounded-lg"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="******"
              className="w-full border px-4 py-2 rounded-lg"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#ff237c] text-white py-2 rounded-lg transition ${
              loading ? "opacity-60 cursor-not-allowed" : "hover:bg-[#ea028b]"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

      </div>
    </div>

  );
}
