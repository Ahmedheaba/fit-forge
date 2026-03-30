/**
 * Email Configuration & Templates
 * Nodemailer setup with HTML email templates
 */

const nodemailer = require('nodemailer');

// ─── Transporter Setup ────────────────────────────────────────────────────────
const createTransporter = () => {
  if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
    // Use Ethereal for testing in development
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: 'test@ethereal.email', pass: 'testpass' },
    });
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// ─── Base Email Template ──────────────────────────────────────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0a; color: #ffffff; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; margin-bottom: 40px; }
    .logo { font-size: 32px; font-weight: 900; letter-spacing: -1px; }
    .logo span { color: #39FF14; }
    .card { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 16px; padding: 40px; margin-bottom: 24px; }
    .btn { display: inline-block; background: #39FF14; color: #000000; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #2a2a2a; }
    .detail-label { color: #888; font-size: 14px; }
    .detail-value { font-weight: 600; font-size: 14px; }
    .highlight { color: #39FF14; font-size: 24px; font-weight: 700; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">FIT<span>FORGE</span></div>
    </div>
    ${content}
    <div class="footer">
      <p>© ${new Date().getFullYear()} FitForge. All rights reserved.</p>
      <p style="margin-top: 8px;">This email was sent because you have an account with FitForge.</p>
    </div>
  </div>
</body>
</html>
`;

// ─── Email Senders ─────────────────────────────────────────────────────────────

/**
 * Welcome email after registration
 */
const sendWelcomeEmail = async (user) => {
  const transporter = createTransporter();
  const html = baseTemplate(`
    <div class="card">
      <h1 style="font-size: 28px; margin-bottom: 8px;">Welcome to FitForge! 💪</h1>
      <p style="color: #aaa; margin-bottom: 24px;">Your fitness journey starts now, ${user.name.split(' ')[0]}.</p>
      <p style="color: #ccc; line-height: 1.7;">
        You're officially part of the FitForge community. Explore our world-class facilities, 
        book your first session, and choose a membership plan that fits your goals.
      </p>
      <a href="${process.env.FRONTEND_URL}/plans" class="btn">Explore Plans →</a>
    </div>
    <div class="card">
      <h3 style="margin-bottom: 16px; color: #39FF14;">What's next?</h3>
      <p style="color: #ccc; margin-bottom: 8px; line-height: 1.7;">
        1. Choose a membership plan<br>
        2. Book your first class<br>
        3. Meet your trainer<br>
        4. Crush your goals
      </p>
    </div>
  `);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'FitForge <noreply@fitforge.com>',
    to: user.email,
    subject: `Welcome to FitForge, ${user.name.split(' ')[0]}! 🏋️`,
    html,
  });
};

/**
 * Booking confirmation email
 */
const sendBookingConfirmation = async (user, booking) => {
  const transporter = createTransporter();
  const bookingDate = new Date(booking.date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const html = baseTemplate(`
    <div class="card">
      <p style="color: #39FF14; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">Booking Confirmed</p>
      <h1 style="font-size: 28px; margin-bottom: 8px;">${booking.className}</h1>
      <p class="highlight">${booking.startTime} – ${booking.endTime}</p>
      
      <div style="margin-top: 24px;">
        <div class="detail-row">
          <span class="detail-label">Confirmation Code</span>
          <span class="detail-value" style="color: #39FF14;">${booking.confirmationCode}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date</span>
          <span class="detail-value">${bookingDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Trainer</span>
          <span class="detail-value">${booking.trainerName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Duration</span>
          <span class="detail-value">${booking.duration} minutes</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Room</span>
          <span class="detail-value">${booking.room}</span>
        </div>
      </div>
    </div>
    <div class="card">
      <p style="color: #888; font-size: 14px; line-height: 1.7;">
        Please arrive 10 minutes before your session. Bring your FitForge member ID or 
        show this email at the front desk. Cancellations must be made at least 2 hours before your session.
      </p>
    </div>
  `);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'FitForge <noreply@fitforge.com>',
    to: user.email,
    subject: `Booking Confirmed: ${booking.className} — ${booking.startTime}`,
    html,
  });
};

/**
 * Booking cancellation email
 */
const sendCancellationEmail = async (user, booking) => {
  const transporter = createTransporter();
  const html = baseTemplate(`
    <div class="card">
      <p style="color: #ff4444; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">Booking Cancelled</p>
      <h1 style="font-size: 28px; margin-bottom: 24px;">Your booking has been cancelled</h1>
      <div class="detail-row">
        <span class="detail-label">Class</span>
        <span class="detail-value">${booking.className}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Was scheduled for</span>
        <span class="detail-value">${new Date(booking.date).toLocaleDateString()} at ${booking.startTime}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Confirmation Code</span>
        <span class="detail-value">${booking.confirmationCode}</span>
      </div>
    </div>
    <div class="card">
      <p style="color: #ccc; line-height: 1.7; margin-bottom: 16px;">
        Your booking has been cancelled. Ready to book a new session?
      </p>
      <a href="${process.env.FRONTEND_URL}/book" class="btn">Book Another Session →</a>
    </div>
  `);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'FitForge <noreply@fitforge.com>',
    to: user.email,
    subject: `Booking Cancelled — ${booking.className}`,
    html,
  });
};

module.exports = { sendWelcomeEmail, sendBookingConfirmation, sendCancellationEmail };
