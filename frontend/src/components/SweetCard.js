import React from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ShoppingCart, Package, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

const categoryColors = {
  chocolate: "bg-amber-100 text-amber-800 border-amber-200",
  candy: "bg-pink-100 text-pink-800 border-pink-200",
  gummy: "bg-purple-100 text-purple-800 border-purple-200",
  lollipop: "bg-rose-100 text-rose-800 border-rose-200",
  caramel: "bg-orange-100 text-orange-800 border-orange-200",
  mint: "bg-emerald-100 text-emerald-800 border-emerald-200",
  licorice: "bg-slate-100 text-slate-800 border-slate-200",
  sour: "bg-lime-100 text-lime-800 border-lime-200",
  other: "bg-gray-100 text-gray-800 border-gray-200",
};

export default function SweetCard({
  sweet,
  onPurchase,
  onEdit,
  onDelete,
  isAdmin,
}) {
  const isOutOfStock = sweet.quantity === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden h-full flex flex-col bg-white hover:shadow-xl transition-shadow duration-300 border border-gray-100">
        <div className="relative h-48 bg-gradient-to-br from-rose-50 to-amber-50 overflow-hidden">
          {sweet.image_url ? (
            <img
              src={sweet.image_url}
              alt={sweet.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-16 h-16 text-rose-300" />
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-sm px-4 py-1">
                Out of Stock
              </Badge>
            </div>
          )}
          <Badge
            className={cn(
              "absolute top-3 right-3 border",
              categoryColors[sweet.category] || categoryColors.other
            )}
          >
            {sweet.category}
          </Badge>
        </div>

        <CardContent className="p-5 flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {sweet.name}
            </h3>
            {sweet.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {sweet.description}
              </p>
            )}

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-rose-600">
                  ${sweet.price.toFixed(2)}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Stock:{" "}
                <span
                  className={cn(
                    "font-semibold",
                    sweet.quantity === 0
                      ? "text-red-600"
                      : sweet.quantity < 10
                      ? "text-amber-600"
                      : "text-emerald-600"
                  )}
                >
                  {sweet.quantity}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {!isAdmin ? (
              <Button
                onClick={() => onPurchase(sweet.id)}
                disabled={isOutOfStock}
                className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Purchase
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => onEdit(sweet)}
                  variant="outline"
                  className="flex-1 border-rose-200 hover:bg-rose-50"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={() => onDelete(sweet.id)}
                  variant="outline"
                  className="border-red-200 hover:bg-red-50 text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
