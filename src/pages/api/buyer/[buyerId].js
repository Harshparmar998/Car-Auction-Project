import db from "../../../../utils/db.js"; // Ensure correct path to your db.js file

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  const { buyerId } = req.query; // Extracting sellerId from query params

  // Validate seller ID
  if (!buyerId || isNaN(parseInt(buyerId))) {
    return res.status(400).json({ success: false, message: "Invalid buyer ID" });
  }

  const query = "SELECT full_name, email, phone_number, password FROM buyers WHERE id = ?";

  try {
    const [results] = await db.execute(query, [parseInt(buyerId)]); // Ensure numeric ID

    if (results.length > 0) {
      return res.status(200).json({ success: true, buyer: results[0] });
    } else {
      return res.status(404).json({ success: false, message: "buyer not found" });
    }
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
