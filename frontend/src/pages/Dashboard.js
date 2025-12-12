import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Admin state
  const [newSweet, setNewSweet] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
  });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchSweets();
  }, []);

  const fetchSweets = async () => {
    try {
      const response = await api.get("/sweets");
      setSweets(response.data);
    } catch (error) {
      console.error("Error fetching sweets", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (id) => {
    try {
      await api.post(`/sweets/${id}/purchase`);
      fetchSweets(); // Refresh list
      alert("Purchase successful!");
    } catch (error) {
      alert(
        "Purchase failed: " + (error.response?.data?.message || error.message)
      );
    }
  };

  const handleAddSweet = async (e) => {
    e.preventDefault();
    try {
      await api.post("/sweets", newSweet);
      setNewSweet({ name: "", category: "", price: "", quantity: "" });
      setIsAdding(false);
      fetchSweets();
    } catch (error) {
      alert("Failed to add sweet");
    }
  };

  const handleRestock = async (id) => {
    const quantity = prompt("Enter quantity to restock:");
    if (quantity && !isNaN(quantity)) {
      try {
        await api.post(`/sweets/${id}/restock`, parseInt(quantity));
        fetchSweets();
      } catch (error) {
        alert("Restock failed");
      }
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Available Sweets</h1>
        {user?.role === "ADMIN" && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {isAdding ? "Cancel" : "Add New Sweet"}
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4">Add New Sweet</h2>
          <form
            onSubmit={handleAddSweet}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <input
              placeholder="Name"
              className="border p-2 rounded"
              value={newSweet.name}
              onChange={(e) =>
                setNewSweet({ ...newSweet, name: e.target.value })
              }
              required
            />
            <input
              placeholder="Category"
              className="border p-2 rounded"
              value={newSweet.category}
              onChange={(e) =>
                setNewSweet({ ...newSweet, category: e.target.value })
              }
              required
            />
            <input
              type="number"
              placeholder="Price"
              className="border p-2 rounded"
              value={newSweet.price}
              onChange={(e) =>
                setNewSweet({ ...newSweet, price: e.target.value })
              }
              required
            />
            <input
              type="number"
              placeholder="Quantity"
              className="border p-2 rounded"
              value={newSweet.quantity}
              onChange={(e) =>
                setNewSweet({ ...newSweet, quantity: e.target.value })
              }
              required
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 md:col-span-2"
            >
              Save Sweet
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sweets.map((sweet) => (
          <div
            key={sweet.id}
            className="bg-white p-6 rounded shadow-md hover:shadow-lg transition"
          >
            <h3 className="text-xl font-bold mb-2">{sweet.name}</h3>
            <p className="text-gray-600 mb-1">Category: {sweet.category}</p>
            <p className="text-green-600 font-bold mb-1">
              Price: ${sweet.price}
            </p>
            <p
              className={`mb-4 font-semibold ${
                sweet.quantity > 0 ? "text-blue-600" : "text-red-500"
              }`}
            >
              Stock: {sweet.quantity}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => handlePurchase(sweet.id)}
                disabled={sweet.quantity <= 0}
                className={`flex-1 py-2 rounded text-white ${
                  sweet.quantity > 0
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {sweet.quantity > 0 ? "Buy Now" : "Out of Stock"}
              </button>

              {user?.role === "ADMIN" && (
                <button
                  onClick={() => handleRestock(sweet.id)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                >
                  Restock
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
