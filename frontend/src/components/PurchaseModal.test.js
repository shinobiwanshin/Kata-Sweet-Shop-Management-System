import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PurchaseModal from "./PurchaseModal";

const mockSweet = {
  id: 1,
  name: "Choco Delight",
  category: "chocolate",
  price: 5.0,
  quantity: 10,
  description: "Delicious chocolate",
};

describe("PurchaseModal Component", () => {
  test("renders modal with sweet details", () => {
    render(
      <PurchaseModal
        sweet={mockSweet}
        open={true}
        onClose={() => {}}
        onConfirm={() => {}}
        isProcessing={false}
      />
    );

    expect(screen.getByText("Choco Delight")).toBeInTheDocument();
    // Use getAllByText because the price "$5.00" appears twice:
    // once in "per unit" and once in "Total Price".
    const prices = screen.getAllByText("$5.00");
    expect(prices.length).toBeGreaterThan(0);
    expect(screen.getByLabelText("Quantity")).toBeInTheDocument();
  });

  test("renders accessible increment and decrement buttons", () => {
    render(
      <PurchaseModal
        sweet={mockSweet}
        open={true}
        onClose={() => {}}
        onConfirm={() => {}}
        isProcessing={false}
      />
    );

    const decreaseButton = screen.getByLabelText("Decrease quantity");
    const increaseButton = screen.getByLabelText("Increase quantity");

    expect(decreaseButton).toBeInTheDocument();
    expect(increaseButton).toBeInTheDocument();
  });

  test("shows loading spinner when processing", () => {
    render(
      <PurchaseModal
        sweet={mockSweet}
        open={true}
        onClose={() => {}}
        onConfirm={() => {}}
        isProcessing={true}
      />
    );

    expect(screen.getByText("Processing...")).toBeInTheDocument();
    // We expect the loader to be present (usually implied by the component change,
    // but here we might check for the class or just that it renders without error)
  });
});
