import db from "../../../utils/db"; // Adjust according to your DB connection

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { auction_id, buyer_id, first_name, last_name, bid_price, bid_time } = req.body;

  if (!auction_id || !buyer_id || !first_name || !last_name || !bid_price) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const query = `INSERT INTO bids (auction_id, buyerid, first_name, last_name, bid_price, bid_time) VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [auction_id, buyer_id, first_name, last_name, bid_price, bid_time];

    await db.execute(query, values);
    return res.status(200).json({ message: "Bid placed successfully!" });
  } catch (error) {
    console.error("Database Error:", error);
    return res.status(500).json({ message: "Failed to place bid." });
  }
}
