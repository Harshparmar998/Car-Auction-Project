import formidable from "formidable";
import fs from "fs-extra";
import path from "path";
import db from "../../../utils/db.js"; // MySQL database connection

export const config = {
  api: {
    bodyParser: false, // Required for formidable to handle file uploads
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // 📌 Parse Form Data with formidable
    const parseForm = () =>
      new Promise((resolve, reject) => {
        const form = formidable({
          uploadDir: path.join(process.cwd(), "public/uploads"),
          keepExtensions: true,
          multiples: true,
        });

        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve({ fields, files });
        });
      });

    const { fields, files } = await parseForm();

    // ✅ Extract sellerId & car_id
    const sellerId = fields.sellerId?.[0] || null;
    const car_id = fields.car_id?.[0] || null;

    if (!sellerId || !car_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 📌 Ensure Upload Directory Exists
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await fs.ensureDir(uploadDir);

    // 📌 Convert files to an array (Fix for single/multiple uploads)
    const imageFiles = Array.isArray(files.car_images) ? files.car_images : [files.car_images];

    // 📌 Function to Save Files
    const saveFile = async (file) => {
      if (!file) return null;
      const fileExt = path.extname(file.originalFilename || ""); // Ensure file extension
      const newFilename = `${Date.now()}_${Math.random().toString(36).slice(2)}${fileExt}`;
      const newPath = path.join(uploadDir, newFilename);
      await fs.move(file.filepath || file.path, newPath); // Fix for different formidable versions
      return newFilename;
    };

    // ✅ Process and Save Each Car Image
    const savedImages = (await Promise.all(imageFiles.map(saveFile))).filter(Boolean);

    // ✅ Insert into MySQL if there are valid images
    if (savedImages.length > 0) {
      const query = `INSERT INTO car_images (sellerid, car_id, image_path, uploaded_at) VALUES ?`;
      const values = savedImages.map((filename) => [sellerId, car_id, filename, new Date()]);

      await db.query(query, [values]);
    } else {
      return res.status(400).json({ error: "No valid images uploaded" });
    }

    return res.status(200).json({ success: true, message: "✅ Car images uploaded successfully!" });
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
