# Seller Management

This project is a part of the RevUpBids platform, providing backend services for seller management.

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Backend (Go Live for Admin Panel)

To run the backend server (admin panel), use:

```bash
Go live
```
or, if you have a custom script for starting the server, use that script.

### 3. Start the Frontend

To start the frontend development server, run:

```bash
npm run start
```

## Project Structure

- `index.js` - Main entry point for the backend server.
- `package.json` - Project dependencies and scripts.

## Notes

- **Go live for admin panel:** Make sure your backend server is running to access the admin panel.
- **Frontend:** Use `npm run dev` to start the frontend in development mode.

---

## 🔍 Image Validation
This project originally uses **Google Cloud Vision API** for OCR validation.  
For open-source purposes, a **mock OCR service** is included (`utils/visionMock.js`) so the project can run without paid API keys.

If you want to integrate real OCR:
1. Enable Google Vision API on Google Cloud.
2. Replace `validateImageMock` with `@google-cloud/vision` client.
3. Add your `GOOGLE_APPLICATION_CREDENTIALS` key file.
