import formidable from 'formidable';
import fs from 'fs-extra';
import path from 'path';
import db from '../../../utils/db.js'; // MySQL connection pool

export const config = {
  api: {
    bodyParser: false, // Required for formidable
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Parse form data
    const parseForm = () =>
      new Promise((resolve, reject) => {
        const form = formidable({
          uploadDir: path.join(process.cwd(), 'public/uploads'),
          keepExtensions: true,
          multiples: true,
        });

        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve({ fields, files });
        });
      });

    const { fields, files } = await parseForm();

    // Extract required fields
    const rc_number = fields.rc_number?.[0] || null;
    const license_number = fields.license_number?.[0] || null;
    const sellerId = fields.sellerId?.[0] || null;
    const car_id = fields.car_id?.[0] || null;

    if (!rc_number || !license_number || !sellerId || !car_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    await fs.ensureDir(uploadDir);

    // Function to save uploaded files
    const saveFile = async (file) => {
      if (!file || !file.filepath) return null;
      const newFilename = `${Date.now()}_${file.originalFilename}`;
      const newPath = path.join(uploadDir, newFilename);
      await fs.move(file.filepath, newPath);
      return newFilename;
    };

    // Save each uploaded file
    const license_img = files.license_img?.[0] ? await saveFile(files.license_img[0]) : null;
    const rc_img = files.rc_img?.[0] ? await saveFile(files.rc_img[0]) : null;
 

    // Insert into MySQL database
    const query = `
      INSERT INTO sell_car_documents (rc_number, license_number, license_img, rc_img, car_id, seller_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [rc_number, license_number, license_img, rc_img, car_id, sellerId];

    await db.execute(query, values);

    return res.status(200).json({ success: true, message: 'Files uploaded and data saved successfully!' });

  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
