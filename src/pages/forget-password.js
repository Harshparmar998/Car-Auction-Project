import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../styles/forget.module.css'; // Reusing login styles

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/forget-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
      } else {
        alert(data.message || 'Failed to send reset link.');
      }
    } catch (error) {
      console.error('Forgot Password error:', error);
      alert('An error occurred. Please try again later.');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <Head>
        <title>Forgot Password - RevUpBids</title>
      </Head>
      <div className={styles.loginBox}>
        <h1 className={styles.textbox}>Forgot Password</h1>
        {message && <p className={styles.message}>{message}</p>}
        <form onSubmit={handleForgotPassword}>
          <input
            type="email"
            className={styles.formControl}
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className={styles.btnPrimary}>
            Send Reset Link
          </button>
        </form>
        <p className={styles.backbtn}>
          <a href="/login" className={styles.link}>Back to Login</a>
        </p>
      </div>
    </div>
  );
}
