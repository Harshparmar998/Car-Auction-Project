import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import styles from '../styles/SearchResults.module.css';

export default function SearchResults() {
  const router = useRouter();
  const { query } = router.query;
  const [searchResults, setSearchResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentIndex, setCurrentIndex] = useState({}); // Store current image index per auction

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/search?query=${query}`);
        const data = await res.json();
        console.log(data);
        if (!res.ok) {
          setSearchResults([]);
          setErrorMessage(data.message || 'No results found.');
        } else {
          setSearchResults(data[0]);
          setErrorMessage('');
        }
      } catch (error) {
        setSearchResults([]);
        setErrorMessage('Error fetching search results.');
      }
    };

    fetchResults();
  }, [query]);

  // Carousel Navigation
  const handlePrev = (id) => {
    setCurrentIndex((prevIndex) => ({
      ...prevIndex,
      [id]: Math.max((prevIndex[id] || 0) - 1, 0),
    }));
  };

  const handleNext = (id, total) => {
    setCurrentIndex((prevIndex) => ({
      ...prevIndex,
      [id]: Math.min((prevIndex[id] || 0) + 1, total - 1),
    }));
  };

  return (
    <div>
        <Navbar></Navbar>
    <div className={styles.container}>
      <h1>Search Results for: "{query}"</h1>

      {errorMessage && <p className={styles.error}>{errorMessage}</p>}

      {searchResults.length > 0 ? (
        <div className="row">
          {searchResults.map((auction) => {
            const images = auction.car_images ? auction.car_images.split(',') : [];
            const totalImages = images.length;
            const currentImgIndex = currentIndex[auction.id] || 0;

            return (
              <div key={auction.id} className="col-md-4 col-sm-6">
                <div className={styles.auctionCard}>
                  <div className="carousel slide">
                    <div className="carousel-inner">
                      {images.map((image, index) => (
                        <div key={index} className={`carousel-item ${index === currentImgIndex ? 'active' : ''}`}>
                          <img
                            src={`/uploads/${image}`}
                            className="d-block w-100"
                            style={{ height: "200px", objectFit: "cover", width: "100%" }}
                            alt="Car"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Dynamic Carousel Controls */}
                    {currentImgIndex > 0 && (
                      <button className="carousel-control-prev" type="button" onClick={() => handlePrev(auction.id)}>
                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                      </button>
                    )}

                    {currentImgIndex < totalImages - 1 && (
                      <button className="carousel-control-next" type="button" onClick={() => handleNext(auction.id, totalImages)}>
                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                      </button>
                    )}  
                  </div>

                  <div className={styles.cardBody}>
                    <h5 className={styles.cardTitle}>{auction.company} {auction.model} ({auction.color})</h5>
                    <p className={styles.cardText}>Starting Bid: ₹{auction.min_price}</p>
                    <p className={styles.cardText}>Highest Bid: ₹{auction.highest_bid}</p>

                    <div className={styles.buttonGroup}>
                      <a href={`/buy-car?car_id=${auction.id}`} className={styles.btnView}>View Now</a>
                      <a href={`/buy-car?car_id=${auction.id}`} className={styles.btnBid}>Place Bid</a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className={styles.noResults}>No cars found.</p>
      )}
    </div>
    <Footer></Footer>
    </div>
  );
}