import { useNavigate } from "react-router-dom";
import Logo from "../assets/header.png";

export default function Topbar({ onMenuClick }) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("isAuth");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("admin");
    navigate("/");
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          type="button"
          className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
          aria-label="Open sidebar"
          onClick={onMenuClick}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>

        <img src={Logo} alt="Logo" className="h-12 w-auto" />
        {/* <span className="font-semibold text-2xl text-orange-500">Only Meter</span> */}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleLogout}
          className="text-sm px-3 py-2 rounded-md bg-[#ff237c] text-white hover:bg-[#ea028b] cursor-pointer"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
