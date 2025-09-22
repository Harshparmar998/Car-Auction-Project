import db from "../../../utils/db.js"; // Ensure correct database connection

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  const { car_id, seller_id } = req.body;

  if (!car_id || !seller_id) {
    return res.status(400).json({ success: false, message: "Car ID and Seller ID are required" });
  }

  try {
    const sql = `
      DELETE car_details, sell_car_documents, car_images  
      FROM car_details  
      LEFT JOIN sell_car_documents ON car_details.id = sell_car_documents.car_id  
      LEFT JOIN car_images ON car_details.id = car_images.car_id  
      WHERE car_details.id = ? AND car_details.sellerid = ?;
    `;

    const [result] = await db.execute(sql, [car_id, seller_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Auction not found or already canceled" });
    }

    res.status(200).json({ success: true, message: "Auction canceled successfully" });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ success: false, message: "Database error", error });
  }
}
