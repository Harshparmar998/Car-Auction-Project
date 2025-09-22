import db from "../../../utils/db.js"; // Adjust path if necessary

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ success: false, message: "Method Not Allowed" });
    }

    const { auctionId, status } = req.body;

    if (!auctionId || !status) {
        return res.status(400).json({ success: false, message: "Auction ID and status are required." });
    }

    try {
        const query = "UPDATE car_details SET car_status = ? WHERE id = ?";
        const values = [status, auctionId];

        db.query(query, values, (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ success: false, message: "Failed to update auction status." });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: "Auction not found or no changes made." });
            }

            res.status(200).json({ success: true, message: "Auction status updated successfully." });
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
}
