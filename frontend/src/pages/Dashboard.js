import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import SweetCard from "../components/SweetCard";
import SearchFilters from "../components/SearchFilters";

const Dashboard = () => {
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Search & Filter state
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    maxPrice: "all",
  });

  // Admin state
  const [sweetForm, setSweetForm] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
    description: "",
    imageUrl: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

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
      fetchSweets();
      alert("Purchase successful!");
    } catch (error) {
      alert(
        "Purchase failed: " + (error.response?.data?.message || error.message)
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/sweets/${editId}`, sweetForm);
        alert("Sweet updated successfully");
      } else {
        await api.post("/sweets", sweetForm);
        alert("Sweet added successfully");
      }
      resetForm();
      fetchSweets();
    } catch (error) {
      alert("Failed to save sweet");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this sweet?")) {
      try {
        await api.delete(`/sweets/${id}`);
        fetchSweets();
      } catch (error) {
        alert("Failed to delete sweet");
      }
    }
  };

  const handleEdit = (sweet) => {
    setSweetForm({
      name: sweet.name,
      category: sweet.category,
      price: sweet.price,
      quantity: sweet.quantity,
      description: sweet.description || "",
      imageUrl: sweet.imageUrl || "",
    });
    setEditId(sweet.id);
    setIsEditing(true);
    setShowForm(true);
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

  const resetForm = () => {
    setSweetForm({
      name: "",
      category: "",
      price: "",
      quantity: "",
      description: "",
      imageUrl: "",
    });
    setIsEditing(false);
    setEditId(null);
    setShowForm(false);
  };

  const filteredSweets = sweets.filter((sweet) => {
    const matchesSearch = sweet.name
      .toLowerCase()
      .includes(filters.search.toLowerCase());
    const matchesCategory =
      filters.category === "all" ||
      sweet.category.toLowerCase() === filters.category.toLowerCase();
    const matchesPrice =
      filters.maxPrice === "all" || sweet.price <= parseFloat(filters.maxPrice);

    return matchesSearch && matchesCategory && matchesPrice;
  });

  const categories = ["All", ...new Set(sweets.map((s) => s.category))];

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Available Sweets</h1>

        <div className="flex gap-4 w-full md:w-auto">
          {/* Search filters moved below title */}
        </div>

        {user?.role === "ADMIN" && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 whitespace-nowrap"
          >
            {showForm ? "Close Form" : "Add New Sweet"}
          </button>
        )}
      </div>

      <SearchFilters filters={filters} onFilterChange={setFilters} />

      {showForm && (
        <div className="bg-white p-6 rounded shadow-md mb-8 border-l-4 border-blue-600">
          <h2 className="text-xl font-bold mb-4">
            {isEditing ? "Edit Sweet" : "Add New Sweet"}
          </h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <input
              placeholder="Name"
              className="border p-2 rounded"
              value={sweetForm.name}
              onChange={(e) =>
                setSweetForm({ ...sweetForm, name: e.target.value })
              }
              required
            />
            <input
              placeholder="Category"
              className="border p-2 rounded"
              value={sweetForm.category}
              onChange={(e) =>
                setSweetForm({ ...sweetForm, category: e.target.value })
              }
              required
            />
            <input
              type="number"
              placeholder="Price"
              className="border p-2 rounded"
              value={sweetForm.price}
              onChange={(e) =>
                setSweetForm({ ...sweetForm, price: e.target.value })
              }
              required
            />
            <input
              type="number"
              placeholder="Quantity"
              className="border p-2 rounded"
              value={sweetForm.quantity}
              onChange={(e) =>
                setSweetForm({ ...sweetForm, quantity: e.target.value })
              }
              required
            />
            <textarea
              placeholder="Description"
              className="border p-2 rounded md:col-span-2"
              value={sweetForm.description}
              onChange={(e) =>
                setSweetForm({ ...sweetForm, description: e.target.value })
              }
            />
            <input
              placeholder="Image URL"
              className="border p-2 rounded md:col-span-2"
              value={sweetForm.imageUrl}
              onChange={(e) =>
                setSweetForm({ ...sweetForm, imageUrl: e.target.value })
              }
            />
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex-1"
              >
                {isEditing ? "Update Sweet" : "Save Sweet"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredSweets.map((sweet) => (
          <SweetCard
            key={sweet.id}
            sweet={sweet}
            onPurchase={handlePurchase}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isAdmin={user?.role === "ADMIN"}
          />
        ))}
        {filteredSweets.length === 0 && (
          <div className="col-span-full text-center text-gray-500 mt-10">
            No sweets found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
