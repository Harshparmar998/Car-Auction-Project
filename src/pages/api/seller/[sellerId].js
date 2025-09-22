import db from "../../../../utils/db.js"; // Ensure correct path to your db.js file

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  } 

  const { sellerId } = req.query; // Extracting sellerId from query params

  // Validate seller ID
  if (!sellerId || isNaN(parseInt(sellerId))) {
    return res.status(400).json({ success: false, message: "Invalid seller ID" });
  }

  const query = "SELECT sellerid, name, email, phone, password FROM sellers WHERE sellerid = ?";

  try {
    const [results] = await db.execute(query, [parseInt(sellerId)]); // Ensure numeric ID

    if (results.length > 0) {
      return res.status(200).json({ success: true, seller: results[0] });
    } else {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
