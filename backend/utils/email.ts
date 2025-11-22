import nodemailer from "nodemailer";

// Configure Gmail transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

/**
 * Send password reset email with OTP
 * @param email - Recipient email address
 * @param otp - 6-digit OTP code
 */
export async function sendPasswordResetEmail(email: string, otp: string): Promise<void> {
    const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset Request",
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                        border-radius: 10px 10px 0 0;
                    }
                    .content {
                        background: #f9fafb;
                        padding: 30px;
                        border-radius: 0 0 10px 10px;
                    }
                    .otp-box {
                        background: white;
                        border: 2px solid #667eea;
                        border-radius: 8px;
                        padding: 20px;
                        text-align: center;
                        margin: 20px 0;
                    }
                    .otp-code {
                        font-size: 32px;
                        font-weight: bold;
                        color: #667eea;
                        letter-spacing: 8px;
                        font-family: 'Courier New', monospace;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 20px;
                        color: #6b7280;
                        font-size: 14px;
                    }
                    .warning {
                        background: #fef3c7;
                        border-left: 4px solid #f59e0b;
                        padding: 12px;
                        margin: 20px 0;
                        border-radius: 4px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <p>Hello,</p>
                        <p>We received a request to reset your password. Use the code below to complete the process:</p>
                        
                        <div class="otp-box">
                            <p style="margin: 0; color: #6b7280; font-size: 14px;">Your verification code is:</p>
                            <div class="otp-code">${otp}</div>
                        </div>
                        
                        <div class="warning">
                            <strong>⚠️ Important:</strong> This code will expire in 10 minutes.
                        </div>
                        
                        <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
                        
                        <div class="footer">
                            <p>This is an automated message, please do not reply to this email.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `
Password Reset Request

We received a request to reset your password.

Your verification code is: ${otp}

This code will expire in 10 minutes.

If you didn't request a password reset, please ignore this email.
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent successfully to ${email}`);
    } catch (error) {
        console.error("Error sending password reset email:", error);
        throw new Error("Failed to send password reset email");
    }
}
