const QRCode = require('qrcode');
const { CLIENT_URL } = require('../config/env');
const crypto = require('crypto');

const generateQRForTable = async (restaurantSlug, tableId) => {
  const token = crypto.randomBytes(16).toString('hex');
  const url = `${CLIENT_URL}/menu/${restaurantSlug}?table=${token}`;
  const qrCode = await QRCode.toDataURL(url);
  return { qrCode, qrToken: token };
};

module.exports = { generateQRForTable };