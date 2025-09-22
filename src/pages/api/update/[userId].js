import db from "../../../../utils/db.js";

export default async function handler(req, res) {
    if (req.method !== "PUT") {
        return res.status(405).json({ success: false, message: "Method Not Allowed" });
    }

    let { userId } = req.query;  // Extract from URL
    if (!userId) {
        userId = req.body.id;  // Try to get from request body if missing
    }

    console.log("Received userId:", userId); // Debugging

    const { userType, full_name, email, phone_number, password } = req.body;

    if (!userType || !userId) {
        return res.status(400).json({ success: false, message: "User type and ID are required" });
    }

    let tableName;
    let updateQuery;
    let params;

    if (userType === "seller") {
        tableName = "sellers";
        updateQuery = `UPDATE ${tableName} SET name = ?, email = ?, phone = ?, password = ? WHERE sellerid = ?`;
        params = [full_name, email, phone_number, password, userId];
    } else if (userType === "buyer") {
        tableName = "buyers";
        updateQuery = `UPDATE ${tableName} SET full_name = ?, email = ?, phone_number = ?, password = ? WHERE id = ?`;
        params = [full_name, email, phone_number, password, userId];
    } else {
        return res.status(400).json({ success: false, message: "Invalid user type" });
    }

    // Ensure no undefined values in query parameters
    if (params.some((param) => param === undefined)) {
        return res.status(400).json({ success: false, message: "All fields are required and must be valid" });
    }

    try {
        const [results] = await db.execute(updateQuery, params);

        if (results.affectedRows > 0) {
            return res.status(200).json({ success: true, message: `${userType} profile updated successfully!` });
        } else {
            return res.status(404).json({ success: false, message: `${userType} not found` });
        }
    } catch (error) {
        console.error("Database error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}
