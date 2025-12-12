import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders Sweet Shop header", () => {
  render(<App />);
  const headerElement = screen.getByText(/Sweet Shop/i);
  expect(headerElement).toBeInTheDocument();
});
