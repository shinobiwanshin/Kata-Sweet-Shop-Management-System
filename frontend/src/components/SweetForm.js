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
import { Save, X, Search, Image as ImageIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function SweetForm({
  sweet,
  open,
  onClose,
  onSave,
  isProcessing,
}) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    category: "chocolate",
    price: "",
    quantity: "",
    description: "",
    image_url: "",
    imageFile: null,
  });

  const [showImageSearch, setShowImageSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
      setSearchQuery(sweet.name || "");
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
      setSearchQuery("");
    }
  }, [sweet, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
      imageUrl: formData.image_url, // Map image_url to imageUrl for consistency
    });
  };

  const handleSearchImages = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Get the token from localStorage or context if available
      // Assuming basic auth or bearer token needs to be passed if the endpoint is protected
      // The current backend setup uses Basic Auth or Bearer, let's try with the fetch wrapper or direct fetch
      // Since we don't have a configured API client in this file, we'll use fetch with the token

      const token = localStorage.getItem("token"); // Assuming token is stored here
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      } else if (user && user.token) {
         headers["Authorization"] = `Bearer ${user.token}`;
      }

      const response = await fetch(`/api/images/search?query=${encodeURIComponent(searchQuery)}`, {
        headers: headers
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      } else {
        console.error("Failed to fetch images");
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching images:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectImage = (url) => {
    setFormData({ ...formData, image_url: url, imageFile: null });
    setShowImageSearch(false);
  };

  return (
    <>
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
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (!sweet) setSearchQuery(e.target.value);
                  }}
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
              <div className="flex gap-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({ ...formData, imageFile: e.target.files[0], image_url: "" })
                  }
                  className="border-gray-200 focus:border-rose-300 focus:ring-rose-200 flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSearchQuery(formData.name);
                    setShowImageSearch(true);
                    if (formData.name && searchResults.length === 0) {
                        // Optionally auto-search when opening if name exists
                    }
                  }}
                  title="Find image online"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              {(formData.image_url) && !formData.imageFile && (
                <div className="mt-2 flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                  <ImageIcon className="w-4 h-4 text-gray-500" />
                  <p className="text-xs text-gray-500 truncate max-w-[300px]">
                    Selected: {formData.image_url}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 ml-auto"
                    onClick={() => setFormData({...formData, image_url: ""})}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
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

      {/* Image Search Dialog */}
      <Dialog open={showImageSearch} onOpenChange={setShowImageSearch}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Search Images</DialogTitle>
            <DialogDescription>
              Find an image for your sweet from Unsplash
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 mb-4">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for sweets..."
              onKeyDown={(e) => e.key === 'Enter' && handleSearchImages()}
            />
            <Button onClick={handleSearchImages} disabled={isSearching}>
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto p-1">
            {searchResults.map((url) => (
              <div
                key={url}
                className="cursor-pointer group relative aspect-square rounded-md overflow-hidden border hover:ring-2 hover:ring-rose-500"
                onClick={() => selectImage(url)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectImage(url);
                  }
                }}
              >
                <img
                  src={url}
                  alt="Result"
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
              </div>
            ))}
            {searchResults.length === 0 && !isSearching && (
              <div className="col-span-full text-center py-8 text-gray-500">
                No images found. Try a different search term.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
