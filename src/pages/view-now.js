"use client";

import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import toast from "react-hot-toast";



let BootstrapModal;
if (typeof window !== "undefined") {
  BootstrapModal = require("bootstrap").Modal;
}
const ViewNow = () => {
  const router = useRouter();
  const [carId, setCarId] = useState(null);
  const [auctionDetails, setAuctionDetails] = useState(null);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState("Loading...");
  const [userRole, setUserRole] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bidPrice, setBidPrice] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [auctionId, setAuctionId] = useState(null);
  const [buyerId, setBuyerId] = useState(null);
  const [bidTime, setBidTime] = useState(new Date().toISOString());
  const bidModalRef = useRef(null);
  let bidModalInstance = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("userRole"));
      setBuyerId(localStorage.getItem("buyerId")); 
    }
  }, []);

  useEffect(() => {
    if (router.isReady) {
      const { carid } = router.query;
      if (carid) {
        setCarId(carid);
        fetchAuctionDetails(carid);
      }
    }
  }, [router.isReady, router.query]);

  useEffect(() => {
    if (bidModalRef.current) {
      bidModalInstance.current = new BootstrapModal(bidModalRef.current);
    }
  }, []);

  const fetchAuctionDetails = async (carid) => {
    try {
      const res = await fetch(`/api/viewnow?carid=${carid}`);
      const data = await res.json();
      if (data) {
        console.log("Auction Details:", data);
        setAuctionDetails(data);
        setMinPrice(data.min_price);  // Assign min_price
        setMaxPrice(data.max_price);
        setAuctionId(data.id);  // Assign max_price
        fetchSellerDetails(data.sellerid);
        if (data.car_images.length > 0) {
          setSelectedImage(`/uploads/${data.car_images[0]}`); // Set first image as default
        } else {
          setSelectedImage("/placeholder.png");
        }
        startCountdown(data.auction_end_time);
      } else {
        setAuctionDetails(null);
      }
    } catch (error) {
      console.error("Error fetching auction details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerDetails = async (sellerId) => {
    try {
      const res = await fetch(`/api/sellerdetails?sellerid=${sellerId}`);
      const data = await res.json();
      if (res.ok) {
        setSellerInfo(data.seller);
      } else {
        console.error("Error fetching seller details:", data.message);
      }
    } catch (error) {
      console.error("Error fetching seller details:", error);
    }
  };

  const startCountdown = (auctionEndTime) => {
    if (!auctionEndTime) {
      setTimeLeft("Not Started");
      return;
    }

    const endTime = new Date(auctionEndTime).getTime();
    const updateTimer = () => {
      const now = new Date().getTime();
      const timeRemaining = endTime - now;

      if (timeRemaining <= 0) {
        setTimeLeft("Auction Ended");
        return;
      }

      const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  };

  const openBidModal = () => {
    if (!userRole) {
      alert("Please log in to place a bid.");
      window.location.href = "/buyer-panel/html/login.html";
      return;
    }

    if (userRole === "seller") {
      alert("Sellers are not allowed to place bids.");
      return;
    }

    if (bidModalInstance.current) {
      bidModalInstance.current.show();
    }
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
   
    const buyerId=localStorage.getItem("buyerId");

    const bidPriceNum = parseFloat(bidPrice);
    const minPriceNum = parseFloat(minPrice);
    const maxPriceNum = parseFloat(maxPrice);

    // Check if bidPrice is within the allowed range
    if (bidPriceNum < minPriceNum || bidPriceNum > maxPriceNum) {
      console.log(bidPriceNum, minPriceNum, maxPriceNum);
      alert(`Bid price must be between ₹${minPriceNum} and ₹${maxPriceNum}`);
      return;
    }
  
    const bidData = {
      auction_id: auctionId,
      buyer_id: buyerId,
      first_name:firstName,
      last_name:lastName,
      bid_price:bidPrice,
      bid_time: new Date().toISOString(),
    };

    console.log("Auction ID:", auctionId);
console.log("Buyer ID:", buyerId);
console.log("Bid Data:", bidData);

  
    try {
      const response = await fetch("/api/placebid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bidData),
      });
  
      const result = await response.json();
      
      if (response.ok) {
        toast.success("Bid placed successfully!",{position: 'top-right'});
        setBidPrice(""); // Reset bid price field
        if (bidModalInstance.current) {
          bidModalInstance.current.hide(); // Close the modal
        }
      } else {
        toast.error(result.error || "Failed to place bid. Try again.",{position: 'top-right'});
      }
    } catch (error) {
      console.error("Error placing bid:", error);
      alert("An error occurred. Please try again.");
    }
  };
  
  

  return (
    <div>
      <Navbar />
      <div className="container mt-5">
        {loading ? (
          <p className="text-center">Loading auction details...</p>
        ) : auctionDetails ? (
          <div className="row">
            {/* Left Side - Images */}
            <div className="col-md-7">
              {/* Main Image */}
              <div className="main-image-container text-center">
                {selectedImage && (
                  <img
                    src={selectedImage}
                    className="img-fluid main-image rounded shadow-lg"
                    alt="Car"
                  />
                )}
              </div>

              {/* Thumbnails */}
              <div className="thumbnail-container d-flex flex-wrap justify-content-center mt-3">
                {auctionDetails.car_images.map((img, index) => (
                  <img
                    key={index}
                    src={`/uploads/${img}`} // Ensure img contains the full URL
                    className={`thumbnail img-thumbnail mx-2 ${selectedImage === img ? "selected" : ""}`}
                    alt="Car"
                    onClick={() => setSelectedImage(`/uploads/${img}`)}
                  />
                ))}
              </div>
            </div>

            <style jsx>{`
            .main-image {
              width: 100%;
              max-width: 600px; /* Adjust main image size */
              height: 400px; /* Fixed height */
              object-fit: contain; /* Maintain aspect ratio */
              border-radius: 10px;
              transition: transform 0.2s ease-in-out;
            }

            .thumbnail {
              width: 100px;  /* Set thumbnail width */
              height: 75px; /* Set thumbnail height */
              cursor: pointer;
              transition: transform 0.2s, border 0.2s;
              border: 2px solid transparent;
              object-fit: cover; /* Crop the image */
            }

            .thumbnail:hover, .thumbnail.selected {
              transform: scale(1.1);
              border: 2px solid blue;
            }
          `}</style>


            {/* Right Side - Car & Seller Info */}
            <div className="col-md-5">
              <h2 className="car-name">{auctionDetails.company} {auctionDetails.model}</h2>
              <p className="text-muted">({auctionDetails.color})</p>

              <h4><strong>Min Price:</strong>  ₹{auctionDetails.min_price || "N/A"}</h4>

              <p className="auction-status mt-3">
                <strong>Auction Status:</strong> <span className="text-success">{auctionDetails.car_status}</span>
              </p>
              <p className="time-left text-danger">
                <strong>Time Left:</strong> {timeLeft}
              </p>


              {/* Seller Information */}
              {sellerInfo && (
                <div className="seller-info mt-4 p-3 border rounded bg-light shadow-sm">
                  <h4 className="text-primary">Seller Information</h4>
                  <p><strong>Name:</strong> {sellerInfo.name}</p>
                  <p><strong>Contact:</strong> {sellerInfo.phone}</p>
                  <p><strong>Email:</strong> {sellerInfo.email}</p>
                </div>
              )}

              {userRole !== "seller" && (
                <button className="btn btn-primary btn-lg w-100 mt-3 shadow" onClick={openBidModal}>
                  Place Bid
                </button>
              )}
            </div>

            {/* Full-width Vehicle Specifications */}
            <div className="col-12 mt-5">
              <h3 className="mb-3">Vehicle Specifications</h3>
              <table className="table table-hover shadow-sm">
                <tbody>
                  <tr><th>Make</th><td>{auctionDetails.company}</td></tr>
                  <tr><th>Model</th><td>{auctionDetails.model} ({auctionDetails.manufacture_year || "N/A"})</td></tr>
                  <tr><th>Owner</th><td>{auctionDetails.owner_history}</td></tr>
                  <tr><th>Kilometers</th><td>{auctionDetails.kilometers}</td></tr>
                  <tr><th>Fuel Type</th><td>{auctionDetails.fuel_type || "N/A"}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-center">No auctions found.</p>
        )}
      </div>

      {/* Bootstrap Modal */}
      <div className="modal fade" ref={bidModalRef} id="bidModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Place Your Bid</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form id="bidForm" onSubmit={handleBidSubmit}>
                <div className="mb-3">
                  <label htmlFor={`Fname`} className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="Fname"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor={`Lname`} className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id={`Lname`}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor={`bidPrice`} className="form-label">
                    Bid Price (₹{minPrice} - ₹{maxPrice}) 
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="bidPrice"
                    value={bidPrice}
                    onChange={(e) => setBidPrice(e.target.value)}
                    min={minPrice}
                    max={maxPrice}
                    required
                  />
                </div>
                {/* Hidden Fields */}
                <input type="hidden" id="auction_id" value={auctionId} />
                <input type="hidden" id="buyerid" value={buyerId} />
                <input type="hidden" id="bid_time" value={bidTime} />
                <button type="submit" className="btn btn-success w-100">Submit Bid</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ViewNow;
