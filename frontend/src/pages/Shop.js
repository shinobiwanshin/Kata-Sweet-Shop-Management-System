import React, { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Candy, User, LogOut, Package } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import SweetCard from "../components/SweetCard";
import SearchFilters from "../components/SearchFilters";
import PurchaseModal from "../components/PurchaseModal";

export default function Shop() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    maxPrice: "all",
  });
  const [selectedSweet, setSelectedSweet] = useState(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

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

  // Memoized to prevent re-renders of SweetCard when other state (like filters) changes
  const handlePurchaseClick = useCallback(
    (id) => {
      if (!user) {
        navigate("/login");
        return;
      }
      const sweet = sweets.find((s) => s.id === id);
      if (sweet) {
        setSelectedSweet(sweet);
        setIsPurchaseModalOpen(true);
      }
    },
    [user, navigate, sweets]
  );

  const handleConfirmPurchase = async (quantity) => {
    if (!selectedSweet || !user) return;

    setIsPurchasing(true);
    try {
      // Send single request with quantity
      await api.post(`/sweets/${selectedSweet.id}/purchase`, quantity, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      fetchSweets();
      setIsPurchaseModalOpen(false);
      Swal.fire({
        icon: "success",
        title: "Purchase Successful!",
        text: `Successfully purchased ${quantity} ${selectedSweet.name}!`,
        timer: 2000,
        showConfirmButton: false,
      });
      setSelectedSweet(null);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Purchase Failed",
        text: error.response?.data?.message || error.message,
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
                <p className="text-xs text-gray-500">Premium Confections</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  {user.role === "ADMIN" && (
                    <Link to="/admin">
                      <Button
                        variant="outline"
                        className="border-rose-200 hover:bg-rose-50"
                      >
                        Admin Dashboard
                      </Button>
                    </Link>
                  )}
                  <Link to="/profile">
                    <Button
                      variant="ghost"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
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
                </>
              ) : (
                <Link to="/login">
                  <Button className="bg-rose-500 hover:bg-rose-600 text-white">
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Indulge Your Sweet Tooth
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our carefully curated selection of premium sweets and
            confections
          </p>
        </motion.div>

        {/* Filters */}
        <div className="mb-8">
          <SearchFilters filters={filters} onFilterChange={setFilters} />
        </div>

        {/* Sweet Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-96 bg-gray-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : filteredSweets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No sweets found
            </h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredSweets.map((sweet) => (
                <SweetCard
                  key={sweet.id}
                  sweet={sweet}
                  onPurchase={handlePurchaseClick}
                  isAdmin={false} // Shop view is for customers
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Purchase Modal */}
      <PurchaseModal
        sweet={selectedSweet}
        open={isPurchaseModalOpen}
        onClose={setIsPurchaseModalOpen}
        onConfirm={handleConfirmPurchase}
        isProcessing={isPurchasing}
      />
    </div>
  );
}
