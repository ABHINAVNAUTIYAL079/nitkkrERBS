/**
 * Gmail OTP Sender using Nodemailer
 *
 * Setup:
 * 1. Go to https://myaccount.google.com/security
 * 2. Enable 2-Step Verification
 * 3. Go to App Passwords → create one for "Mail"
 * 4. Add to .env.local:
 *      GMAIL_USER=your_email@gmail.com
 *      GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
 */

import nodemailer from "nodemailer";

export async function sendOtpEmail(toEmail, otp) {
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPass) {
        console.warn(
            "⚠️ GMAIL_USER or GMAIL_APP_PASSWORD not set — OTP email will not be sent"
        );
        return false;
    }

    try {
        // Create transporter lazily inside the function to avoid module-load errors
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: gmailUser,
                // Remove spaces from App Password (Google displays them with spaces but they shouldn't be included)
                pass: gmailPass.replace(/\s+/g, ""),
            },
        });

        await transporter.sendMail({
            from: `"NIT KKR E-Rickshaw" <${gmailUser}>`,
            to: toEmail,
            subject: `Your OTP Code: ${otp}`,
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f172a; border-radius: 16px; color: #e2e8f0;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <div style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); padding: 12px 16px; border-radius: 12px; margin-bottom: 12px;">
                            <span style="font-size: 24px;">⚡</span>
                        </div>
                        <h2 style="color: #ffffff; margin: 8px 0 4px;">NIT KKR E-Rickshaw</h2>
                        <p style="color: #94a3b8; font-size: 14px; margin: 0;">Verification Code</p>
                    </div>

                    <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                        <p style="color: #94a3b8; font-size: 14px; margin: 0 0 12px;">Your one-time password is:</p>
                        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #10b981; font-family: 'Courier New', monospace; padding: 8px 0;">
                            ${otp}
                        </div>
                        <p style="color: #64748b; font-size: 12px; margin: 12px 0 0;">Valid for 5 minutes</p>
                    </div>

                    <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0;">
                        If you didn't request this code, please ignore this email.
                    </p>
                </div>
            `,
        });

        console.log(`✅ OTP email sent successfully to ${toEmail}`);
        return true;
    } catch (error) {
        console.error("❌ Failed to send OTP email:", error);
        return false;
    }
}
