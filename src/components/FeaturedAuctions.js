'use client';

import { useEffect, useState } from 'react';
import styles from '../styles/FeaturedAuctions.module.css';

const FeaturedAuctions = () => {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/api/featured-auctions')
            .then((response) => response.json())
            .then((data) => {
                console.log('Featured auctions:', data);
                if (data.success) {
                    
                    setAuctions(data.result);
                } else {
                    setError('No featured auctions available.');
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching auctions:', err);
                setError('Failed to load auctions.');
                setLoading(false);
            });
    }, []);

    return (
        <div className={styles.featuredAuctionsContainer}>
            <h2 className={styles.auctionSectionTitle}>Featured Auctions</h2>

            {error && <p className={styles.textDanger}>{error}</p>}

            <div className="row mt-4">
                {loading ? (
                    <p className="text-center">Loading featured auctions...</p>
                ) : auctions.length === 0 ? (
                    <p className="text-center">No featured auctions available.</p>
                ) : (
                    <div className={styles.auctionRow}>
                        {auctions.map((auction, index) => (
                            <div key={auction.id || index} className={styles.auctionCard}>  
                                <div className={`card ${styles.featuredAuctionCard}`}>
                                    <img
                                        src={`/uploads/${auction.image_path || 'default.jpg'}`} // Ensure image exists
                                        alt={auction.car_title || 'Car Image'}
                                        className={`card-img-top ${styles.auctionImage}`}
                                    />
                                    <div className="card-body">
                                        <h5 className="card-title">{auction.car_title}</h5>
                                        <ul className="list-group list-group-flush">
                                            <li className="list-group-item"><strong>Kilometers:</strong> {auction.kilometers} km</li>
                                            <li className="list-group-item"><strong>Fuel Type:</strong> {auction.fuel_type}</li>
                                            <li className="list-group-item">
                                                <strong>Min Price:</strong> ₹
                                                {auction.min_price ? auction.min_price.toLocaleString() : 'N/A'}
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeaturedAuctions;
