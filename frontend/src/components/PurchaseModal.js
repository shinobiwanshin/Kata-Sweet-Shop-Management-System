import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";

export default function PurchaseModal({
  sweet,
  open,
  onClose,
  onConfirm,
  isProcessing,
}) {
  const [quantity, setQuantity] = useState(1);

  if (!sweet) return null;

  const totalPrice = (sweet.price * quantity).toFixed(2);
  const maxQuantity = sweet.quantity;

  const handleQuantityChange = (value) => {
    const num = parseInt(value) || 1;
    setQuantity(Math.max(1, Math.min(num, maxQuantity)));
  };

  const increment = () => {
    if (quantity < maxQuantity) setQuantity(quantity + 1);
  };

  const decrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleConfirm = () => {
    onConfirm(quantity);
    setQuantity(1);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShoppingCart className="w-5 h-5 text-rose-600" />
            Purchase Sweet
          </DialogTitle>
          <DialogDescription>Complete your purchase below</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-gradient-to-br from-rose-50 to-amber-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 text-lg">
              {sweet.name}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{sweet.category}</p>
            <p className="text-2xl font-bold text-rose-600 mt-2">
              ${sweet.price.toFixed(2)}{" "}
              <span className="text-sm text-gray-500">per unit</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Available: {sweet.quantity} units
            </p>
          </div>

          <div>
            <Label
              htmlFor="quantity"
              className="text-sm font-medium mb-2 block"
            >
              Quantity
            </Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={decrement}
                disabled={quantity <= 1}
                className="h-10 w-10 border-rose-200 hover:bg-rose-50"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={maxQuantity}
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="text-center text-lg font-semibold h-10 border-gray-200"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={increment}
                disabled={quantity >= maxQuantity}
                className="h-10 w-10 border-rose-200 hover:bg-rose-50"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Price:</span>
              <motion.span
                key={totalPrice}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-rose-600"
              >
                ${totalPrice}
              </motion.span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onClose(false)}
            disabled={isProcessing}
            className="border-gray-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
          >
            {isProcessing ? "Processing..." : "Confirm Purchase"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
