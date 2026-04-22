const transporter = require('../config/mailer');
const { MAIL_FROM } = require('../config/env');

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";


// ✅ Sanitize user input (prevent HTML injection)
const escapeHTML = (str = "") =>
  str.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]));


// ✅ Base Email Template (Professional UI)
const baseTemplate = (title, content) => {
  return `
  <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
    
    <!-- Preheader -->
    <span style="display:none; font-size:0; color:#fff;">
      Mero QR Notification
    </span>

    <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #2563eb, #1e3a8a); color:#fff; padding:20px; text-align:center;">
        <h1 style="margin:0;">Mero QR</h1>
        <p style="margin:5px 0 0; font-size:14px;">Smart QR Ordering Platform</p>
      </div>

      <!-- Body -->
      <div style="padding:25px;">
        <h2 style="color:#0f172a;">${title}</h2>
        <div style="color:#334155; font-size:15px; line-height:1.6;">
          ${content}
        </div>
      </div>

      <!-- Footer -->
      <div style="background:#f1f5f9; padding:15px; text-align:center; font-size:12px; color:#64748b;">
        © ${new Date().getFullYear()} Mero QR. All rights reserved.
      </div>

    </div>
  </div>
  `;
};


// ✅ Send Mail with error handling
const sendMail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: MAIL_FROM,
      to,
      subject,
      html,
    });
    return info;
  } catch (error) {
    console.error("Email Error:", error.message);
    throw new Error("Failed to send email");
  }
};


// 🎉 Welcome Email
const sendWelcomeEmail = (to, name) =>
  sendMail({
    to,
    subject: 'Welcome to Mero QR 🚀',
    html: baseTemplate(
      `Welcome, ${escapeHTML(name)}! 🎉`,
      `
      <p>Your account has been successfully created.</p>
      <p>You can now start managing your restaurant with QR ordering.</p>

      <div style="text-align:center; margin-top:20px;">
        <a href="${CLIENT_URL}/dashboard" style="background:#2563eb; color:#fff; padding:12px 20px; border-radius:6px; text-decoration:none;">
          Get Started
        </a>
      </div>
      `
    ),
  });


// 🔐 OTP Email
const sendOTPEmail = (to, otp) =>
  sendMail({
    to,
    subject: 'Your OTP Code 🔐',
    html: baseTemplate(
      'OTP Verification',
      `
      <p>Use the following OTP to verify your account:</p>

      <div style="text-align:center; margin:20px 0;">
        <span style="font-size:28px; letter-spacing:5px; font-weight:bold; color:#2563eb;">
          ${escapeHTML(otp)}
        </span>
      </div>

      <p>This OTP will expire in <strong>10 minutes</strong>.</p>
      `
    ),
  });


// ✅ KYC Status Email
const sendKYCStatusEmail = (to, status, reason = '') =>
  sendMail({
    to,
    subject: `KYC ${status === 'approved' ? 'Approved ✅' : 'Rejected ❌'}`,
    html: baseTemplate(
      `KYC ${escapeHTML(status)}`,
      `
      <p>Your KYC has been <strong>${escapeHTML(status)}</strong>.</p>
      ${reason ? `<p><strong>Reason:</strong> ${escapeHTML(reason)}</p>` : ''}
      `
    ),
  });


// ⏳ Package Expiry Email
const sendPackageExpiryEmail = (to, name, daysLeft) =>
  sendMail({
    to,
    subject: 'Package Expiry Alert ⏳',
    html: baseTemplate(
      'Subscription Expiring',
      `
      <p>Hi ${escapeHTML(name)},</p>
      <p>Your package will expire in <strong>${daysLeft} day(s)</strong>.</p>

      <div style="text-align:center; margin-top:20px;">
        <a href="${CLIENT_URL}/billing" style="background:#dc2626; color:#fff; padding:12px 20px; border-radius:6px; text-decoration:none;">
          Renew Now
        </a>
      </div>
      `
    ),
  });


// 🔑 Password Reset Email
const sendPasswordResetEmail = (to, otp) =>
  sendMail({
    to,
    subject: 'Password Reset 🔑',
    html: baseTemplate(
      'Reset Your Password',
      `
      <p>Use this OTP to reset your password:</p>

      <div style="text-align:center; margin:20px 0;">
        <span style="font-size:26px; font-weight:bold; color:#2563eb;">
          ${escapeHTML(otp)}
        </span>
      </div>

      <p>This OTP is valid for 10 minutes.</p>
      `
    ),
  });


// 📢 Bulk Mail (safe sequential sending)
const sendBulkMail = async (recipients, subject, html) => {
  const results = [];

  for (const to of recipients) {
    try {
      const res = await sendMail({ to, subject, html });
      results.push({ to, status: "sent" });
    } catch (err) {
      results.push({ to, status: "failed", error: err.message });
    }
  }

  return results;
};


module.exports = {
  sendWelcomeEmail,
  sendOTPEmail,
  sendKYCStatusEmail,
  sendPackageExpiryEmail,
  sendPasswordResetEmail,
  sendBulkMail,
};