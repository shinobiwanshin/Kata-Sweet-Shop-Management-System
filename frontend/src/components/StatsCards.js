import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Package, DollarSign, ShoppingCart, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function StatsCards({ sweets, purchases = [] }) {
  const totalSweets = sweets.length;
  const totalValue = sweets.reduce((sum, s) => sum + s.price * s.quantity, 0);
  const totalPurchases = purchases.length;
  const revenue = purchases.reduce((sum, p) => sum + p.totalPrice, 0);
  const lowStock = sweets.filter(
    (s) => s.quantity < 10 && s.quantity > 0
  ).length;
  const outOfStock = sweets.filter((s) => s.quantity === 0).length;

  const stats = [
    {
      title: "Total Sweets",
      value: totalSweets,
      icon: Package,
      gradient: "from-rose-500 to-pink-600",
      bgGradient: "from-rose-50 to-pink-50",
    },
    {
      title: "Inventory Value",
      value: `$${totalValue.toFixed(2)}`,
      icon: DollarSign,
      gradient: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-50",
    },
    {
      title: "Total Sales",
      value: totalPurchases,
      subValue: `$${revenue.toFixed(2)} revenue`,
      icon: ShoppingCart,
      gradient: "from-purple-500 to-indigo-600",
      bgGradient: "from-purple-50 to-indigo-50",
    },
    {
      title: "Stock Alerts",
      value: lowStock + outOfStock,
      subValue: `${outOfStock} out of stock`,
      icon: AlertTriangle,
      gradient: "from-amber-500 to-orange-600",
      bgGradient: "from-amber-50 to-orange-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="overflow-hidden border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className={`pb-3 bg-gradient-to-br ${stat.bgGradient}`}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div
                  className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}
                >
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-gray-900">
                {stat.value}
              </div>
              {stat.subValue && (
                <p className="text-xs text-gray-500 mt-1">{stat.subValue}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
