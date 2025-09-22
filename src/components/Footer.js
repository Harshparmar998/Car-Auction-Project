import styles from '../styles/Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h4 className={styles.sectionTitle}>About Us</h4>
          <ul className={styles.footerLinks}>
            <li><a href="/about">Our Story</a></li>
            <li><a href="/about">Careers</a></li>
            <li><a href="/about">Press</a></li>
          </ul>
        </div>
        <div className={styles.footerSection}>
          <h4 className={styles.sectionTitle}>Help</h4>
          <ul className={styles.footerLinks}>
            <li><a href="/#FAQ">FAQ</a></li>
            <li><a href="/contact">Support</a></li>
            <li><a href="/contact">Contact Us</a></li>
          </ul>
        </div>
        <div className={styles.footerSection}>
          <h4 className={styles.sectionTitle}>Legal</h4>
          <ul className={styles.footerLinks}>
            <li><a href="/terms">Terms of Service</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
          </ul>
        </div>
        <div className={styles.footerSection}>
          <h4 className={styles.sectionTitle}>Follow Us</h4>
          <div className={styles.socialIcons}>
            <a href="#" className={styles.socialIcon}>Facebook</a>
            <a href="#" className={styles.socialIcon}>Twitter</a>
            <a href="#" className={styles.socialIcon}>Instagram</a>
          </div>
          <div className={styles.newsletterForm}>
            <input
              type="email"
              className={styles.newsletterInput}
              placeholder="Enter your email"
            />
            <button className={styles.newsletterButton}>Subscribe</button>
          </div>
        </div>
      </div>
      <div className={styles.footerBottom}>
        © {new Date().getFullYear()} RevUpBids. All rights reserved.
      </div>
    </footer>
  );
}
