import React, { useState } from 'react';
import { ArrowLeft, Share2, Plus, Minus } from 'lucide-react';

const ItemDetails = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState([]);

  const item = {
    name: "Creamy Alfredo Pasta",
    price: 450,
    desc: "Classic pasta in white cream sauce with parmesan cheese and herbs.",
    tag: "Veg",
    img: "https://images.unsplash.com/photo-1645112481355-03657396655c?auto=format&fit=crop&q=80&w=800"
  };

  const addons = [
    { id: 'a1', name: 'Grilled Chicken', price: 120 },
    { id: 'a2', name: 'Extra Cheese', price: 80 },
    { id: 'a3', name: 'Mushrooms', price: 90 },
  ];

  const toggleAddon = (id) => {
    setSelectedAddons(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const calculateTotal = () => {
    const addonsTotal = addons
      .filter(a => selectedAddons.includes(a.id))
      .reduce((sum, a) => sum + a.price, 0);
    return (item.price + addonsTotal) * quantity;
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Hero Header */}
      <div className="relative h-[40vh] w-full">
        <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
        <div className="absolute top-12 left-6 right-6 flex justify-between">
          <button className="p-2 bg-white/80 backdrop-blur-md rounded-xl text-gray-800 shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <button className="p-2 bg-white/80 backdrop-blur-md rounded-xl text-gray-800 shadow-sm">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className="px-6 -mt-6 relative bg-white rounded-t-4xl pt-8">
        {/* Title & Tag */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 border border-green-500 flex items-center justify-center bg-white">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-xs font-medium text-gray-500">Veg</span>
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900">Rs. {item.price}</p>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-sm mt-4 leading-relaxed">
          {item.desc}
        </p>

        {/* Add-ons Section */}
        <div className="mt-8">
          <h3 className="font-bold text-gray-800 mb-4">Add-ons</h3>
          <div className="space-y-4">
            {addons.map((addon) => (
              <label key={addon.id} className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                    selectedAddons.includes(addon.id) ? 'bg-orange-500 border-orange-500' : 'border-gray-200'
                  }`}>
                    {selectedAddons.includes(addon.id) && <div className="w-2 h-2 bg-white rounded-sm"></div>}
                  </div>
                  <span className="text-gray-700 text-sm font-medium">{addon.name}</span>
                </div>
                <span className="text-gray-400 text-sm">+ Rs. {addon.price}</span>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  onChange={() => toggleAddon(addon.id)} 
                />
              </label>
            ))}
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="mt-8 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">Quantity</h3>
          <div className="flex items-center gap-4 bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 bg-white rounded-lg shadow-sm text-gray-600 active:scale-90 transition-transform"
            >
              <Minus size={16} />
            </button>
            <span className="font-bold w-4 text-center">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 bg-white rounded-lg shadow-sm text-gray-600 active:scale-90 transition-transform"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-50">
        <button className="w-full bg-orange-500 py-4 rounded-2xl flex items-center justify-between px-8 shadow-xl shadow-orange-200 active:scale-[0.98] transition-all">
          <span className="text-white font-bold tracking-wide">Add to Cart</span>
          <span className="text-white font-bold">Rs. {calculateTotal()}</span>
        </button>
      </div>
    </div>
  );
};

export default ItemDetails;