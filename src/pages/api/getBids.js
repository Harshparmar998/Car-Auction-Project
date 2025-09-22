import db from "../../../utils/db.js"; // Ensure the correct path

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ success: false, message: "Method Not Allowed" });
    }

    const { auctionid } = req.query;

    if (!auctionid) {
        return res.status(400).json({ success: false, message: "Auction ID is required" });
    }

    try {
        const sql = `
            SELECT 
                b.bidid, 
                b.first_name, 
                b.last_name,
                b.bid_price, 
                b.bid_status, 
                b.bid_time 
            FROM bids b
            WHERE b.auction_id = ?
            ORDER BY b.bid_price DESC
        `;

        const [results] = await db.execute(sql, [auctionid]);

        res.status(200).json({ success: true, bids: results });
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ success: false, message: "Error fetching bids", error });
    }
}
