import db from '../../../utils/db.js'; // Ensure this path is correct

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    // Ensure the database is properly connected
    if (!db) {
      throw new Error('Database connection not initialized');
    }

    console.log('Checking buyer details...');
    const buyerQuery = 'SELECT id, full_name, email, password FROM buyers WHERE email = ?';
    const [buyerResults] = await db.query(buyerQuery, [email]);

    if (buyerResults.length > 0) {
      const buyer = buyerResults[0];
      if (password === buyer.password) {
        return res.status(200).json({
          success: true,
          userRole: 'buyer',
          userName: buyer.full_name,
          message: 'Login successful as buyer',
          buyerId: buyer.id,
        });
      }
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    console.log('Checking seller details...');
    const sellerQuery = 'SELECT sellerid, name, email, password FROM sellers WHERE email = ?';
    const [sellerResults] = await db.query(sellerQuery, [email]);

    if (sellerResults.length > 0) {
      const seller = sellerResults[0];
      if (password === seller.password) {
        return res.status(200).json({
          success: true,
          userRole: 'seller',
          userName: seller.name,
          message: 'Login successful as seller',
          sellerId: seller.sellerid,
        });
      }
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    return res.status(404).json({ success: false, message: 'No matching account found' });
  } catch (error) {
    console.error('Error logging in:', error.stack || error); // Enhanced error logging
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}