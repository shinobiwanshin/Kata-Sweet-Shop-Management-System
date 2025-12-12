import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  User,
  ArrowLeft,
  ShoppingBag,
  DollarSign,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchPurchases();
  }, [user, navigate]);

  const fetchPurchases = async () => {
    setRefreshing(true);
    try {
      const response = await api.get("/purchases/my");
      setPurchases(response.data);
    } catch (error) {
      console.error("Error fetching purchases", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const totalSpent = purchases.reduce((sum, p) => sum + p.totalPrice, 0);
  const totalItems = purchases.reduce((sum, p) => sum + p.quantity, 0);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <p className="text-xs text-gray-500">
                View your account and purchase history
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="mb-8 border-gray-100 shadow-sm">
            <CardHeader className="bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {user.email?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {user.email}
                    </h2>
                    <p className="text-gray-600">{user.role}</p>
                  </div>
                </div>
                <Badge
                  variant={user.role === "ADMIN" ? "default" : "secondary"}
                  className={
                    user.role === "ADMIN"
                      ? "bg-gradient-to-r from-purple-500 to-pink-600"
                      : ""
                  }
                >
                  {user.role}
                </Badge>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-gray-100 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Total Purchases
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {purchases.length}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
                    <ShoppingBag className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-gray-100 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                    <p className="text-3xl font-bold text-gray-900">
                      ${totalSpent.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-gray-100 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Items Purchased
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {totalItems}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl">
                    <ShoppingBag className="w-6 h-6 text-pink-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Purchase History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Purchase History
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchPurchases}
                  disabled={refreshing}
                  className="gap-2"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">Loading...</div>
              ) : purchases.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No purchases yet</p>
                  <Link to="/">
                    <Button className="mt-4 bg-gradient-to-r from-purple-500 to-pink-600">
                      Start Shopping
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {purchases.map((purchase) => (
                    <motion.div
                      key={purchase.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {purchase.sweetName}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Quantity: {purchase.quantity} × $
                          {purchase.pricePerUnit.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(purchase.createdDate).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-purple-600">
                          ${purchase.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
