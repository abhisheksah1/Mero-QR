import React, { useState } from "react";
import {
  Search,
  ChevronRight,
  ShoppingBag,
  Menu as MenuIcon,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import PageTransition from "../components/PageTransition";
import Sidebar from "../components/homepage/SideBar";

const categories = [
  {
    id: 1,
    name: "Starters",
    count: 12,
    img: "https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: 2,
    name: "Main Course",
    count: 18,
    img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: 3,
    name: "Burgers",
    count: 10,
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: 4,
    name: "Pizza",
    count: 8,
    img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: 5,
    name: "Drinks",
    count: 15,
    img: "https://images.unsplash.com/photo-1544145945-f904253d0c7b?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: 6,
    name: "Desserts",
    count: 7,
    img: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=200",
  },
];

const MenuCategories = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSearch, setShowSearch]       = useState(false);
  const [searchQuery, setSearchQuery]     = useState("");

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchToggle = () => {
    setShowSearch((prev) => !prev);
    setSearchQuery("");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-white pb-32">

        {/* Header */}
        <header className="px-4 pt-12 pb-4 flex items-center justify-between sticky top-0 bg-white z-10">

          {/* Left — sidebar toggle (hidden when search is open) */}
          {!showSearch ? (
            <button
              className="p-2 bg-gray-100 rounded-xl"
              onClick={() => setIsSidebarOpen(true)}
            >
              <MenuIcon size={20} className="text-gray-700" />
            </button>
          ) : (
            // Placeholder keeps the layout from jumping
            <div className="w-9" />
          )}

          {/* Centre — title or inline search input */}
          {showSearch ? (
            <div className="flex-1 mx-3 bg-gray-100 rounded-xl flex items-center px-3 gap-2">
              <Search size={15} className="text-gray-400 flex-shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories..."
                className="flex-1 bg-transparent text-sm outline-none py-2 text-gray-700 placeholder:text-gray-400"
              />
              {/* Clear text only — keeps search bar open */}
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}>
                  <X size={14} className="text-gray-400" />
                </button>
              )}
            </div>
          ) : (
            <div className="text-center">
              <h1 className="text-lg font-bold text-gray-800">Our Menu</h1>
              <p className="text-[10px] text-gray-400">
                What would you like to order?
              </p>
            </div>
          )}

          {/* Right — toggle search open/close */}
          <button
            className="p-2 bg-gray-100 rounded-xl"
            onClick={handleSearchToggle}
          >
            {showSearch
              ? <X size={20} className="text-gray-700" />
              : <Search size={20} className="text-gray-700" />
            }
          </button>
        </header>

        {/* Category list */}
        <div className="px-4 space-y-3 pb-16">
          {filteredCategories.length === 0 ? (

            // Empty state when search returns nothing
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Search size={24} className="text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-600">No categories found</p>
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
            filteredCategories.map((cat) => (
              <Link
                to="/menuItems"
                key={cat.id}
                className="group flex items-center p-3 bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-95 transition-all cursor-pointer hover:border-orange-200"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden mr-3 shrink-0">
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800">{cat.name}</h3>
                  <p className="text-xs text-gray-400">{cat.count} Items</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-full group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                  <ChevronRight size={18} />
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Floating View Cart button */}
        <div className="fixed bottom-24 left-0 right-0 px-6">
          <Link
            to="/cart"
            className="w-full bg-orange-500 py-4 rounded-2xl flex items-center justify-between px-6 shadow-xl shadow-orange-200 active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-3">
              <ShoppingBag size={20} className="text-white" />
              <span className="text-white font-bold">View Cart</span>
            </div>
            <span className="bg-white text-orange-500 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
              3
            </span>
          </Link>
        </div>

        <Navigation />
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </div>
    </PageTransition>
  );
};

export default MenuCategories;