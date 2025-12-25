import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Note: logout is handled by Clerk UI (UserButton / SignOutButton) so we rely on Clerk components for sign-out behavior.

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
              {/* Clerk's UserButton provides profile UI and sign-out */}
              <UserButton afterSignOutUrl="/login" />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="hover:underline">Login</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded transition">
                  Register
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
