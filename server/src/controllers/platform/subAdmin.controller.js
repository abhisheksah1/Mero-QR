const Platform = require('../../models/Platform.model');
const { success, error } = require('../../utils/apiResponse');

exports.createSubAdmin = async (req, res) => {
  try {
    // Only super_admin can create sub-admins
    if (req.user.role !== 'super_admin')
      return error(res, 'Only super admin can create sub-admins', 403);

    const { name, email, password, permissions } = req.body;
    const exists = await Platform.findOne({ email });
    if (exists) return error(res, 'Email already in use', 409);

    const subAdmin = await Platform.create({
      name, email, password, role: 'sub_admin',
      permissions, createdBy: req.user.id,
    });

    return success(res, { id: subAdmin._id, name: subAdmin.name }, 'Sub-admin created', 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.bulkMail = async (req, res) => {
  try {
    const { subject, html, targets } = req.body; // targets: 'all' | array of restaurantIds
    const Restaurant = require('../../models/Restaurant.model');
    const { sendBulkMail } = require('../../services/email.service');

    let restaurants;
    if (targets === 'all') {
      restaurants = await Restaurant.find({ isActive: true }).select('email');
    } else {
      restaurants = await Restaurant.find({ _id: { $in: targets } }).select('email');
    }

    const emails = restaurants.map(r => r.email);
    await sendBulkMail(emails, subject, html);
    return success(res, { sent: emails.length }, 'Bulk mail sent');
  } catch (err) {
    return error(res, err.message, 500);
  }
};