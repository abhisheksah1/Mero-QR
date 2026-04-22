const Table = require('../../models/Table.model');
const { generateQRForTable } = require('../../services/qr.service');
const { success, error } = require('../../utils/apiResponse');

exports.createTable = async (req, res) => {
  try {
    const { tableNumber } = req.body;
    const { restaurantId, slug } = req.user;

    const { qrCode, qrToken } = await generateQRForTable(slug, tableNumber);

    const table = await Table.create({ restaurant: restaurantId, tableNumber, qrCode, qrToken });
    return success(res, table, 'Table created', 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.getTables = async (req, res) => {
  try {
    const tables = await Table.find({ restaurant: req.user.restaurantId }).select('-qrToken');
    return success(res, tables);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.regenerateQR = async (req, res) => {
  try {
    const table = await Table.findOne({ _id: req.params.tableId, restaurant: req.user.restaurantId });
    if (!table) return error(res, 'Table not found', 404);

    const { qrCode, qrToken } = await generateQRForTable(req.user.slug, table.tableNumber);
    table.qrCode = qrCode;
    table.qrToken = qrToken;
    await table.save();

    return success(res, { qrCode }, 'QR regenerated');
  } catch (err) {
    return error(res, err.message, 500);
  }
};