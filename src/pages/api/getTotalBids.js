import db from "../../../utils/db"; // Ensure you are using the correct DB connection

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
        const query = "SELECT COUNT(bidid) AS total_bids FROM bids";
        const [results] = await db.execute(query); // ✅ Fix: Using `await db.execute()`
        
        res.status(200).json({ total_bids: results[0]?.total_bids || 0 });
    } catch (error) {
        console.error("Error fetching total bids:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
