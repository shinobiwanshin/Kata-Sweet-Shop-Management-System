import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import LoginPage from "./LoginPage";

// Mock Clerk's SignIn component
jest.mock("@clerk/clerk-react", () => ({
  SignIn: () => <div data-testid="clerk-signin">Clerk SignIn Component</div>,
}));

describe("LoginPage Component", () => {
  test("renders login page with branding", () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    expect(
      screen.getByText("Sign in to continue to Sweet Shop")
    ).toBeInTheDocument();
  });

  test("renders Clerk SignIn component", () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByTestId("clerk-signin")).toBeInTheDocument();
  });
});
