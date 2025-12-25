import React from "react";
import { SignIn } from "@clerk/clerk-react";
import { Candy } from "lucide-react";

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl mb-4 shadow-lg shadow-rose-200">
              <Candy className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-500 mt-2">
              Sign in to continue to Sweet Shop
            </p>
          </div>

          <SignIn
            path="/login"
            routing="path"
            signUpUrl="/register"
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

export default LoginPage;
