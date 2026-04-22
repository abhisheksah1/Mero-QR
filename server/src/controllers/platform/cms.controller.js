const CMS = require('../../models/CMS.model');
const { success, error } = require('../../utils/apiResponse');

exports.upsertContent = async (req, res) => {
  try {
    const { key, ...data } = req.body;
    const content = await CMS.findOneAndUpdate(
      { key },
      { ...data, updatedBy: req.user.id },
      { upsert: true, new: true }
    );
    return success(res, content);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.getContent = async (req, res) => {
  try {
    const content = await CMS.find({ isActive: true });
    return success(res, content);
  } catch (err) {
    return error(res, err.message, 500);
  }
};