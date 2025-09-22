import db from "../../../utils/db.js"; // Ensure the correct path to your database connection file

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  const { sellerid } = req.query; // Get seller ID from query parameters

  if (!sellerid) {
    return res.status(400).json({ success: false, message: "Seller ID is required" });
  }

  try {
    const sql = `
      SELECT 
        c.*, 
        GROUP_CONCAT(ci.image_path) AS car_images, 
        COALESCE(MAX(b.bid_price), 0) AS highest_bid
      FROM 
        car_details c
      LEFT JOIN 
        car_images ci ON c.id = ci.car_id
      LEFT JOIN 
        bids b ON c.id = b.auction_id
      WHERE 
        c.car_status = 'Completed' AND c.sellerid = ?
      GROUP BY 
        c.id;
    `;

    // Execute query with seller ID parameter
    const [results] = await db.execute(sql, [sellerid]);

    // Convert car_images from a comma-separated string to an array
    const formattedResults = results.map(car => ({
      ...car,
      car_images: car.car_images ? car.car_images.split(",") : [],
    }));

    res.status(200).json({ success: true, completedAuctions: formattedResults });
    
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ success: false, message: "Database error", error });
  }
}
