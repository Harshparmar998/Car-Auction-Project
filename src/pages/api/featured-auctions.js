import db from '../../../utils/db.js'; // Ensure correct path to your db.js file

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
 
  const query = `
    SELECT 
      cd.company, 
      cd.model, 
      cd.color, 
      cd.fuel_type, 
      cd.kilometers, 
      cd.min_price, 
      ci.image_path, 
      CONCAT(cd.company, ' ', cd.model, ' ', cd.color) AS car_title, 
      COUNT(b.bidid) AS total_bids 
    FROM 
      car_details cd 
    LEFT JOIN 
      car_images ci ON cd.id = ci.car_id 
    LEFT JOIN 
      bids b ON cd.id = b.auction_id 
    GROUP BY 
      cd.id 
    ORDER BY 
      total_bids DESC 
    LIMIT 3;
  `;

  try {
    const [result] = await db.execute(query);
    res.status(200).json({success: true,result});
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, message: 'Error fetching auctions from the database' });
  }
}
