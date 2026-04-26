/**
 * Email Configuration Module
 * Configures nodemailer for sending transactional emails
 * 
 * @module config/mailer
 */

const nodemailer = require('nodemailer');
const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS } = require('./env');

/**
 * Nodemailer transporter configuration
 * Creates SMTP transport for sending emails
 * 
 * @description
 * - Uses SMTP protocol for email delivery
 * - Automatically determines secure mode based on port (465 = SSL)
 * - Authenticates with provided credentials from environment
 * - This transporter is used by the email service for all outgoing mail
 * 
 * @constant {Object} transporter
 * @property {string} host - SMTP server hostname
 * @property {number} port - SMTP server port number
 * @property {boolean} secure - Whether to use SSL/TLS (true for port 465)
 * @property {Object} auth - SMTP authentication credentials
 */
const transporter = nodemailer.createTransport({
  host: MAIL_HOST,
  port: Number(MAIL_PORT),
  // Use SSL/TLS for port 465, otherwise use STARTTLS
  secure: Number(MAIL_PORT) === 465,
  auth: { user: MAIL_USER, pass: MAIL_PASS },
});

module.exports = transporter;