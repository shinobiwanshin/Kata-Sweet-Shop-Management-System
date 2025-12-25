import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SweetCard from "./SweetCard";

describe("SweetCard Component", () => {
  const mockSweet = {
    id: 1,
    name: "Chocolate Bar",
    description: "Delicious dark chocolate",
    price: 5.0,
    quantity: 10,
    imageUrl: "http://example.com/image.jpg",
    category: "chocolate",
  };

  const mockOnPurchase = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnRestock = jest.fn();

  test("renders sweet details correctly", () => {
    render(
      <SweetCard
        sweet={mockSweet}
        onPurchase={mockOnPurchase}
        isAdmin={false}
      />
    );

    expect(screen.getByText("Chocolate Bar")).toBeInTheDocument();
    expect(screen.getByText("Delicious dark chocolate")).toBeInTheDocument();
    expect(screen.getByText("$5.00")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("chocolate")).toBeInTheDocument();
  });

  test("calls onPurchase when purchase button is clicked", () => {
    render(
      <SweetCard
        sweet={mockSweet}
        onPurchase={mockOnPurchase}
        isAdmin={false}
      />
    );

    const purchaseButton = screen.getByRole("button", { name: /purchase/i });
    fireEvent.click(purchaseButton);

    expect(mockOnPurchase).toHaveBeenCalledWith(mockSweet);
  });

  test("renders admin buttons when isAdmin is true", () => {
    render(
      <SweetCard
        sweet={mockSweet}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onRestock={mockOnRestock}
        isAdmin={true}
      />
    );

    expect(
      screen.getByRole("button", { name: /restock/i })
    ).toBeInTheDocument();
    expect(screen.getByTitle("Edit")).toBeInTheDocument();
    expect(screen.getByTitle("Delete")).toBeInTheDocument();
  });

  test("calls admin actions correctly", () => {
    render(
      <SweetCard
        sweet={mockSweet}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onRestock={mockOnRestock}
        isAdmin={true}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /restock/i }));
    expect(mockOnRestock).toHaveBeenCalledWith(mockSweet.id);

    fireEvent.click(screen.getByTitle("Edit"));
    expect(mockOnEdit).toHaveBeenCalledWith(mockSweet);

    fireEvent.click(screen.getByTitle("Delete"));
    expect(mockOnDelete).toHaveBeenCalledWith(mockSweet.id);
  });

  test("disables purchase button when out of stock", () => {
    const outOfStockSweet = { ...mockSweet, quantity: 0 };
    render(
      <SweetCard
        sweet={outOfStockSweet}
        onPurchase={mockOnPurchase}
        isAdmin={false}
      />
    );

    const purchaseButton = screen.getByRole("button", { name: /purchase/i });
    expect(purchaseButton).toBeDisabled();
    expect(screen.getByText("Out of Stock")).toBeInTheDocument();
  });
});
