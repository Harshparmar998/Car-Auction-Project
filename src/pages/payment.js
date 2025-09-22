"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "../styles/payments.module.css";

export default function PaymentsPage() {
  const [bids, setBids] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [isSeller, setIsSeller] = useState(false);
  const router = useRouter();
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    // Check if user is a seller or buyer
    const sellerId = localStorage.getItem("sellerId");
    setIsSeller(!!sellerId);

    if (sellerId) {
      fetchSellerPaymentHistory();
    } else {
      fetchBuyerPaymentHistory();
      fetchApprovedBids();
    }
  }, []);

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

  const fetchApprovedBids = async () => {
    const buyerId = localStorage.getItem("buyerId");
    try {
      const response = await fetch(`/api/getApprovedBids?buyerId=${buyerId}`);
      if (!response.ok) {
        console.error("Failed to fetch approved bids.");
        return;
      }
      const data = await response.json();
      setBids(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching approved bids:", error);
    }
  };

  const fetchBuyerPaymentHistory = async () => {
    const buyerId = localStorage.getItem("buyerId");
    try {
      const response = await fetch(`/api/getBuyerPaymentHistory?buyerId=${buyerId}`);
      if (!response.ok) {
        console.error("Failed to fetch buyer payment history.");
        return;
      }
      const data = await response.json();
      console.log(data);
      setPaymentHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching buyer payment history:", error);
    }
  };

  const fetchSellerPaymentHistory = async () => {
    const sellerId = localStorage.getItem("sellerId");
    try {
      const response = await fetch(`/api/getSellerPaymentHistory?sellerId=${sellerId}`);
      if (!response.ok) {
        console.error("Failed to fetch seller payment history.");
        return;
      }
      const data = await response.json();
      setPaymentHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching seller payment history:", error);
    }
  };

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
        name: "Car Auction",
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

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={`container my-5 ${styles.bidsContainer}`}>

        {/* Buyer View: Show Approved Bids */}
        {!isSeller && (
          <>
            <h3 className={`text-center mt-4 ${styles.heading}`}>Approved Bids</h3>
            <div className="table-responsive">
              <table className={`table table-striped table-bordered table-hover ${styles.table}`}>
                <thead className="thead-light">
                  <tr>
                    <th>Car Image</th>
                    <th>Car Name</th>
                    <th>Bid Amount</th>
                    <th>Bid Status</th>
                    <th>Bid Place Date</th>
                    <th>Actions</th>
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
                          <strong>{bid.company} {bid.model} ({bid.color})</strong>
                        </td>
                        <td className={`text-primary ${styles.bidAmount}`}>₹{bid.bid_price}</td>
                        <td>
                          <span className={`badge bg-success text-white ${styles.bidStatus}`}>Approved</span>
                        </td>
                        <td className={styles.bidDate}>{new Date(bid.bid_time).toLocaleString()}</td>
                        <td>
                          <button
                            className={`btn btn-outline-success btn-sm ${styles.payNowBtn}`}
                            onClick={() => payNow(bid.bidid, bid.auction_id, bid.bid_price)}
                          >
                            Pay 2% (₹{(bid.bid_price * 0.02).toFixed(2)})
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className={`text-center ${styles.noBids}`}>
                        No approved bids found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Payment History (Buyer or Seller) */}
        <h3 className={`text-center mt-4 ${styles.heading}`}>
          {isSeller ? "Seller Payment History" : "Buyer Payment History"}
        </h3>
        <div className="table-responsive">
              <table className={`table table-striped table-bordered table-hover ${styles.table}`}>
                <thead className="thead-light">
                  <tr>
                    <th>Car Image</th>
                    <th>Car Name</th>
                    <th>Bid Amount</th>
                    <th>Bid Status</th>
                    <th>Bid Place Date</th>
                    <th>Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.length > 0 ? (
                    paymentHistory.map((bid) => (
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
                          <strong>{bid.company} {bid.model} ({bid.color})</strong>
                        </td>
                        <td className={`text-primary ${styles.bidAmount}`}>₹{bid.bid_price}</td>
                        <td>
                          <span className={`badge bg-success text-white ${styles.bidStatus}`}>{bid.bid_status}</span>
                        </td>
                        <td className={styles.bidDate}>{new Date(bid.bid_time).toLocaleString()}</td>
                        <td>
                          <span className={`badge bg-success text-white ${styles.bidStatus}`}>{bid.payment_status}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className={`text-center ${styles.noBids}`}>
                        No Payment History found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
      </div>
      <Footer />
    </div>
  );
}
