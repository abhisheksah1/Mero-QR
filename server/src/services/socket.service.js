let io;

const init = (server) => {
  const { Server } = require('socket.io');
  io = new Server(server, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    // Restaurant admin joins their room
    socket.on('join:restaurant', (restaurantId) => {
      socket.join(`restaurant:${restaurantId}`);
    });

    // Kitchen employee joins kitchen room
    socket.on('join:kitchen', (restaurantId) => {
      socket.join(`kitchen:${restaurantId}`);
    });

    // Cashier joins cashier room
    socket.on('join:cashier', (restaurantId) => {
      socket.join(`cashier:${restaurantId}`);
    });

    socket.on('disconnect', () => {});
  });

  return io;
};

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