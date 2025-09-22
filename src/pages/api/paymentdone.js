import nodemailer from "nodemailer";
import db from "../../../utils/db";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { bidId } = req.body;

    if (!bidId) {
        return res.status(400).json({ error: "Bid ID is required." });
    }

    try {
        // Update payment status to "Paid"
        await db.query("UPDATE bids SET payment_status = 'Paid', bid_status='Completed' WHERE bidid = ?;", [bidId]);

        // Get buyer's email
        const [result] = await db.query(
            `SELECT email, bids.first_name, bids.last_name, bids.bid_price
             FROM bids
             JOIN buyers ON bids.buyerid = buyers.id
             WHERE bids.bidid = ?;`,
            [bidId]
        );

        if (result.length === 0) {
            return res.status(400).json({ error: "Buyer not found." });
        }

        const { email } = result[0];

        // Configure transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "harshparmar090909@gmail.com",
                pass: "kfdr wpoj mhdf koip"
            }
        });

        // Send payment confirmation email
        await transporter.sendMail({
            from: "harshparmar090909@gmail.com",
            to: email,
            subject: "Payment Successful",
            text: `Hi,\n\nWe have received your payment successfully. Thank you for your purchase!\n\nBest regards.`
        });

        res.status(200).json({ success: true, message: "Payment updated and email sent successfully." });
    } catch (error) {
        console.error("Error updating payment status:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
