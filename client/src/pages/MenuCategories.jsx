import React from "react";
import {
  Search,
  ChevronRight,
  Home,
  Menu as MenuIcon,
  ShoppingBag,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";

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
  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex items-center justify-between sticky top-0 bg-white z-10">
        <button className="p-2 bg-gray-100 rounded-xl">
          <MenuIcon size={20} className="text-gray-700" />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-800">Our Menu</h1>
          <p className="text-[10px] text-gray-400">
            What would you like to order?
          </p>
        </div>
        <button className="p-2 bg-gray-100 rounded-xl">
          <Search size={20} className="text-gray-700" />
        </button>
      </header>

      {/* Category List */}
      <div className="px-6 space-y-4 m-10">
        {categories.map((cat) => (
          <Link to='/menuItems'
            key={cat.id}
            className="group flex items-center p-3 bg-white rounded-3xl border border-gray-100 shadow-sm active:scale-95 transition-all cursor-pointer hover:border-orange-200"
          >
            <div className="w-16 h-16 rounded-2xl overflow-hidden mr-4">
              <img
                src={cat.img}
                alt={cat.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1">
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
        <Link to='/cart' className="w-full bg-orange-500 py-4 rounded-2xl flex items-center justify-between px-6 shadow-xl shadow-orange-200 active:scale-95 transition-transform">
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
    </div>
  );
};

export default MenuCategories;
