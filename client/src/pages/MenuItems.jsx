import React, { useState } from "react";
import { Search, ArrowLeft, ShoppingBag, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";


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
    img: "https://images.unsplash.com/photo-1606331329602-0351ad831027?auto=format&fit=crop&q=80&w=300",
    tag: "Veg",
  },
];

const MenuItems = () => {
  const [activeFilter, setActiveFilter] = useState("All");
 const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex items-center justify-between bg-white">
        <button className="p-2 bg-gray-50 rounded-xl hover:bg-red-300 transition-colors" onClick={() => navigate(-1) || navigate("/")}>
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Starters</h1>
        <button className="p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
          <Search size={20} className="text-gray-700" />
        </button>
      </header>

      {/* Filter Tabs */}
      <div className="flex gap-3 px-6 py-4 overflow-x-auto no-scrollbar">
        {["All", "Veg", "Non-Veg"].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeFilter === filter
                ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="px-6 mt-4 space-y-6">
        {foodItems
          .filter((item) => activeFilter === "All" || item.tag === activeFilter)
          .map((item) => (
            <div key={item.id} className="flex gap-4 group">
              {/* Item Image */}
              <div className="relative w-24 h-24 shrink-0">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
                <div
                  className={`absolute top-2 left-2 w-3 h-3 border-2 rounded-sm ${item.tag === "Veg" ? "border-green-500" : "border-red-500"} flex items-center justify-center bg-white`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${item.tag === "Veg" ? "bg-green-500" : "bg-red-500"}`}
                  ></div>
                </div>
              </div>

              {/* Item Details */}
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <h3 className="font-bold text-gray-800 text-base">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
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
          ))}
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
