import db from "../../../utils/db.js";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ success: false, message: "Method Not Allowed" });
    }

    try {
        if (!db) {
            return res.status(500).json({ success: false, message: "Database connection not initialized" });
        }

        const {
            sellername,
            sellerId,
            company,
            model,
            condition,
            insurance,
            color,
            chassis_no,
            description,
            min_price,
            max_price,
            manufacture_year,
            fuel_type,
            owner_history,
            kilometers
        } = req.body;

        if (
            !sellername ||
            !sellerId ||
            !company ||
            !model ||
            !condition ||
            !insurance ||
            !color ||
            !chassis_no ||
            !min_price ||
            !max_price ||
            !manufacture_year ||
            !fuel_type ||
            !owner_history ||
            !kilometers
        ) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }


        // Insert into `car_details` table
        const [result] = await db.execute(
            `INSERT INTO car_details 
                (sellername, sellerid, company, model, car_condition, insurance, color, chassis_no, description, min_price, max_price, manufacture_year, fuel_type, owner_history, kilometers) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                sellername,
                sellerId,
                company,
                model,
                condition,
                insurance,
                color,
                chassis_no,
                description,
                min_price,
                max_price,
                manufacture_year,
                fuel_type,
                owner_history,
                kilometers
            ]
        );

        // Get the inserted car ID
        const carId = result.insertId;
        return res.status(200).json({ success: true, message: "Car details submitted successfully", carId });

    } catch (error) {
        console.error("Database error:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}
