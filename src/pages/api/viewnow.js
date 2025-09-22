import db from "../../../utils/db.js";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { carid } = req.query;

    if (!carid) {
        return res.status(400).json({ message: "Car ID is required" });
    }

    try {
        const sql = `
            SELECT c.*, 
            GROUP_CONCAT(ci.image_path) AS car_images 
            FROM car_details c 
            LEFT JOIN car_images ci ON c.id = ci.car_id 
            WHERE c.id = ?
            GROUP BY c.id
        `;

        const [results] = await db.execute(sql, [carid]);

        if (results.length === 0) {
            return res.status(404).json({ message: "Car not found" });
        }

        results[0].car_images = results[0].car_images ? results[0].car_images.split(",") : [];

        res.json(results[0]); // Return a single object instead of an array
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ message: "Database error", error });
    }
}
