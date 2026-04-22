const Platform = require('../../models/Platform.model');
const generateToken = require('../../utils/generateToken');
const { success, error } = require('../../utils/apiResponse');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Platform.findOne({ email, isActive: true });
    if (!admin || !(await admin.matchPassword(password)))
      return error(res, 'Invalid credentials', 401);

    const token = generateToken({ id: admin._id, scope: 'platform', role: admin.role, permissions: admin.permissions });
    return success(res, { token, admin: { id: admin._id, name: admin.name, role: admin.role } });
  } catch (err) {
    return error(res, err.message, 500);
  }
};