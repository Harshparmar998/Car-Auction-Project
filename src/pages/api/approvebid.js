import nodemailer from "nodemailer";
import db from "../../../utils/db";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }
    
    const { bidId, auctionId } = req.body;

    try {
        // Calculate payment deadline (3 days from now)
        const paymentDeadline = new Date();
        paymentDeadline.setDate(paymentDeadline.getDate() + 3);

        // Reject all other bids
        await db.query("UPDATE bids SET bid_status = 'Rejected' WHERE auction_id = ? AND bidid != ?;", [auctionId, bidId]);

        // Approve selected bid and set the payment deadline
        await db.query("UPDATE bids SET bid_status = 'Approved', payment_deadline = ? WHERE bidid = ?;", [paymentDeadline, bidId]);

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

        const { email, first_name, last_name, bid_price } = result[0];

        // Configure transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "harshparmar090909@gmail.com",
                pass: "kfdr wpoj mhdf koip"
            }
        });

        // Send email
        await transporter.sendMail({
            from: "harshparmar090909@gmail.com",
            to: email,
            subject: "Your Bid Has Been Approved",
            text: `Hi ${first_name} ${last_name},\n\nCongratulations! Your bid of ₹${bid_price} has been approved. Please pay a 10% token amount (₹${(bid_price * 0.1).toFixed(2)}) within 3 days (by ${paymentDeadline.toDateString()}).\n\nThank you!`
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error approving bid:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}