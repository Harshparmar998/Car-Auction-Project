import formidable from 'formidable';
import db from '../../../utils/db'; // ✅ Use MySQL Connection Pool

export const config = {
  api: {
    bodyParser: false, // ✅ Disable bodyParser to use formidable
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // ✅ Parse form data without bodyParser
    const parseForm = () =>
      new Promise((resolve, reject) => {
        const form = formidable();
        form.parse(req, (err, fields) => {
          if (err) reject(err);
          else resolve(fields);
        });
      });

    // ✅ Wait for Form Data
    const fields = await parseForm();

    // ✅ Extract Fields
    const name = fields.name?.[0] || null;
    const email = fields.email?.[0] || null;
    const message = fields.message?.[0] || null;

    // ✅ Validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required!' });
    }

    // ✅ Insert Query
    const query = `INSERT INTO feedback (name, email, msg) VALUES (?, ?, ?)`;
    const values = [name, email, message];
    await db.execute(query, values);

    // ✅ Success Response
    return res.status(200).json({ success: true, message: 'Feedback submitted successfully!' });

  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}