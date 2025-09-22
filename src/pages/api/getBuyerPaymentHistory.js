import db from "../../../utils/db"; // Adjust path based on your structure

export default async function handler(req, res) {
  try {
    const { buyerId} = req.query;

    // Validate buyerId
    if (!buyerId) {
      return res.status(400).json({ error: "Buyer ID is required" });
    }


    const query = `
      SELECT 
          bids.bidid, bids.bid_price, bids.auction_id, bids.bid_status, bids.bid_time,bids.payment_status,
          car_details.company, car_details.model, car_details.color,
          (SELECT image_path FROM car_images WHERE car_images.car_id = bids.auction_id LIMIT 1) AS image_path
      FROM bids
      JOIN car_details ON bids.auction_id = car_details.id
      WHERE bids.bid_status = 'Completed' AND bids.buyerid = ?
      ORDER BY bids.bid_time DESC`;

    const [results] = await db.query(query, buyerId);

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching buyer's approved bids:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
