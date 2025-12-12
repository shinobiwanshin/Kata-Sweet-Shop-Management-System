import React from "react";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { Search, SlidersHorizontal } from "lucide-react";
import { Card } from "./ui/card";

export default function SearchFilters({ filters, onFilterChange }) {
  return (
    <Card className="p-6 bg-white border-gray-100 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal className="w-5 h-5 text-rose-600" />
        <h3 className="text-lg font-semibold text-gray-900">Search & Filter</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="search" className="text-sm text-gray-600 mb-2 block">
            Search by name
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Search sweets..."
              value={filters.search}
              onChange={(e) =>
                onFilterChange({ ...filters, search: e.target.value })
              }
              className="pl-10 border-gray-200 focus:border-rose-300 focus:ring-rose-200"
            />
          </div>
        </div>

        <div>
          <Label
            htmlFor="category"
            className="text-sm text-gray-600 mb-2 block"
          >
            Category
          </Label>
          <Select
            value={filters.category}
            onValueChange={(value) =>
              onFilterChange({ ...filters, category: value })
            }
          >
            <SelectTrigger className="border-gray-200 focus:border-rose-300 focus:ring-rose-200">
              <SelectValue
                placeholder="All Categories"
                value={
                  filters.category === "all"
                    ? "All Categories"
                    : filters.category
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
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
          <Label
            htmlFor="priceRange"
            className="text-sm text-gray-600 mb-2 block"
          >
            Max Price
          </Label>
          <Select
            value={filters.maxPrice}
            onValueChange={(value) =>
              onFilterChange({ ...filters, maxPrice: value })
            }
          >
            <SelectTrigger className="border-gray-200 focus:border-rose-300 focus:ring-rose-200">
              <SelectValue
                placeholder="Any Price"
                value={
                  filters.maxPrice === "all"
                    ? "Any Price"
                    : `Under $${filters.maxPrice}`
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Price</SelectItem>
              <SelectItem value="5">Under $5</SelectItem>
              <SelectItem value="10">Under $10</SelectItem>
              <SelectItem value="20">Under $20</SelectItem>
              <SelectItem value="50">Under $50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
