import db from "../../../utils/db";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ success: false, message: "Method Not Allowed" });
    }

    const { bidId } = req.body;

    if (!bidId) {
        return res.status(400).json({ success: false, message: "Bid ID is required." });
    }

    try {
        // Reject the selected bid
        const rejectQuery = "UPDATE bids SET bid_status = 'Rejected' WHERE bidid = ?";
        const [rejectResult] = await db.execute(rejectQuery, [bidId]);

        if (rejectResult.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Bid not found or already rejected." });
        }

        // Set all other bids to Pending
        const pendingQuery = "UPDATE bids SET bid_status = 'Pending' WHERE bidid != ?";
        await db.execute(pendingQuery, [bidId]);

        return res.status(200).json({ success: true, message: "Bid rejected successfully." });

    } catch (error) {
        console.error("Unexpected error:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}
