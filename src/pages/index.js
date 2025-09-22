import styles from '../styles/Home.module.css';
import Navbar from '../components/Navbar';
import Carousel from '../components/Carousel';
import LiveAuctions from "../components/LiveAuctions";
import HowItWorks from '../components/HowItWorks';
import FeaturedAuctions from '../components/FeaturedAuctions';
import PopularBrands from '../components/PopularBrands';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';




const mockAuctions = [
  {
    image: '/images/ford_mustang.jpg',
    title: 'Vintage Camera',
    description: 'Rare 1950s vintage camera in excellent condition',
    timeLeft: '2h 45m'
  },
  {
    image: '/images/luxury_sedan.jpeg',
    title: 'Antique Watch',
    description: 'Luxury Swiss watch from the 1920s',
    timeLeft: '1h 30m'
  },
  {
    image: '/images/toyota_corolla.png',
    title: 'Art Painting',
    description: 'Original oil painting by a renowned artist',
    timeLeft: '4h 15m'
  }
];

export default function Home() {
  return (
    <div className={styles.main}>
      <Navbar />
      <Carousel />
      <LiveAuctions/>
      <HowItWorks />
      <FeaturedAuctions auctions={mockAuctions} />
      <PopularBrands />
      <FAQ />
      <Footer />
    </div>
  );
}
