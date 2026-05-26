import nodemailer from 'nodemailer';

/**
 * Send email verification link to user
 * @param {string} email 
 * @param {string} name 
 * @param {string} verificationUrl 
 */
export const sendVerificationEmail = async (email, name, verificationUrl) => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || 'no-reply@invoiceforge.com';

  const useActualSMTP = smtpHost && smtpUser && smtpPass;

  const emailHtml = `
    <div style="font-family: 'Inter', sans-serif; background-color: #f8fafc; padding: 40px; color: #0f172a;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 40px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
        <h2 style="font-size: 24px; font-weight: 800; color: #2563eb; margin-bottom: 24px; letter-spacing: -0.025em;">EQUINOX</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #334155; margin-bottom: 24px;">
          Hi <strong>${name}</strong>,
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: #334155; margin-bottom: 24px;">
          Welcome to Equinox Professional Invoicing. Before you can start precision billing, we need to verify your email address. Please click the button below to confirm your account:
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verificationUrl}" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
            Verify Email Address
          </a>
        </div>
        <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin-bottom: 16px;">
          If the button above does not work, copy and paste this URL into your browser:
        </p>
        <p style="font-size: 13px; font-family: monospace; word-break: break-all; background-color: #f1f5f9; padding: 12px; border-radius: 6px; color: #0f172a; border: 1px solid #e2e8f0; margin-bottom: 32px;">
          ${verificationUrl}
        </p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 24px;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">
          This link will expire in 24 hours. If you did not sign up for an Equinox account, please ignore this email.
        </p>
      </div>
    </div>
  `;

  if (useActualSMTP) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort),
        secure: parseInt(smtpPort) === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"Equinox Invoicing" <${smtpFrom}>`,
        to: email,
        subject: "Verify your email - Equinox Invoicing",
        html: emailHtml,
      });

      console.log(`[SMTP] Verification email sent successfully to ${email}`);
      return;
    } catch (error) {
      console.error(`[SMTP ERROR] Failed to send verification email to ${email}:`, error.message);
      console.log("[SMTP FALLBACK] Printing verification details to console instead.");
    }
  }

  // --- DEVELOPER CONSOLE FALLBACK LOGGING ---
  console.log("\n" + "=".repeat(80));
  console.log("📧  [DEVELOPMENT EMAIL SERVICE FALLBACK]");
  console.log(`To:      ${name} <${email}>`);
  console.log("Subject: Verify your email - Equinox Invoicing");
  console.log("-".repeat(80));
  console.log(`Please verify your email by clicking the link below:\n`);
  console.log(`👉  \x1b[36m\x1b[4m${verificationUrl}\x1b[0m`);
  console.log("\n" + "=".repeat(80) + "\n");
};
