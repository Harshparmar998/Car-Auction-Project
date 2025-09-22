import db from "../../../utils/db.js";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { sellerid } = req.query;

    if (!sellerid) {
        return res.status(400).json({ message: "Seller ID is required" });
    }

    try {
        const sql = "SELECT sellerid, name, email, phone FROM sellers WHERE sellerid = ?";
        const [results] = await db.execute(sql, [sellerid]);

        if (!results || results.length === 0) {
            return res.status(404).json({ message: "Seller not found" });
        }

        res.status(200).json({ seller: results[0] }); // Return only the first object
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
}
