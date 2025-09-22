import db from "../../../utils/db.js";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ success: false, message: "Method Not Allowed" });
    }

    try {
        if (!db) {
            return res.status(500).json({ success: false, message: "Database connection not initialized" });
        }

        const [cars] = await db.execute("SELECT company, model, color FROM cars"); // Selecting only required fields

        if (!cars.length) {
            return res.status(404).json({ success: false, message: "No cars found" });
        }

        return res.status(200).json({ success: true, data: cars });
    } catch (error) {
        console.error("Database error:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}
