import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "../styles/paymentSuccess.module.css";

export default function PaymentSuccess() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { bidId, auctionId, paymentId } = router.query;

  useEffect(() => {
      if (bidId && auctionId && paymentId) {
          confirmPayment();
      }
  }, [bidId, auctionId, paymentId]);
  
  const confirmPayment = async () => {
      try {
          const response = await fetch("/api/confirmPayment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ bidId, auctionId, paymentId }),
          });
  
          const data = await response.json();
          if (!data.success) {
              throw new Error(data.message || "Payment confirmation failed.");
          }
          setLoading(false);
      } catch (err) {
          setError(err.message);
          setLoading(false);
      }
  };
  
  return (
    <div className={styles.container}>
      <Navbar />
      <div className={`container text-center my-5 ${styles.content}`}>
        {loading ? (
          <p className={styles.loading}>Processing payment...</p>
        ) : error ? (
          <div className={styles.error}>
            <h2>Payment Failed</h2>
            <p>{error}</p>
            <Link href="/my-bids" className="btn btn-danger mt-3">Go Back</Link>
          </div>
        ) : (
          <div className={styles.success}>
            <h2>🎉 Payment Successful!</h2>
            <p>Your bid (ID: {bidId}) for auction (ID: {auctionId}) has been processed.</p>
            <Link href="/my-bids" className={`btn btn-primary mt-3 ${styles.viewbtn}`}>
              View My Bids
            </Link>
            <Link href="/feedback" className={`btn btn-primary mt-3 ${styles.feedback}`}>
              Feedback
            </Link>

          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
