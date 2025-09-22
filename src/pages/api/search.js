import db from '../../../utils/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    const searchQuery = `
      SELECT c.*, 
             GROUP_CONCAT(ci.image_path) AS car_images, 
             COALESCE(MAX(b.bid_price), 0) AS highest_bid 
      FROM car_details c 
      LEFT JOIN car_images ci ON c.id = ci.car_id 
      LEFT JOIN bids b ON c.id = b.auction_id 
      WHERE c.car_status = 'Available' 
        AND (c.company LIKE ? OR c.model LIKE ? OR c.color LIKE ?) 
      GROUP BY c.id
    `;

    const searchTerm = `%${query}%`; // Ensures query is searched anywhere in the string

    const results = await db.query(searchQuery, [searchTerm, searchTerm, searchTerm]);

    res.status(200).json(results);
  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
