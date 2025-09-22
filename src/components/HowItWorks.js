import styles from '../styles/HowItWorks.module.css';

export default function HowItWorks() {
  const steps = [
    {
      image: '/images/register.svg',
      title: 'Register',
      description: 'Create your account now and start bidding on great deals'
    },
    {
      image: '/images/browse.svg',
      title: 'Browse',
      description: 'Explore our auctions and discover amazing items today!'
    },
    {
      image: '/images/bid.svg',
      title: 'Bid',
      description: 'Place your bids now on the items you truly love to own'
    },
    {
      image: '/images/win.svg',
      title: 'Win',
      description: 'Get notified instantly when you win an exciting auction'
    }
  ];

  return (
    <section className={styles.howItWorksSection}>
  <div className={styles.howItWorksContainer}>
    <h2 className={styles.sectionTitle}>How It Works</h2>
    <div className={styles.stepsContainer}>
      {steps.map((step, index) => (
        <div key={index} className={styles.stepCard}>
          <div className={styles.cardImageContainer}>
            <img src={step.image} alt={step.title} className={styles.cardImage} />
          </div>
          <div className={styles.cardBody}>
            <h3 className={styles.cardTitle}>{step.title}</h3>
            <p className={styles.cardText}>{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

  );
}
