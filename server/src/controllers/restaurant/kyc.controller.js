const KYC = require('../../models/KYC.model');
const { success, error } = require('../../utils/apiResponse');

exports.submitKYC = async (req, res) => {
  try {
    const { ownerName, idType, idNumber } = req.body;
    const restaurantId = req.user.restaurantId;

    const existing = await KYC.findOne({ restaurant: restaurantId });
    if (existing && existing.status === 'approved')
      return error(res, 'KYC already approved', 400);

    const kyc = await KYC.findOneAndUpdate(
      { restaurant: restaurantId },
      { ownerName, idType, idNumber, status: 'pending', idDocument: req.file?.path },
      { upsert: true, new: true }
    );

    return success(res, kyc, 'KYC submitted for review');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.getKYCStatus = async (req, res) => {
  try {
    const kyc = await KYC.findOne({ restaurant: req.user.restaurantId });
    return success(res, kyc);
  } catch (err) {
    return error(res, err.message, 500);
  }
};