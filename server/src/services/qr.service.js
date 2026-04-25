const QRCode = require('qrcode');
const crypto = require('crypto');

const generateQRForTable = async (restaurantId, restaurantSlug, tableNumber) => {
  const token = crypto.randomBytes(16).toString('hex');

  // ✅ FIXED: includes both ?table=TOKEN and &restaurant=ID
  const url = `http://192.168.1.26:3000/order?table=${token}&restaurant=${restaurantId}`;

  const qrCode = await QRCode.toDataURL(url, {
    width: 300,
    margin: 2,
    color: { dark: '#1a1f2e', light: '#ffffff' }
  });

  return { qrCode, qrToken: token, qrUrl: url };
};

module.exports = { generateQRForTable };
