import React, { useState } from "react";
import {
  Search,
  ChevronRight,
  Home,
  Menu as MenuIcon,
  ShoppingBag,
  User,
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter categories based on search
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-white pb-32">
        {/* Header */}
        <header className="px-4 pt-12 pb-4 flex items-center justify-between sticky top-0 bg-white z-10">
          <button
            className="p-2 bg-gray-100 rounded-xl"
            onClick={() => setIsSidebarOpen(true)}
          >
            <MenuIcon size={20} className="text-gray-700" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-800">Our Menu</h1>
            <p className="text-[10px] text-gray-400">
              What would you like to order?
            </p>
          </div>
          <button 
            className="p-2 bg-gray-100 rounded-xl"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search size={20} className="text-gray-700" />
          </button>
        </header>

        {/* Category List */}
        <div className="px-4 space-y-3 pb-32">
          {(searchQuery ? filteredCategories : categories).map((cat) => (
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
          ))}
        </div>

        {/* Floating View Cart Button */}
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

        {/* Navigation */}
        <Navigation />
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Search Modal */}
        {isSearchOpen && (
          <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
            {/* Search Header */}
            <div className="px-4 pt-12 pb-4 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <button 
                  onClick={clearSearch}
                  className="p-2 bg-gray-100 rounded-xl"
                >
                  <X size={20} className="text-gray-700" />
                </button>
                <div className="flex-1 relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Search Results */}
            <div className="px-4 space-y-3 pb-8">
              {searchQuery && filteredCategories.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No categories found for "{searchQuery}"</p>
                </div>
              ) : (
                filteredCategories.map((cat) => (
                  <Link
                    to="/menuItems"
                    key={cat.id}
                    onClick={clearSearch}
                    className="flex items-center p-3 bg-gray-50 rounded-2xl"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden mr-3 shrink-0">
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
                    <ChevronRight size={18} className="text-gray-400 shrink-0" />
                  </Link>
                ))
              )}
            </div>

            {/* Quick Suggestions */}
            {!searchQuery && (
              <div className="px-4 mt-6 pb-8">
                <p className="text-xs font-bold text-gray-400 uppercase mb-3">Popular Searches</p>
                <div className="flex flex-wrap gap-2">
                  {['Pizza', 'Burgers', 'Drinks', 'Desserts', 'Starters'].map((term) => (
                    <button
                      key={term}
                      onClick={() => handleSearch(term)}
                      className="px-4 py-2 bg-gray-100 rounded-full text-xs font-bold text-gray-600"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default MenuCategories;
