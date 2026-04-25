import React, { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Phone, MessageCircle, Star, X } from 'lucide-react'

const waitersData = [
  { id: 1, name: 'Rahul Kumar', role: 'Senior Waiter', avatar: '👨‍🍳', rating: 4.8, orders: 234 },
  { id: 2, name: 'Priya Sharma', role: 'Waiter', avatar: '👩‍🍳', rating: 4.9, orders: 189 },
  { id: 3, name: 'Amit Singh', role: 'Waiter', avatar: '👨‍🍳', rating: 4.7, orders: 156 },
  { id: 4, name: 'Sita Devi', role: 'Senior Waiter', avatar: '👩‍🍳', rating: 4.8, orders: 201 },
  { id: 5, name: 'Raj Patel', role: 'Waiter', avatar: '👨‍🍳', rating: 4.6, orders: 98 },
]

export default function Waiters({ isOpen, onClose }) {
  // Lock body scroll when modal is open
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
            <div className="bg-orange-500 mx-4 mt-4 rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Call Waiter</h2>
                  <p className="text-sm opacity-90">Select a waiter to assist you</p>
                </div>
                <button 
                  onClick={onClose}
                  className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Waiter List */}
            <div className="p-4 space-y-3 overflow-y-auto max-h-[60vh]">
              {waitersData.map((waiter) => (
                <div 
                  key={waiter.id}
                  className="bg-gray-50 rounded-2xl p-3 flex items-center gap-3"
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
                    {waiter.avatar}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-sm">{waiter.name}</h3>
                    <p className="text-xs text-gray-500">{waiter.role}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button className="bg-orange-500 p-2 rounded-lg text-white hover:bg-orange-600 transition-colors">
                      <Phone size={16} />
                    </button>
                    <button className="bg-green-500 p-2 rounded-lg text-white hover:bg-green-600 transition-colors">
                      <MessageCircle size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
