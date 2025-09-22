import db from "../../../utils/db.js";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { car_id, seller_id } = req.body;

    if (!car_id || !seller_id) {
        return res.status(400).json({ message: "Car ID and Seller ID are required" });
    }

    try {
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + 12 * 60 * 60 * 1000); // 12 hours from now

        const sql = `
            UPDATE car_details 
            SET car_status="Available", auction_start_time=?, auction_end_time=? 
            WHERE id=? AND sellerid=? AND car_status="Approved"
        `;

        const [result] = await db.execute(sql, [startTime, endTime, car_id, seller_id]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ message: "Auction could not be started. Make sure the car is approved." });
        }

        res.json({ success:true,message: "Auction started successfully", auctionId: car_id });
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ message: "Database error", error });
    }
}
