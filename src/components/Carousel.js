import { useState, useEffect } from 'react';
import styles from '../styles/Carousel.module.css';
import { useRouter } from "next/router";

export default function Carousel() {
  const router = useRouter();

  const slides = [
    {
      image: '/images/banner1.jpg',
      title: 'Discover Amazing Auctions',
      description: 'Find unique items and great deals',
    },
    {
      image: '/images/banner2.jpg',
      title: 'Bid and Win Big',
      description: 'Join our exciting auctions today',
    },
    {
      image: '/images/banner3.jpg',
      title: 'Trusted Platform',
      description: 'Secure and reliable bidding experience',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Function to move to the next slide
  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
  };

  // Automatically switch slides every 1 second
  useEffect(() => {
    const interval = setInterval(nextSlide, 3000); // Slide every 1 second
    return () => clearInterval(interval); // Clear the interval on component unmount
  }, [currentSlide]); // Ensure the interval updates correctly

  return (
    <div className={styles.carousel}>
      <div className={styles.carouselInner} style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
        {slides.map((slide, index) => (
          <div key={index} className={styles.carouselItem}>
            <img src={slide.image} alt={slide.title} className={styles.carouselImage} />
            <div className={styles.carouselCaption}>
              <h5>{slide.title}</h5>
              <p>{slide.description}</p>
              <button className={styles.carouselButton}
              onClick={() => {
                router.push(`/buy-car`);
              }}
              >View All Auctions</button>
            </div>
          </div>
        ))}
      </div>
      <button
        className={styles.carouselControlPrev}
        onClick={() => setCurrentSlide((currentSlide - 1 + slides.length) % slides.length)}
      >
        {'<'}
      </button>
      <button
        className={styles.carouselControlNext}
        onClick={() => setCurrentSlide((currentSlide + 1) % slides.length)}
      >
        {'>'}
      </button>
    </div>
  );
}
