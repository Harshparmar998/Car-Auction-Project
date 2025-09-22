import nodemailer from "nodemailer";
import db from "../../../utils/db";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { bidId } = req.body;

    try {
        // Reject the bid in MySQL
        await db.query("UPDATE bids SET bid_status = 'Rejected' WHERE bidid = ?;", [bidId]);

        // Get the buyer's email and details
        const [result] = await db.query(
            `SELECT email, bids.first_name, bids.last_name, bids.bid_price
             FROM bids
             JOIN buyers ON bids.buyerid = buyers.id
             WHERE bids.bidid = ?;`,
            [bidId]
        );

        if (result.length === 0) {
            return res.status(400).json({ error: "Bidder not found" });
        }

        const { email, first_name, last_name } = result[0];

        // Configure transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "harshparmar090909@gmail.com",
                pass: "kfdr wpoj mhdf koip"
            }
        });

        // Send rejection email
        await transporter.sendMail({
            from: "harshparmar090909@gmail.com",
            to: email,
            subject: "Your Bid Has Been Rejected",
            text: `Hi ${first_name} ${last_name},\n\nWe regret to inform you that your bid has been rejected. Thank you for your participation.\n\nBest regards.`
        });

        res.status(200).json({ success: true, message: "Bid rejected and email sent successfully." });
    } catch (error) {
        console.error("Error rejecting bid:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
