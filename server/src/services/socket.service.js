/**
 * Socket.io Real-time Communication Service
 * Handles WebSocket connections for live updates
 * 
 * @module services/socket
 * @description
 * Provides real-time bidirectional communication:
 * - Order status updates to kitchen
 * - New order notifications to staff
 * - Live table status updates
 * 
 * Uses Socket.io for WebSocket implementation with room-based messaging
 */

// Global Socket.io instance
let io;

/**
 * Initialize Socket.io with HTTP server
 * 
 * @function init
 * @param {Object} server - HTTP server instance (from Express)
 * @returns {Object} Socket.io server instance
 * 
 * @description
 * - Creates Socket.io server with CORS enabled for all origins
 * - Sets up event listeners for connection/disconnection
 * - Creates rooms for different user types (restaurant, kitchen, cashier)
 * - Called once during server startup in app.js
 */
const init = (server) => {
  const { Server } = require('socket.io');
  io = new Server(server, { cors: { origin: '*' } });

  // Handle new socket connections
  io.on('connection', (socket) => {
    // Restaurant admin joins their专属 room for admin events
    socket.on('join:restaurant', (restaurantId) => {
      socket.join(`restaurant:${restaurantId}`);
    });

    // Kitchen staff joins kitchen room for order updates
    socket.on('join:kitchen', (restaurantId) => {
      socket.join(`kitchen:${restaurantId}`);
    });

    // Cashier joins cashier room for payment updates
    socket.on('join:cashier', (restaurantId) => {
      socket.join(`cashier:${restaurantId}`);
    });

    // Handle client disconnection
    socket.on('disconnect', () => {});
  });

  return io;
};

/**
 * Get Socket.io instance for sending real-time events
 * 
 * @function getIO
 * @returns {Object} Socket.io server instance
 * @throws {Error} If Socket.io not initialized before use
 * 
 * @description
 * - Used by controllers to emit events to specific rooms
 * - Must be called after init() has been called
 * - Example: getIO().to('kitchen:123').emit('newOrder', order)
 */
const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

// Emit new order to kitchen + restaurant
const emitNewOrder = (restaurantId, order) => {
  getIO().to(`kitchen:${restaurantId}`).emit('order:new', order);
  getIO().to(`restaurant:${restaurantId}`).emit('order:new', order);
};

// Emit order status update to all rooms
const emitOrderUpdate = (restaurantId, order) => {
  getIO().to(`restaurant:${restaurantId}`).emit('order:updated', order);
  getIO().to(`kitchen:${restaurantId}`).emit('order:updated', order);
  getIO().to(`cashier:${restaurantId}`).emit('order:updated', order);
};

module.exports = { init, getIO, emitNewOrder, emitOrderUpdate };