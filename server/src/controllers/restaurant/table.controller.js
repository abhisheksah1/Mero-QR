const Table = require('../../models/Table.model');
const Restaurant = require('../../models/Restaurant.model');
const { generateQRForTable } = require('../../services/qr.service');
const { success, error } = require('../../utils/apiResponse');

exports.createTable = async (req, res) => {
  try {
    const { tableNumber } = req.body;
    const restaurantId = req.user.restaurantId;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return error(res, 'Restaurant not found', 404);

    const { qrCode, qrToken, qrUrl } = await generateQRForTable(
      restaurantId,
      restaurant.slug,
      tableNumber
    );

    const table = await Table.create({
      restaurant: restaurantId,
      tableNumber,
      qrCode,
      qrToken
    });

    return success(res, { ...table.toObject(), qrUrl }, 'Table created', 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.getTables = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const tables = await Table.find({ restaurant: restaurantId });

    // Rebuild qrUrl for each existing table
    const tablesWithUrl = tables.map(t => ({
      ...t.toObject(),
      qrUrl: `http://localhost:3000/order?table=${t.qrToken}&restaurant=${restaurantId}`
    }));

    return success(res, tablesWithUrl);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.regenerateQR = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const table = await Table.findOne({
      _id: req.params.tableId,
      restaurant: restaurantId
    });
    if (!table) return error(res, 'Table not found', 404);

    const restaurant = await Restaurant.findById(restaurantId);

    const { qrCode, qrToken, qrUrl } = await generateQRForTable(
      restaurantId,
      restaurant.slug,
      table.tableNumber
    );

    table.qrCode = qrCode;
    table.qrToken = qrToken;
    await table.save();

    return success(res, { qrCode, qrUrl }, 'QR regenerated');
  } catch (err) {
    return error(res, err.message, 500);
  }
};
