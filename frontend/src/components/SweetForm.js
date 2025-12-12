import React, { useState, useEffect } from "react";
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
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Save, X } from "lucide-react";

export default function SweetForm({
  sweet,
  open,
  onClose,
  onSave,
  isProcessing,
}) {
  const [formData, setFormData] = useState({
    name: "",
    category: "chocolate",
    price: "",
    quantity: "",
    description: "",
    image_url: "",
    imageFile: null,
  });

  useEffect(() => {
    if (sweet) {
      setFormData({
        name: sweet.name || "",
        category: sweet.category || "chocolate",
        price: sweet.price?.toString() || "",
        quantity: sweet.quantity?.toString() || "",
        description: sweet.description || "",
        image_url: sweet.imageUrl || "",
        imageFile: null,
      });
    } else {
      setFormData({
        name: "",
        category: "chocolate",
        price: "",
        quantity: "",
        description: "",
        image_url: "",
        imageFile: null,
      });
    }
  }, [sweet, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
      // imageUrl is handled by backend if imageFile is present
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {sweet ? "Edit Sweet" : "Add New Sweet"}
          </DialogTitle>
          <DialogDescription>
            {sweet
              ? "Update the sweet details below"
              : "Fill in the details to add a new sweet to your shop"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Milk Chocolate Bar"
                className="border-gray-200 focus:border-rose-300 focus:ring-rose-200"
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger className="border-gray-200 focus:border-rose-300 focus:ring-rose-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chocolate">Chocolate</SelectItem>
                  <SelectItem value="candy">Candy</SelectItem>
                  <SelectItem value="gummy">Gummy</SelectItem>
                  <SelectItem value="lollipop">Lollipop</SelectItem>
                  <SelectItem value="caramel">Caramel</SelectItem>
                  <SelectItem value="mint">Mint</SelectItem>
                  <SelectItem value="licorice">Licorice</SelectItem>
                  <SelectItem value="sour">Sour</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="0.00"
                className="border-gray-200 focus:border-rose-300 focus:ring-rose-200"
              />
            </div>

            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                required
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                placeholder="0"
                className="border-gray-200 focus:border-rose-300 focus:ring-rose-200"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe this sweet..."
              rows={3}
              className="border-gray-200 focus:border-rose-300 focus:ring-rose-200"
            />
          </div>

          <div>
            <Label htmlFor="image">Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFormData({ ...formData, imageFile: e.target.files[0] })
              }
              className="border-gray-200 focus:border-rose-300 focus:ring-rose-200"
            />
            {formData.image_url && !formData.imageFile && (
              <p className="text-xs text-gray-500 mt-1">
                Current image: {formData.image_url}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose(false)}
              disabled={isProcessing}
              className="border-gray-200"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isProcessing}
              className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isProcessing
                ? "Saving..."
                : sweet
                ? "Update Sweet"
                : "Add Sweet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
