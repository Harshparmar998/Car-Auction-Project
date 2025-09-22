import { useState } from 'react';
import styles from '../styles/FAQ.module.css';

const faqs = [
  {
    question: 'How do I participate in an auction?',
    answer: 'To participate in an auction, you first need to log in or register on our platform. Once logged in, browse the available car auctions, select your desired car, and click on "Place Bid." Your bid will then be successfully submitted for the auction. '
  },
  {
    question: 'Is there a fee to join?',
    answer: 'Yes, joining is completely free! However, to place a bid on an auction, you must first register or log in to your account. This ensures a secure and verified bidding process..'
  },
  {
    question: 'How do I know if I won an auction?',
    answer: 'Once the seller approves your bid, you will receive a notification confirming that your bid has been approved. After approval, you must pay a token amount within 3 days to confirm your purchase. Failure to make the payment within the given time may result in the bid being canceled.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept payments through Razorpay, which allows you to pay using credit/debit cards, UPI, net banking, and popular digital wallets. This ensures a secure and seamless transaction process for all buyers.'
  },
  {
    question: 'Can I cancel a bid?',
    answer: 'Yes, you can withdraw your bid before it is approved by the seller. However, once the seller approves your bid, it becomes final and cannot be canceled. Make sure to review your bid carefully before placing it.'
  }
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="FAQ" className={styles.faqSection}>
      <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
      <div className={styles.faqContainer}>
        {faqs.map((faq, index) => (
          <div 
            key={index}
            className={`${styles.faqItem} ${activeIndex === index ? styles.active : ''}`}
          >
            <div 
              className={styles.faqQuestion}
              onClick={() => toggleFAQ(index)}
            >
              <div className={styles.questionText}>{faq.question}</div>
              <div className={styles.arrowIcon}>▼</div>
            </div>
            <div className={styles.faqAnswer}>
              {faq.answer}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
