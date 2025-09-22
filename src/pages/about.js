import Head from "next/head";
import Image from "next/image";
import Navbar from "../components/Navbar";
import styles from "../styles/about.module.css";

export default function AboutUs() {
  return (
    <div>
      <Navbar/>
      <div className={styles.aboutContainer}>
      <Head>
        <title>About Us - RevUpBids</title>
        <meta name="description" content="Learn more about RevUpBids and our mission." />
      </Head>

      <div className={styles.headerSection}>
        <h1>About Us</h1>
        <p>Committed to Excellence</p>
      </div>
      
      <div className={styles.aboutContent}>
        <div className={styles.textSection}>
          <h3>Who We Are</h3>
          <p>
            At RevUpBids, we aim to revolutionize the online car auction industry
            by providing a transparent, secure, and seamless experience for both
            buyers and sellers.
          </p>
        </div>
        <div className={styles.imageSection}>
          <Image src="/images/carousel1.jpg" alt="Our Team" width={500} height={300} className={styles.image} />
        </div>
      </div>
      
      <div className={styles.valuesSection}>
        <h3>Our Core Values</h3>
        <div className={styles.valuesContainer}>
          <div className={styles.valueItem}>
            <h4>Integrity</h4>
            <p>We uphold the highest ethical standards in all our transactions.</p>
          </div>
          <div className={styles.valueItem}>
            <h4>Customer-Centric</h4>
            <p>Our platform is designed with user experience as our top priority.</p>
          </div>
          <div className={styles.valueItem}>
            <h4>Innovation</h4>
            <p>We constantly enhance our services with the latest technology.</p>
          </div>
        </div>
      </div>
      
      <div className={styles.teamSection}>
        <h3>Meet Our Team</h3>
        <div className={styles.teamContainer}>
          <div className={styles.teamMember}>
            <Image src="/images/images/men1.jpeg" alt="Harsh Parmar" width={100} height={100} className={styles.teamImage} />
            <h5>Harsh Parmar</h5>
            <p>Backend & Frontend Developer</p>
          </div>
          <div className={styles.teamMember}>
            <Image src="/images/images/women2.jpeg" alt="Vaidarbhi Chavda" width={100} height={100} className={styles.teamImage} />
            <h5>Vaidarbhi Chavda</h5>
            <p>Frontend & Backend Developer</p>
          </div>
          <div className={styles.teamMember}>
            <Image src="/images/images/women2.jpeg" alt="Nirali Patel" width={100} height={100} className={styles.teamImage} />
            <h5>Nirali Patel</h5>
            <p>Designing Expert</p>
          </div>
        </div>
      </div>
      
      <div className={styles.contactSection}>
        <h3>Want to Know More?</h3>
        <p>Contact us for more details.</p>
        <a href="/contact" className={styles.contactButton}>Contact Us</a>
      </div>
    </div>
    </div>
    
  );
}