import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import SweetCard from "../components/SweetCard";
import SearchFilters from "../components/SearchFilters";
import SweetForm from "../components/SweetForm";
import StatsCards from "../components/StatsCards";
import { Button } from "../components/ui/button";
import { Candy, LogOut, Store, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const AdminDashboard = () => {
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Search & Filter state
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    maxPrice: "all",
  });

  // Admin state
  const [isEditing, setIsEditing] = useState(false);
  const [editSweet, setEditSweet] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isProcessingForm, setIsProcessingForm] = useState(false);

  useEffect(() => {
    fetchSweets();
    if (user?.role === "ADMIN") {
      fetchPurchases();
    }
  }, [user]);

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

  const [purchases, setPurchases] = useState([]);

  const fetchPurchases = async () => {
    try {
      const response = await api.get("/purchases/all");
      setPurchases(response.data);
    } catch (error) {
      console.error("Error fetching purchases", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleRestock = async (id) => {
    const { value: quantityStr } = await Swal.fire({
      title: "Restock Sweet",
      input: "number",
      inputLabel: "Enter quantity to restock",
      inputPlaceholder: "Quantity",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value || parseInt(value) <= 0) {
          return "You need to enter a valid positive number!";
        }
      },
    });

    if (quantityStr) {
      const quantity = parseInt(quantityStr, 10);
      try {
        await api.post(`/sweets/${id}/restock`, quantity, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        fetchSweets();
        Swal.fire("Restocked!", "Stock has been updated.", "success");
      } catch (error) {
        Swal.fire(
          "Error",
          "Restock failed: " + (error.response?.data?.message || error.message),
          "error"
        );
      }
    }
  };

  const handleSaveSweet = async (formData) => {
    setIsProcessingForm(true);
    try {
      const data = new FormData();
      const { imageFile, ...sweetData } = formData;

      data.append(
        "sweet",
        new Blob([JSON.stringify(sweetData)], { type: "application/json" })
      );

      if (imageFile) {
        data.append("image", imageFile);
      }

      if (isEditing && editSweet) {
        await api.put(`/sweets/${editSweet.id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire("Updated!", "Sweet updated successfully", "success");
      } else {
        await api.post("/sweets", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire("Added!", "Sweet added successfully", "success");
      }
      setShowForm(false);
      setEditSweet(null);
      setIsEditing(false);
      fetchSweets();
    } catch (error) {
      Swal.fire(
        "Error",
        "Failed to save sweet: " +
          (error.response?.data?.message || error.message),
        "error"
      );
    } finally {
      setIsProcessingForm(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/sweets/${id}`);
        fetchSweets();
        Swal.fire("Deleted!", "Sweet has been deleted.", "success");
      } catch (error) {
        Swal.fire("Error", "Failed to delete sweet", "error");
      }
    }
  };

  const handleEdit = (sweet) => {
    setEditSweet(sweet);
    setIsEditing(true);
    setShowForm(true);
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

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl">
                <Candy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  Sweet Shop
                </h1>
                <p className="text-xs text-gray-500">Admin Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/">
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Store className="w-4 h-4 mr-2" />
                  Shop
                </Button>
              </Link>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Overview
            </h1>
            <p className="text-gray-500 mt-1">
              Manage inventory and view statistics
            </p>
          </div>

          {user?.role === "ADMIN" && (
            <Button
              onClick={() => {
                setEditSweet(null);
                setIsEditing(false);
                setShowForm(true);
              }}
              className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Sweet
            </Button>
          )}
        </div>

        {user?.role === "ADMIN" && (
          <div className="mb-8">
            <StatsCards sweets={sweets} purchases={purchases} />
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Inventory Management
            </h2>
            <SearchFilters filters={filters} onFilterChange={setFilters} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSweets.map((sweet) => (
              <SweetCard
                key={sweet.id}
                sweet={sweet}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRestock={handleRestock}
                isAdmin={user?.role === "ADMIN"}
              />
            ))}
            {filteredSweets.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                  <Candy className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  No sweets found
                </h3>
                <p className="text-gray-500 mt-1">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </div>

        <SweetForm
          sweet={editSweet}
          open={showForm}
          onClose={setShowForm}
          onSave={handleSaveSweet}
          isProcessing={isProcessingForm}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
