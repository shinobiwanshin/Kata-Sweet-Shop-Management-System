import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 p-4 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Sweet Shop
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span>Welcome, {user.email}</span>
              {user.role === "ADMIN" && (
                <span className="bg-yellow-500 text-xs px-2 py-1 rounded text-black font-semibold">
                  ADMIN
                </span>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
