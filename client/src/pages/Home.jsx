// Vite + React + TailwindCSS - FULL RESPONSIVE HOMEPAGE (LIKE DESIGN)

import React from "react";
import { motion } from "framer-motion";
import {
  Phone,
  Tag,
  MessageSquare,
  Menu,
  User,
  ShoppingBag,
  HomeIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";

const bgImage = "https://images.unsplash.com/photo-1552566626-52f8b828add9";

export default function Home() {
  4
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pb-24 font-sans">
      {/* Hero Section with Background Image */}
      <div
        className="relative w-full h-[45vh] bg-cover bg-center flex flex-col items-center justify-center text-white p-6"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80')`,
        }}
      >
        <div className="absolute top-6 flex justify-between w-full px-6">
          <div className="bg-white/20 backdrop-blur-md p-2 rounded-lg">
            <Menu size={20} />
          </div>
          <div className="bg-white/20 backdrop-blur-md p-2 rounded-lg">
            <User size={20} />
          </div>
        </div>

        <div className="text-center">
          <div className="bg-white/20 backdrop-blur-md inline-block p-3 rounded-full mb-4">
            <span className="text-2xl">🍽️</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Foodies Cafe 🌿</h1>
          <p className="text-sm opacity-90 mt-2 italic">
            Delicious food, served with love
          </p>
        </div>
      </div>

      {/* Table Selection Card */}
      <div className="relative -mt-16 w-[90%] max-w-md bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center text-center border border-gray-100">
        <p className="text-gray-500 font-medium text-sm">Table No.</p>
        <h2 className="text-6xl font-black text-orange-500 my-2">05</h2>

        <button className="flex items-center gap-2 text-gray-400 text-xs mt-2 hover:text-orange-500 transition-colors">
          <span className="rotate-180">🔄</span> Scan another QR code
        </button>

        <Link
          to="menu"
          className="w-48 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl mt-8 shadow-lg shadow-orange-200 transition-all active:scale-95"
        >
          View Menu
        </Link>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-3 gap-4 w-[90%] max-w-md mt-8">
        <button className="flex flex-col items-center justify-center bg-white p-4 rounded-2xl shadow-sm border border-gray-50 active:bg-gray-100">
          <div className="bg-orange-50 p-3 rounded-full text-orange-500 mb-2">
            <Phone size={20} />
          </div>
          <span className="text-xs font-semibold text-gray-700">
            Call Waiter
          </span>
        </button>

        <button className="flex flex-col items-center justify-center bg-white p-4 rounded-2xl shadow-sm border border-gray-50 active:bg-gray-100">
          <div className="bg-orange-50 p-3 rounded-full text-orange-500 mb-2">
            <Tag size={20} />
          </div>
          <span className="text-xs font-semibold text-gray-700">Offers</span>
        </button>

        <button className="flex flex-col items-center justify-center bg-white p-4 rounded-2xl shadow-sm border border-gray-50 active:bg-gray-100">
          <div className="bg-orange-50 p-3 rounded-full text-orange-500 mb-2">
            <MessageSquare size={20} />
          </div>
          <span className="text-xs font-semibold text-gray-700">Feedback</span>
        </button>
      </div>

      {/* Branding Footer */}
      <p className="mt-12 text-gray-400 text-xs">
        Powered by{" "}
        <span className="font-bold text-gray-600 uppercase tracking-widest text-[10px]">
          Foodies Cafe
        </span>{" "}
        ❤️
      </p>

     {/* Nav */}

     {/* <Navigation /> */}
      
    </div>
  );
}
