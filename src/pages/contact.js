import Head from "next/head";
import Navbar from "../components/Navbar";
import styles from "../styles/contact.module.css";

export default function Contact() {
  return (
    <div>
      <Navbar/>
      <div className={styles.contactContainer}>
      <Head>
        <title>Contact Us - RevUpBids</title>
        <meta name="description" content="Get in touch with RevUpBids for any inquiries or support." />
      </Head>

      <div className={styles.headerSection}>
        <h1>Contact Us</h1>
        <p>We’re here to help you</p>
      </div>

      <div className={styles.contactContent}>
        {/* Left Side - Contact Information */}
        <div className={styles.contactInfo}>
          <h3>Contact Information</h3>
          <p><strong>Address:</strong> D-903, Titanium Square, near Thaltej Metro Station, Ahmedabad</p>
          <p><strong>Phone:</strong> +91 9978587632</p>
          <p><strong>Email:</strong> RevUpBids@gmail.com</p>
          <p><strong>Working Hours:</strong> Mon - Fri: 11 AM - 8 PM</p>
        </div>

        {/* Right Side - Contact Form */}
        <div className={styles.formSection}>
          <h2>Send Us a Message</h2>
          <form className={styles.contactForm}>
            <div className={styles.inputGroup}>
              <label htmlFor="name">Full Name</label>
              <input type="text" id="name" placeholder="Enter your full name" />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" placeholder="Enter your email" />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="subject">Subject</label>
              <input type="text" id="subject" placeholder="Enter the subject" />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="message">Message</label>
              <textarea id="message" rows="5" placeholder="Enter your message"></textarea>
            </div>

            <button type="submit" className={styles.submitButton}>Send Message</button>
          </form>
        </div>
      </div>
    </div>

    </div>
  );
}