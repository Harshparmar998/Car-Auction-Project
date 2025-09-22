import db from "../../../utils/db.js"; // Ensure this path is correct


export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { full_name, sellerName, email, phone_number, password, role } = req.body;
  console.log(full_name);

  if (!email || !phone_number || !password || !full_name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const createdAt = new Date();
    let query, values;

    if (role === "buyer") {
      query = "INSERT INTO buyers (full_name, email, phone_number, password) VALUES (?, ?, ?, ?)";
      values = [full_name, email, phone_number, password];
    } else if (role === "seller") {
      query = "INSERT INTO approve_seller (name, email, phone, password) VALUES (?, ?, ?, ?)";
      values = [full_name, email, phone_number, password];
    } else {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const [result] = await db.query(query, values);
    res.status(201).json({ success: true, message: `${role} registered successfully`, data: result });

  } catch (err) {
    console.error("Error inserting data:", err);
    res.status(500).json({ message: "Internal server error", error: err });
  }
}
