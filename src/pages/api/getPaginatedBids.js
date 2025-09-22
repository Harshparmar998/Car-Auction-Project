import db from "../../../utils/db"; // Adjust path based on your structure

export default async function handler(req, res) {
  try {
    const { page = 1, pageSize = 5, buyerId } = req.query;

    // Convert to numbers
    const pageNum = parseInt(page, 10);
    const sizeNum = parseInt(pageSize, 10);

    if (isNaN(pageNum) || isNaN(sizeNum) || pageNum < 1 || sizeNum < 1) {
      return res.status(400).json({ error: "Invalid pagination parameters" });
    }

    const offset = (pageNum - 1) * sizeNum;

    const query = `
      SELECT 
          bids.bidid, bids.bid_price, bids.auction_id, bids.bid_status, bids.bid_time,
          car_details.company, car_details.model, car_details.color,
          (SELECT image_path FROM car_images WHERE car_images.car_id = bids.auction_id LIMIT 1) AS image_path
      FROM bids
      JOIN car_details ON bids.auction_id = car_details.id
      WHERE bids.buyerid = ?
      ORDER BY bids.bid_time DESC
      LIMIT ${sizeNum} OFFSET ${offset}`;

    const [results] = await db.query(query,buyerId); // Use db.query() instead of db.execute()

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching paginated bids:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
