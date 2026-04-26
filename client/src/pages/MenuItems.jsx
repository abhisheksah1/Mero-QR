import React, { useState } from "react";
import { Search, ArrowLeft, ShoppingBag, Plus, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const foodItems = [
  {
    id: 1,
    name: "Chicken Wings",
    desc: "Crispy chicken wings tossed in spicy BBQ sauce",
    price: 350,
    img: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&q=80&w=300",
    tag: "Non-Veg",
  },
  {
    id: 2,
    name: "Garlic Bread",
    desc: "Toasted bread with garlic butter and herbs",
    price: 250,
    img: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&q=80&w=300",
    tag: "Veg",
  },
  {
    id: 3,
    name: "French Fries",
    desc: "Crispy golden fries served with ketchup",
    price: 220,
    img: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=300",
    tag: "Veg",
  },
  {
    id: 4,
    name: "Veg Spring Rolls",
    desc: "Crispy rolls stuffed with mixed vegetables",
    price: 280,
    img: "https://spicecravings.com/wp-content/uploads/2020/12/Paneer-kathi-Roll-Featured-1-500x375.jpg",
    tag: "Veg",
  },
];

const MenuItems = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [foodType, setFoodType] = useState("all"); // 'all', 'veg', or 'non-veg'
  const navigate = useNavigate();

  // Filter items by search query and food type
  const filteredItems = foodItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      foodType === "all" ||
      (foodType === "veg" && item.tag === "Veg") ||
      (foodType === "non-veg" && item.tag === "Non-Veg");
    return matchesSearch && matchesType;
  });

  const handleSearchToggle = () => {
    setShowSearch((prev) => !prev);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex items-center justify-between bg-white">
        <button
          onClick={() => navigate(-1) || navigate("/")}
          className="p-2 bg-gray-50 rounded-xl hover:bg-red-300 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>

        {/* Title or inline search input */}
        {showSearch ? (
          <div className="flex-1 mx-3 bg-gray-100 rounded-xl flex items-center px-3 gap-2">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="flex-1 bg-transparent text-sm outline-none py-2 text-gray-700 placeholder:text-gray-400"
            />
            {/* Clear input */}
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}>
                <X size={14} className="text-gray-400" />
              </button>
            )}
          </div>
        ) : (
          <h1 className="text-lg font-bold text-gray-800">Starters</h1>
        )}

        {/* Search toggle button */}
        <button
          onClick={handleSearchToggle}
          className="p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
        >
          {showSearch ? (
            <X size={20} className="text-gray-700" />
          ) : (
            <Search size={20} className="text-gray-700" />
          )}
        </button>
      </header>

      {/* Food Type Toggle */}
      <div className="px-6 mb-4">
        <div className="flex items-center justify-center bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setFoodType("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              foodType === "all"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFoodType("veg")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
              foodType === "veg"
                ? "bg-white text-green-600 shadow-sm"
                : "text-gray-500"
            }`}
          >
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            Veg
          </button>
          <button
            onClick={() => setFoodType("non-veg")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
              foodType === "non-veg"
                ? "bg-white text-red-600 shadow-sm"
                : "text-gray-500"
            }`}
          >
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            Non-Veg
          </button>
        </div>
      </div>

      {/* Items List */}
      <div className="px-6 mt-4 space-y-6">
        {filteredItems.length === 0 ? (
          // Empty state when search returns nothing
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Search size={24} className="text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-600">
              No items found
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Try searching with a different keyword
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 text-xs text-orange-500 font-semibold border border-orange-300 px-4 py-1.5 rounded-full"
            >
              Clear search
            </button>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className="flex gap-4 group">
              {/* Item image with veg/non-veg indicator */}
              <Link to='/item' className="relative w-24 h-24 shrink-0">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
                {/* Veg / non-veg dot badge */}
                <div
                  className={`absolute top-2 left-2 w-3 h-3 border-2 rounded-sm flex items-center justify-center bg-white ${
                    item.tag === "Veg" ? "border-green-500" : "border-red-500"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.tag === "Veg" ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                </div>
              </Link>

              {/* Item details */}
              <div className="flex-1 flex flex-col justify-between py-1">
                <Link to='/item'>
                  <h3 className="font-bold text-gray-800 text-base">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </Link>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-gray-900">
                    Rs. {item.price}
                  </span>
                  <button className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded-lg shadow-md transition-transform active:scale-90">
                    <Plus size={18} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating View Cart Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-linear-to-t from-white via-white to-transparent">
        <button className="w-full bg-orange-500 py-4 rounded-2xl flex items-center justify-between px-6 shadow-xl shadow-orange-200 active:scale-95 transition-transform">
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} className="text-white" />
            <span className="text-white font-bold">View Cart</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/80 text-xs">3 Items</span>
            <span className="bg-white text-orange-500 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
              3
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default MenuItems;
