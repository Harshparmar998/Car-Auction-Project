import db from "../../../utils/db.js"; // Ensure correct path to your db.js file

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    // Query for live auctions (Available cars)
    const liveQuery = `
      SELECT 
        cd.id,
        cd.company, 
        cd.model, 
        cd.color, 
        cd.fuel_type, 
        cd.kilometers, 
        cd.min_price, 
        cd.auction_end_time,
        GROUP_CONCAT(DISTINCT ci.image_path) AS car_images, 
        CONCAT(cd.company, ' ', cd.model, ' ', cd.color) AS car_title, 
        (SELECT COUNT(*) FROM bids WHERE auction_id = cd.id) AS total_bids
      FROM 
        car_details cd 
      LEFT JOIN 
        car_images ci ON cd.id = ci.car_id 
      WHERE 
        cd.car_status = 'Available'
      GROUP BY 
        cd.id 
      ORDER BY 
        total_bids DESC 
      LIMIT 3;
    `;

    // Query for upcoming auctions (Approved cars)
    const upcomingQuery = `
      SELECT 
        cd.id,
        cd.company, 
        cd.model, 
        cd.color, 
        cd.fuel_type, 
        cd.kilometers, 
        cd.min_price, 
        GROUP_CONCAT(DISTINCT ci.image_path) AS car_images, 
        CONCAT(cd.company, ' ', cd.model, ' ', cd.color) AS car_title, 
        (SELECT COUNT(*) FROM bids WHERE auction_id = cd.id) AS total_bids
      FROM 
        car_details cd 
      LEFT JOIN 
        car_images ci ON cd.id = ci.car_id 
      WHERE 
        cd.car_status = 'Approved'
      GROUP BY 
        cd.id 
      ORDER BY 
        total_bids DESC 
      LIMIT 3;
    `;

    // Execute both queries asynchronously
    const [liveResults] = await db.execute(liveQuery);
    const [upcomingResults] = await db.execute(upcomingQuery);

    // Convert car_images from a comma-separated string to an array
    const formatResults = (results) => {
      return results.map((car) => ({
        ...car,
        car_images: car.car_images ? car.car_images.split(",") : [],
      }));
    };

    res.status(200).json({
      success: true,
      liveAuctions: formatResults(liveResults),
      upcomingAuctions: formatResults(upcomingResults),
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ success: false, message: "Error fetching auctions from the database" });
  }
}
