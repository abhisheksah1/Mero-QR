import React, { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Tag, Percent, Gift, Clock } from 'lucide-react'

const offersData = [
  { id: 1, title: '50% OFF', description: 'On all biryanis', code: 'BIRYANI50', validUntil: 'Dec 31, 2026', color: 'bg-red-500' },
  { id: 2, title: 'Buy 1 Get 1', description: 'Free pizza on weekends', code: 'PIZZA1FREE', validUntil: 'Nov 30, 2026', color: 'bg-green-500' },
  { id: 3, title: '20% OFF', description: 'On all drinks & beverages', code: 'DRINK20', validUntil: 'Dec 15, 2026', color: 'bg-blue-500' },
  { id: 4, title: 'Free Dessert', description: 'On orders above ₹500', code: 'DESSERTFREE', validUntil: 'Dec 31, 2026', color: 'bg-purple-500' },
  { id: 5, title: '15% OFF', description: 'On combo meals', code: 'COMBO15', validUntil: 'Nov 30, 2026', color: 'bg-orange-500' },
]

export default function Offers({ isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          
          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[80vh] overflow-hidden z-50 shadow-2xl"
          >
            {/* Handle Bar */}
            <div className="flex justify-center pt-3">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="bg-linear-to-r from-orange-500 to-red-500 mx-4 mt-4 rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Tag size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Special Offers</h2>
                    <p className="text-sm opacity-90">Grab the best deals!</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Offers List */}
            <div className="p-4 space-y-3 overflow-y-auto max-h-[60vh]">
              {offersData.map((offer) => (
                <div 
                  key={offer.id}
                  className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100"
                >
                  {/* Offer Badge */}
                  <div className={`${offer.color} w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-white`}>
                    <span className="text-xs text-center font-black">{offer.title}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-sm">{offer.description}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono bg-gray-200 px-2 py-0.5 rounded text-gray-600">{offer.code}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <Clock size={12} />
                      <span>Valid until {offer.validUntil}</span>
                    </div>
                  </div>

                  {/* Copy Button */}
                  <button 
                    onClick={() => navigator.clipboard.writeText(offer.code)}
                    className="bg-orange-100 p-2 rounded-lg text-orange-500 hover:bg-orange-200 transition-colors"
                  >
                    <Percent size={16} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}