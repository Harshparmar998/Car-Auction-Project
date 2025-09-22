import { useState, useEffect } from "react";
import { useRouter } from "next/router"; // ✅ Import useRouter
import * as mobilenet from "@tensorflow-models/mobilenet";
import "@tensorflow/tfjs";
import Navbar from '../components/Navbar';
import toast from "react-hot-toast";

export default function CarImageUpload() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [validImages, setValidImages] = useState([]);
  const [uploadedImages, setUploadedImages] = useState(new Map());
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [model, setModel] = useState(null);
  const router = useRouter(); // ✅ Initialize useRouter

  const validKeywords = [
    "car", "cab", "seat belt", "taxi", "seatbelt", "taxicab", "brake",
    "wheel", "sports car", "sport car", "convertible", "racer", "race car",
    "racing car", "gear", "speedometer", "pickup", "pickup truck", "jeep", "landrover"
  ];

  // Load MobileNet Model
  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await mobilenet.load();
        setModel(loadedModel);
        toast.success("✅ AI Model Loaded Successfully!", { position: "top-right" });
        console.log("✅ Model loaded.");
      } catch (error) {
        toast.error("❌ Failed to Load AI Model!", { position: "top-right" });
        console.error("Error loading model:", error);
      }
    };
    loadModel();
  }, []);

  // Handle Image Selection
  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
    setValidImages([]);
    setUploadedImages(new Map());
    setMessage("");

    if (!model) return;

    let tempValidImages = [];
    let tempUploadedImages = new Map();

    for (let file of files) {
      const imageUrl = URL.createObjectURL(file);
      const imageElement = new Image();
      imageElement.src = imageUrl;

      await new Promise((resolve) => {
        imageElement.onload = async () => {
          const predictions = await model.classify(imageElement);
          console.log(`📌 Predictions for ${file.name}:`, predictions);

          const detectedLabels = predictions.map((p) => p.className.toLowerCase());
          const isCarDetected = detectedLabels.some((label) =>
            validKeywords.some((keyword) => label.includes(keyword))
          );

          tempUploadedImages.set(file.name, isCarDetected);
          if (isCarDetected) {
            tempValidImages.push(file);
          }

          setUploadedImages(new Map(tempUploadedImages));
          setValidImages([...tempValidImages]);
          resolve();
        };
      });
    }
  };

  // Remove Image
  const removeImage = (fileName) => {
    setSelectedFiles(selectedFiles.filter((file) => file.name !== fileName));
    setValidImages(validImages.filter((file) => file.name !== fileName));
    const updatedUploadedImages = new Map(uploadedImages);
    updatedUploadedImages.delete(fileName);
    setUploadedImages(updatedUploadedImages);
  };

  // Handle Image Upload
  const handleUpload = async (event) => {
    event.preventDefault();
    if (validImages.length === 0) {
      setMessage("❌ No valid car images selected!");
      return;
    }

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    validImages.forEach((file) => formData.append("car_images", file));

    const sellerId = localStorage.getItem("sellerId");
    const carId = localStorage.getItem("car-id");

    if (!sellerId || !carId) {
      setMessage("❌ Seller ID or Car ID is missing!");
      setUploading(false);
      return;
    }

    formData.append("sellerId", sellerId);
    formData.append("car_id", carId);

    try {
      const response = await fetch("/api/carimage", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        toast.success("✅ Images uploaded successfully!",{position: 'top-right'});
        router.push('/'); // ✅ Redirect after successful upload
      } else {
        setMessage(result.error || "❌ Upload failed");
      }
    } catch (error) {
      toast.error('Something went wrong! Please try again later.',{position: 'top-right'});
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container mt-5">
        <div className="card text-center p-4 shadow">
          <h3 className="mb-3">Upload Car Images</h3>

          <form onSubmit={handleUpload}>
            {/* File Input */}
            <input
              type="file"
              className="form-control mb-3"
              multiple
              onChange={handleFileChange}
              accept="image/*"
            />

            {/* Image Previews */}
            <div className="row mt-3">
              {selectedFiles.map((file) => (
                <div key={file.name} className="col-md-4 mb-3 position-relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="img-thumbnail"
                    style={{ width: "100%", height: "150px", objectFit: "cover" }}
                  />
                  <button
                    type="button"
                    className="btn-close position-absolute top-0 end-0 m-2"
                    onClick={() => removeImage(file.name)}
                  ></button>
                  <p
                    className={`mt-1 small ${
                      uploadedImages.get(file.name) ? "text-success" : "text-danger"
                    }`}
                  >
                    {uploadedImages.get(file.name) ? "✅ Car detected" : "❌ No car detected"}
                  </p>
                </div>
              ))}
            </div>

            {/* Alert Message */}
            {uploadedImages.size > 0 && (
              <div
                className={`alert mt-3 ${
                  validImages.length === uploadedImages.size ? "alert-success" : "alert-danger"
                }`}
              >
                {validImages.length === uploadedImages.size
                  ? "✅ All selected images are valid car images. You can now submit."
                  : "❌ Some images are not valid. Please upload car images."}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading || validImages.length === 0}
              className={`btn btn-success mt-3 ${
                validImages.length === 0 ? "disabled" : ""
              }`}
            >
              {uploading ? "Uploading..." : "Submit Images"}
            </button>
          </form>

          {/* Message Display */}
          {message && <p className="mt-3">{message}</p>}
        </div>
      </div>
    </div>
  );
}
