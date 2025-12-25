import React, { useState } from "react";
import { SignUp } from "@clerk/clerk-react";
import { Candy } from "lucide-react";

const RegisterPage = () => {
  // If the dev register flag is set, render a simple form to support existing e2e tests.
  const enableDevRegister =
    process.env.REACT_APP_ENABLE_DEV_REGISTER === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Registration failed");
      }
      // Redirect to login
      window.location.href = "/login";
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (enableDevRegister) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex p-3 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl mb-4 shadow-lg shadow-rose-200">
                <Candy className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                Create Account
              </h2>
              <p className="text-gray-500 mt-2">
                Join Sweet Shop today (dev mode)
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 px-3 py-2"
                />
              </div>

              {error && <div className="text-red-600">{error}</div>}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex justify-center rounded-md bg-rose-500 px-4 py-2 text-white hover:bg-rose-600"
                >
                  {loading ? "Creating..." : "Create account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl mb-4 shadow-lg shadow-rose-200">
              <Candy className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="text-gray-500 mt-2">Join Sweet Shop today</p>
          </div>

          <SignUp
            path="/register"
            routing="path"
            signInUrl="/login"
            redirectUrl="/"
            appearance={{
              elements: {
                formButtonPrimary:
                  "bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700",
                card: "shadow-none border-none bg-transparent",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton:
                  "border-gray-200 hover:border-rose-300",
                formFieldInput:
                  "border-gray-200 focus:border-rose-500 focus:ring-rose-500 bg-gray-50 focus:bg-white",
                footerActionLink: "text-rose-600 hover:text-rose-700",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
