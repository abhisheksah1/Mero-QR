const Employee = require('../../models/Employee.model');
const bcrypt = require('bcryptjs');
const generateToken = require('../../utils/generateToken');
const { success, error } = require('../../utils/apiResponse');

exports.createEmployee = async (req, res) => {
  try {
    const { username, role } = req.body;
    const restaurantId = req.user.restaurantId;

    const exists = await Employee.findOne({ restaurant: restaurantId, username });
    if (exists) return error(res, 'Username already taken', 409);

    // Default password = username
    const employee = await Employee.create({
      restaurant: restaurantId,
      username,
      password: username,
      role,
      createdBy: restaurantId,
    });

    return success(res, { id: employee._id, username, role }, 'Employee created', 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.resetEmployeePassword = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await Employee.findOne({
      _id: employeeId,
      restaurant: req.user.restaurantId,
    });
    if (!employee) return error(res, 'Employee not found', 404);

    // Reset to default: username
    employee.password = employee.username;
    employee.isPasswordChanged = false;
    await employee.save();

    return success(res, null, 'Password reset to default (username)');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.listEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ restaurant: req.user.restaurantId })
      .select('-password')
      .lean();
    return success(res, employees);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// Employee login (separate from restaurant admin login)
exports.employeeLogin = async (req, res) => {
  try {
    const { username, password, restaurantId } = req.body;
    const employee = await Employee.findOne({ username, restaurant: restaurantId, isActive: true });
    if (!employee || !(await employee.matchPassword(password)))
      return error(res, 'Invalid credentials', 401);

    const token = generateToken({
      employeeId: employee._id,
      restaurantId: employee.restaurant,
      scope: employee.role, // 'kitchen' or 'cashier'
    });

    return success(res, {
      token,
      mustChangePassword: !employee.isPasswordChanged,
      role: employee.role,
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// Employee changes their own password (forced on first login)
exports.changeEmployeePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const employee = await Employee.findById(req.user.employeeId);
    if (!employee) return error(res, 'Not found', 404);

    employee.password = newPassword;
    employee.isPasswordChanged = true;
    await employee.save();

    return success(res, null, 'Password changed successfully');
  } catch (err) {
    return error(res, err.message, 500);
  }
};