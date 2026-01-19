import { useState } from "react";
import axios from "axios";
import header from "../assets/header.png";
import { useAppContext } from "../Central_Store/app_context";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { baseUrl } = useAppContext();

  const api = axios.create({
    baseURL: baseUrl,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    // withCredentials: true, // only if backend uses cookies/session
  });

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
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
    if (errorMsg) return setError(errorMsg);

    setError("");
    setLoading(true);

    try {
      // IMPORTANT: confirm your real endpoint path on backend
      // Your console shows /login/ but your code uses /admin_login/
      const res = await api.post("/admin_login/", form);

      const payload = res.data || {};
      const access =
        payload.access_token || payload.access || payload.token || payload?.data?.access;
      const refresh =
        payload.refresh_token || payload.refresh || payload?.data?.refresh;

      // optionally user/admin object
      const admin =
        payload.admin || payload.user || payload.data?.admin || payload.data?.user || null;

      if (!access) {
        throw new Error(payload.message || "Login failed: token not received");
      }

      localStorage.setItem("access_token", access);
      if (refresh) localStorage.setItem("refresh_token", refresh);
      if (admin) localStorage.setItem("admin", JSON.stringify(admin));
      localStorage.setItem("isAuth", "true");

      window.location.assign("/dashboard");
    } catch (err) {
      // show backend message if present
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        "Unable to login";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-10">
        <img src={header} alt="illustration" className="w-60 mx-auto drop-shadow-lg" />
        <h2 className="text-2xl font-semibold mt-3 text-center">Welcome</h2>
        <p className="text-gray-500 text-center">Login to your admin account</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-[#ffe6f0] text-[#940aea] p-2 rounded text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              className="w-full border px-4 py-2 rounded-lg"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="******"
              className="w-full border px-4 py-2 rounded-lg"
              autoComplete="current-password"
            />
          </div>

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