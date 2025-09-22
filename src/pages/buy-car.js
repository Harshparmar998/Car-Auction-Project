"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "../styles/buy-car.module.css";
import { FaClock } from "react-icons/fa";

export default function BuyCar() {
    const router = useRouter(); // Define router
    const [auctions, setAuctions] = useState([]);
    const [filteredAuctions, setFilteredAuctions] = useState([]);
  

    useEffect(() => {
        fetch("/api/getActiveAuctions")
            .then(res => res.json())
            .then(data => {
                setAuctions(data.data || []);
                setFilteredAuctions(data.data || []);
            })
            .catch(err => console.error("Error fetching auctions:", err));
    }, []);


    const Timer = ({ endTime }) => {
        const [timeLeft, setTimeLeft] = useState("Loading...");

        useEffect(() => {
            if (!endTime) {
                setTimeLeft("Not Started");
                return;
            }

            const updateTimer = () => {
                const now = new Date().getTime();
                const auctionEnd = new Date(endTime).getTime();
                const timeRemaining = auctionEnd - now;

                if (timeRemaining <= 0) {
                    setTimeLeft("Auction Ended");
                    return;
                }

                const hours = String(Math.floor(timeRemaining / (1000 * 60 * 60))).padStart(2, "0");
                const minutes = String(Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, "0");
                const seconds = String(Math.floor((timeRemaining % (1000 * 60)) / 1000)).padStart(2, "0");

                setTimeLeft(`${hours}:${minutes}:${seconds}`);
            };

            updateTimer();
            const interval = setInterval(updateTimer, 1000);

            return () => clearInterval(interval);
        }, [endTime]);

        return (
            <span className={styles.timerText}>
                <FaClock className={styles.clockIcon} /> {timeLeft}
            </span>
        );
    };

    return (
        <div>
            <Navbar />
            <div className="container my-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1>Explore Auctions</h1>
                </div>

                <div className="row g-4">
                    {filteredAuctions.length === 0 ? (
                        <p className="text-center">No active auctions.</p>
                    ) : (
                        filteredAuctions.map(auction => (
                            <div className="col-md-4 col-sm-6" key={auction.id}>
                                <div className={`card ${styles.cardContainer}`}>
                                    <div className={styles.timerContainer}>
                                        <div id={`carousel-${auction.id}`} className="carousel slide" data-bs-ride="carousel">
                                            <div className="carousel-inner">
                                                {auction.car_images.map((img, index) => (
                                                    <div className={`carousel-item ${index === 0 ? "active" : ""}`} key={index}>
                                                        <img src={`/uploads/${img}`} className="d-block w-100" alt="Car" />
                                                    </div>
                                                ))}
                                            </div>
                                            <button className="carousel-control-prev" type="button" data-bs-target={`#carousel-${auction.id}`} data-bs-slide="prev">
                                                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                            </button>
                                            <button className="carousel-control-next" type="button" data-bs-target={`#carousel-${auction.id}`} data-bs-slide="next">
                                                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                            </button>
                                        </div>

                                        <div className={styles.timerChip}>
                                            <Timer endTime={auction.auction_end_time} />
                                        </div>
                                    </div>

                                    <div className="card-body">
                                        <h5 className="card-title">{auction.company} {auction.model} ({auction.color})</h5>
                                        <p className="card-text">Price: <strong>₹{auction.min_price}</strong></p>
                                        <p className="card-text text-muted">{auction.manufacture_year} • {auction.fuel_type} • {auction.kilometers} km</p>
                                        <button 
                                            className={`${styles.btnFull} ${styles.btnPrimary}`} 
                                            onClick={() => {
                                                router.push(`/view-now?carid=${auction.id}`);
                                                console.log(auction.id);
                                        }}
                                        >
                                            View Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}
