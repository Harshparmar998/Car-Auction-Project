"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "../styles/mybids.module.css";

export default function YourBids() {
  const [bids, setBids] = useState([]);
  const [totalBids, setTotalBids] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const router = useRouter();
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    fetchTotalBids();
  }, []);

  useEffect(() => {
    fetchBids(currentPage, pageSize);
  }, [currentPage]);

  useEffect(() => {
    const loadRazorpayScript = () => {
      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => setRazorpayLoaded(true);
        script.onerror = () => console.error("Failed to load Razorpay script.");
        document.body.appendChild(script);
      } else {
        setRazorpayLoaded(true);
      }
    };

    loadRazorpayScript();
  }, []);

  const fetchTotalBids = async () => {
    try {
      const response = await fetch("/api/getTotalBids");
      if (!response.ok) {
        console.error("Failed to fetch total bids.");
        return;
      }
      const data = await response.json();
      setTotalBids(data.total_bids || 0);
    } catch (error) {
      console.error("Error fetching total bids:", error);
    }
  };

  const fetchBids = async (page, pageSize) => {
    const buyerId = localStorage.getItem("buyerId");
    try {
      const response = await fetch(`/api/getPaginatedBids?page=${page}&pageSize=${pageSize}&buyerId=${buyerId}`);
      if (!response.ok) {
        console.error("Failed to fetch bids.");
        return;
      }
      const data = await response.json();
      setBids(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching bids:", error);
    }
  };

  const totalPages = Math.ceil(totalBids / pageSize);

  const payNow = async (bidId, auctionId, amount) => {
    try {
        const response = await fetch("/api/createOrder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                amount: amount * 0.02, // 10% payment
                currency: "INR",
                receipt: `receipt_${bidId}`,
            }),
        });

        const data = await response.json();
        if (!data.success) {
            alert("Payment initialization failed: " + data.message);
            return;
        }

        const options = {
          key: "rzp_test_Prbw0kZivKFUWj",
          amount: data.order.amount,
          currency: data.order.currency,
          name: "Your Auction",
          description: "Car Auction Payment",
          order_id: data.order.id,
          handler: function (response) {
              alert("Payment Successful!");
              window.location.href = `/payment-success?bidId=${bidId}&auctionId=${auctionId}&paymentId=${response.razorpay_payment_id}`;
          },
          prefill: {
              name: "User",
              email: "user@example.com",
              contact: "9999999999",
          },
          theme: {
              color: "#007bff",
          },
      };
      
      const razor = new window.Razorpay(options);
      razor.open();
      
    } catch (error) {
        console.error("Error in payment process:", error);
        alert("Payment failed. Please try again.");
    }
};
  

  const withdrawBid = async (bidId, auctionId) => {
    if (!bidId || !auctionId) {
      console.error("Missing bidId or auctionId:", { bidId, auctionId });
      alert("Bid ID and Auction ID are required.");
      return;
    }

    if (window.confirm("Are you sure you want to withdraw this bid?")) {
      try {
        const result = await updateBidStatus(bidId, auctionId, "Withdrawn");
        if (result.success) {
          alert(result.message);
          fetchBids(currentPage, pageSize); // Refresh bids list
          fetchTotalBids(); // Update pagination if needed
        } else {
          alert("Failed to withdraw bid: " + result.message);
        }
      } catch (error) {
        console.error("Error withdrawing bid:", error);
        alert("An error occurred while withdrawing the bid.");
      }
    }
  };

  const updateBidStatus = async (bidId, auctionId, status) => {
    try {
      const response = await fetch("/api/updateBidStatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bidId, auctionId, status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update bid status");
      }

      return await response.json();
    } catch (error) {
      console.error("Error in updateBidStatus:", error);
      throw error;
    }
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={`container my-5 ${styles.bidsContainer}`}>
        <h2 className={`text-center mb-4 ${styles.heading}`}>Your Placed Bids</h2>

        {/* Bids Table */}
        <div className="table-responsive">
          <table className={`table table-striped table-bordered table-hover ${styles.table}`}>
            <thead className="thead-light">
              <tr>
                <th scope="col">Car Image</th>
                <th scope="col">Car Name</th>
                <th scope="col">Bid Amount</th>
                <th scope="col">Bid Status</th>
                <th scope="col">Bid Place Date</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bids.length > 0 ? (
                bids.map((bid) => (
                  <tr key={bid.bidid} className={styles.row}>
                    <td>
                      <img
                        src={bid.image_path.startsWith("http") ? bid.image_path : `/uploads/${bid.image_path}`}
                        alt="Car"
                        className={`img-fluid rounded-3 ${styles.carImage}`}
                        style={{ width: "120px", height: "80px", objectFit: "cover" }}
                      />
                    </td>
                    <td className={styles.carDetails}>
                      <strong>
                        {bid.company} {bid.model} ({bid.color})
                      </strong>
                    </td>
                    <td className={`text-primary ${styles.bidAmount}`}>₹{bid.bid_price}</td>
                    <td>
                      <span className={`badge bg-warning text-dark ${styles.bidStatus}`}>
                        {bid.bid_status}
                      </span>
                    </td>
                    <td className={styles.bidDate}>{new Date(bid.bid_time).toLocaleString()}</td>
                    <td>
                    {bid.bid_status === "Approved" ? (
                      <button
                        className={`btn btn-outline-success btn-sm ${styles.payNowBtn}`}
                        onClick={() => payNow(bid.bidid, bid.auction_id, bid.bid_price)}
                      >
                       Pay 2% (₹{(bid.bid_price * 0.02).toFixed(2)})
                      </button>
                    ) : bid.bid_status === "Pending" ? (
                      <button
                        className={`btn btn-outline-danger btn-sm ${styles.withdrawBtn}`}
                        onClick={() => withdrawBid(bid.bidid, bid.auction_id)}
                      >
                        Withdraw Bid
                      </button>
                    ) : (
                      <span className="text-muted">N/A</span> // Shows "N/A" for other statuses like "Withdrawn"
                    )}
                  </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className={`text-center ${styles.noBids}`}>
                    No bids found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav>
            <ul className={`pagination justify-content-center ${styles.pagination}`}>
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                  Previous
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => (
                <li key={i} className={`page-item ${i + 1 === currentPage ? "active" : ""} ${styles.pageItem}`}>
                  <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                    {i + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                  Next
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
      <Footer />
    </div>
  );
}
