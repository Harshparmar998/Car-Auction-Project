import formidable from "formidable";
import fs from "fs-extra";
import path from "path";
import { validateImageMock } from "../../../utils/visionMock"; // ✅ mock

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const parseForm = () =>
      new Promise((resolve, reject) => {
        const form = formidable({
          uploadDir: path.join(process.cwd(), "public/uploads"),
          keepExtensions: true,
        });
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve({ fields, files });
        });
      });

    const { fields, files } = await parseForm();
    const field = fields.field?.[0];
    const rc_number = fields.rc_number?.[0];
    const license_number = fields.license_number?.[0];

    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({ valid: false, error: "No file uploaded" });
    }

    const uploadDir = path.join(process.cwd(), "public/uploads");
    await fs.ensureDir(uploadDir);
    const newPath = path.join(uploadDir, `${Date.now()}_${file.originalFilename}`);
    await fs.move(file.filepath, newPath);

    // ✅ Use mock instead of Google Vision
    const expectedText = field === "rc_img" ? rc_number : license_number;
    const result = await validateImageMock(newPath, expectedText);

    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Validation Error:", error);
    return res.status(500).json({ valid: false, error: error.message });
  }
}
