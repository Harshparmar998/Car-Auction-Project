'use client';

import { useEffect, useState } from 'react';
import styles from '../styles/LiveAuctions.module.css';

const AuctionPage = () => {
    const [liveAuctions, setLiveAuctions] = useState([]);
    const [upcomingAuctions, setUpcomingAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('live');

    useEffect(() => {
        fetch('/api/LiveAuctions')
            .then(response => response.json())
            .then(data => {
                setLiveAuctions(data.liveAuctions || []);
                setUpcomingAuctions(data.upcomingAuctions || []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching auctions:", err);
                setError('Failed to fetch auction data. Please try again later.');
                setLoading(false);
            });
    }, []);

    const AuctionCard = ({ auction, includeButtons, isLive }) => {
        const [timeLeft, setTimeLeft] = useState('Loading...');
        const [currentIndex, setCurrentIndex] = useState(0);
        const totalImages = auction.car_images.length;

        // Timer Effect
        useEffect(() => {
            if (!auction.auction_end_time) {
                setTimeLeft("Not Started");
                return;
            }

            const endTime = new Date(auction.auction_end_time).getTime();

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
        }, [auction.auction_end_time]);

        // Carousel Navigation
        const handlePrev = () => {
            if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
        };

        const handleNext = () => {
            if (currentIndex < totalImages - 1) setCurrentIndex(currentIndex + 1);
        };

        return (
            <div className="col-md-4 col-sm-6">
                <div className={styles.auctionCard}>
                    <div className="carousel slide">
                        <div className="carousel-inner">
                            {auction.car_images.map((image, index) => (
                                <div key={index} className={`carousel-item ${index === currentIndex ? 'active' : ''}`}>
                                    <img src={`/uploads/${image}`} className="d-block w-100" style={{ height: "200px", objectFit: "cover", width: "100%" }} alt="Car Image" />
                                </div>
                            ))}
                        </div>

                        {/* Dynamic Carousel Controls */}
                        {currentIndex > 0 && (
                            <button className="carousel-control-prev" type="button" onClick={handlePrev}>
                                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                            </button>
                        )}
                        
                        {currentIndex < totalImages - 1 && (
                            <button className="carousel-control-next" type="button" onClick={handleNext}>
                                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                            </button>
                        )}
                    </div>

                    <div className={styles.cardBody}>
                        <h5 className={styles.cardTitle}>{auction.company} {auction.model} ({auction.color})</h5>
                        <p className={styles.cardText}>Starting Bid: {auction.min_price}</p>
                        {isLive && <p className={styles.cardText}>Total Bids: {auction.total_bids}</p>}
                        {isLive && <p className={styles.textDanger}><strong>Time Left: </strong>{timeLeft}</p>}
                        {includeButtons && (
                            <div className={styles.buttonGroup}>
                                <a href={`/buy-car?car_id=${auction.id}`} className={styles.btnView}>View Now</a>
                                <a href={`/buy-car?car_id=${auction.id}`} className={styles.btnBid}>Place Bid</a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.auctionSectionTitle}>Car Auctions</h2>

            {/* Tabs */}
            <ul className={`nav nav-tabs ${styles.navTabs}`}>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'live' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('live')}>
                        Live Auctions
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'upcoming' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('upcoming')}>
                        Upcoming Auctions
                    </button>
                </li>
            </ul>

            {/* Auction Content */}
            <div className="tab-content">
                {error && <p className={styles.textDanger}>{error}</p>}

                {/* Live Auctions */}
                {activeTab === 'live' && (
                    <div className="row mt-4">
                        {loading ? <p className="text-center">Loading auctions...</p> :
                            liveAuctions.length === 0 ? <p className="text-center">No live auctions found.</p> :
                                liveAuctions.map(auction => <AuctionCard key={auction.id} auction={auction} includeButtons={true} isLive={true} />)}
                    </div>
                )}

                {/* Upcoming Auctions */}
                {activeTab === 'upcoming' && (
                    <div className="row mt-4">
                        {loading ? <p className="text-center">Loading auctions...</p> :
                            upcomingAuctions.length === 0 ? <p className="text-center">No upcoming auctions found.</p> :
                                upcomingAuctions.map(auction => <AuctionCard key={auction.id} auction={auction} includeButtons={false} isLive={false} />)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuctionPage;