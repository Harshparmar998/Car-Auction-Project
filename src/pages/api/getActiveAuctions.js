import db from "../../../utils/db.js";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ success: false, message: "Method Not Allowed" });
    }

    try {
        if (!db) {
            return res.status(500).json({ success: false, message: "Database connection not initialized" });
        }

        const query = `
            SELECT c.*, 
                   GROUP_CONCAT(ci.image_path) AS car_images
            FROM car_details c 
            LEFT JOIN car_images ci ON c.id = ci.car_id 
            WHERE TRIM(LOWER(c.car_status)) = 'available'
            GROUP BY c.id`;

        const [cars] = await db.execute(query);

        if (!cars.length) {
            return res.status(404).json({ success: false, message: "No active auctions found" });
        }

        // Convert concatenated car images into an array
        const formattedCars = cars.map(car => ({
            ...car,
            car_images: car.car_images ? car.car_images.split(",") : []
        }));

        return res.status(200).json({ success: true, data: formattedCars });
    } catch (error) {
        console.error("Database Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}
