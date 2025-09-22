import nodemailer from 'nodemailer';
import db from '../../../utils/db.js'; // Ensure this path is correct

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    try {

        if(!db)
        {
            throw new Error('Database connection not initialized');
        }

        // Check Buyers Table
        const [buyerResults] = await db.execute('SELECT id FROM buyers WHERE email = ?', [email]);
        if (buyerResults.length > 0) {
            await sendResetEmail(email, 'buyer');
            return res.status(200).json({ success: true, message: 'Password reset link has been sent to your email.' });
        }

        // Check Sellers Table
        const [sellerResults] = await db.execute('SELECT sellerid FROM sellers WHERE email = ?', [email]);
        if (sellerResults.length > 0) {
            await sendResetEmail(email, 'seller');
            return res.status(200).json({ success: true, message: 'Password reset link has been sent to your email.' });
        }

        return res.status(404).json({ success: false, message: 'No matching account found for this email' });
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// Function to send reset email
async function sendResetEmail(email, role) {
    const resetLink = `https://cold-pants-leave.loca.lt/reset-password?email=${encodeURIComponent(email)}&role=${role}`;

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'harshparmar090909@gmail.com', // Secure credentials
            pass: 'kfdr wpoj mhdf koip',
        },
    });

    const mailOptions = {
        from: 'harshparmar090909@gmail.com',
        to: email,
        subject: 'Password Reset Request',
        html: `
            <!DOCTYPE html>
            <html>
            <body>
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f4f4f9;">
                    <h1>Password Reset Request</h1>
                    <p>Hi,</p>
                    <p>You requested to reset your password. Click the button below to reset it:</p>
                    <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 6px;">Reset Password</a>
                    <p>If the button doesn’t work, copy and paste this link into your browser:</p>
                    <p><a href="${resetLink}">${resetLink}</a></p>
                    <p>Thank you,<br>The RevUpBids Team</p>
                </div>
            </body>
            </html>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Reset email sent to:', email);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}
