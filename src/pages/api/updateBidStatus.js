import db from "../../../utils/db"; // Import the correct DB connection

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ success: false, message: "Method Not Allowed" });
    }

    const { bidId, auctionId, status } = req.body;

    if (!bidId || !auctionId || !status) {
        return res.status(400).json({ success: false, message: "Bid ID, Auction ID, and status are required." });
    }

    try {
        const updateBidQuery = "UPDATE bids SET bid_status = ? WHERE bidid = ? AND auction_id = ?";
        const [result] = await db.query(updateBidQuery, [status, bidId, auctionId]); // ✅ Now uses promises

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Bid not found." });
        }

        return res.status(200).json({ success: true, message: "Bid status updated successfully." });

    } catch (error) {
        console.error("Error updating bid status:", error);
        return res.status(500).json({ success: false, message: "Failed to update bid status.", error: error.message });
    }
}
