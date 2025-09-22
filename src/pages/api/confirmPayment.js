import db from "../../../utils/db";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ success: false, message: "Method Not Allowed" });
    }

    try {
        const { bidId, auctionId } = req.body;

        // Update bid status and payment status in database
        const updateQuery = "UPDATE bids SET bid_status = ?, payment_status = ? WHERE bidid = ? AND auction_id = ?";
        const [result] = await db.query(updateQuery, ["Completed", "paid", bidId, auctionId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Bid not found or already updated." });
        }

        return res.status(200).json({ success: true, message: "Payment confirmed successfully!" });
    } catch (error) {
        console.error("Error confirming payment:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}
