const Restaurant = require('../../models/Restaurant.model');
const generateToken = require('../../utils/generateToken');
const generateOTP = require('../../utils/generateOTP');
const generateSlug = require('../../utils/generateSlug');
const { sendWelcomeEmail, sendOTPEmail, sendPasswordResetEmail } = require('../../services/email.service');
const { success, error } = require('../../utils/apiResponse');

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const exists = await Restaurant.findOne({ email });
    if (exists) return error(res, 'Email already registered', 409);

    const slug = await generateSlug(name);
    const restaurant = await Restaurant.create({ name, email, phone, password, slug });
    await sendWelcomeEmail(email, name);

    return success(res, { id: restaurant._id, slug }, 'Registered successfully', 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const restaurant = await Restaurant.findOne({ email });
    if (!restaurant || !(await restaurant.matchPassword(password)))
      return error(res, 'Invalid credentials', 401);

    if (!restaurant.isActive)
      return error(res, 'Your account is deactivated. Please renew your subscription.', 403);

    const token = generateToken({
      restaurantId: restaurant._id,
      scope: 'restaurant',
      slug: restaurant.slug,
    });

    return success(res, {
      token,
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
        isKYCVerified: restaurant.isKYCVerified,
        packageExpiresAt: restaurant.packageExpiresAt,
      },
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const restaurant = await Restaurant.findOne({ email });
    if (!restaurant) return error(res, 'Email not found', 404);

    const otp = generateOTP();
    restaurant.otp = otp;
    restaurant.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await restaurant.save();
    await sendPasswordResetEmail(email, otp);

    return success(res, null, 'OTP sent to your email');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const restaurant = await Restaurant.findOne({ email });
    if (!restaurant) return error(res, 'Not found', 404);
    if (restaurant.otp !== otp || restaurant.otpExpiry < new Date())
      return error(res, 'Invalid or expired OTP', 400);

    restaurant.password = newPassword;
    restaurant.otp = undefined;
    restaurant.otpExpiry = undefined;
    await restaurant.save();

    return success(res, null, 'Password updated');
  } catch (err) {
    return error(res, err.message, 500);
  }
};