/**
 * QR Code Generation Service
 * Generates unique QR codes for restaurant tables
 * 
 * @module services/qr
 * @description
 * Creates QR codes that link to ordering pages:
 * - Generates unique token for each table
 * - Creates scannable QR code image (Data URL)
 * - Returns both QR image and URL for storage
 */

/**
 * Generates QR code for a specific restaurant table
 * 
 * @function generateQRForTable
 * @async
 * @param {string} restaurantId - Unique restaurant identifier
 * @param {string} restaurantSlug - URL-friendly restaurant name
 * @param {number} tableNumber - Table number for the QR
 * @returns {Promise<Object>} Object containing QR code data
 * 
 * @description
 * - Creates unique 32-character token for each table
 * - Generates URL that opens ordering page with table context
 * - Creates 300x300px QR code image as base64 Data URL
 * - Uses custom colors for brand consistency
 * 
 * @returns {Object} { qrCode, qrToken, qrUrl }
 * @property {string} qrCode - Base64 encoded PNG image
 * @property {string} qrToken - Unique token for the table
 * @property {string} qrUrl - Full URL encoded in QR
 */
const QRCode = require('qrcode');
const crypto = require('crypto');

const generateQRForTable = async (restaurantId, restaurantSlug, tableNumber) => {
  // Generate cryptographically secure random token (32 hex chars)
  const token = crypto.randomBytes(16).toString('hex');

  // Construct URL with table token and restaurant ID
  // When scanned, opens ordering page with table context
  const url = `http://192.168.1.26:3000/order?table=${token}&restaurant=${restaurantId}`;

  // Generate QR code image with custom styling
  const qrCode = await QRCode.toDataURL(url, {
    width: 300,           // QR code size in pixels
    margin: 2,            // White space around QR
    color: { 
      dark: '#1a1f2e',   // QR color (dark blue-black)
      light: '#ffffff'   // Background color (white)
    }
  });

  return { qrCode, qrToken: token, qrUrl: url };
};

module.exports = { generateQRForTable };
