import { useRouter } from 'next/router';
import styles from '../styles/PopularBrands.module.css';

const brands = [
  { name: 'BMW', logo: '/images/bmw-logo.jpeg' },
  { name: 'Ford', logo: '/images/ford-logo.jpeg' },
  { name: 'Honda', logo: '/images/honda-logo.jpeg' },
  { name: 'Mahindra', logo: '/images/mahindra-logo.jpeg' },
  { name: 'Toyota', logo: '/images/toyota-logo.jpeg' },
  { name: 'Hyundai', logo: '/images/hyundai-logo.jpeg' },
  { name: 'Skoda', logo: '/images/skoda-logo.png' },
  { name: 'Nissan', logo: '/images/Nissan-logo.jpg' },
  { name: 'Audi', logo: '/images/audi-logo.jpg' },
  { name: 'Tata', logo: '/images/tata-logo.jpg' },
  { name: 'Volkswagen', logo: '/images/volkswagen-logo.jpg' },
  { name: 'Mercedes-Benz', logo: '/images/mercedes-logo.jpg' },
];

export default function PopularBrands() {
  const router = useRouter();

  const handleBrandClick = (brandName) => {
    router.push(`/search-results?query=${encodeURIComponent(brandName)}`);
  };

  return (
    <section className={styles.popularBrandsSection}>
      <h2 className={styles.sectionTitle}>Popular Brands</h2>
      <div className={styles.sliderContainer}>
        <div className={styles.slider}>
          {brands.map((brand, index) => (
            <img
              key={index}
              src={brand.logo}
              alt={brand.name}
              className={styles.brandLogo}
              onClick={() => handleBrandClick(brand.name)}
              style={{ cursor: 'pointer' }}
            />
          ))}
          {/* Duplicate brands for infinite scrolling effect */}
          {brands.map((brand, index) => (
            <img
              key={`duplicate-${index}`}
              src={brand.logo}
              alt={brand.name}
              className={styles.brandLogo}
              onClick={() => handleBrandClick(brand.name)}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
