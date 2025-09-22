import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../styles/login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        // Handle HTTP errors
        const errorData = await response.json();
        alert(errorData.message || 'Login failed');
        return;
      }

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', data.userRole);
        localStorage.setItem('userName', data.userName);

        if (data.userRole === 'buyer') {
          localStorage.setItem('buyerId', data.buyerId);
          router.push('/');
        } else {
          localStorage.setItem('sellerId', data.sellerId);
          router.push('/');
        }
      } else {
        alert(data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error); // Improved error logging
      alert('An error occurred while logging in.');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <Head>
        <title>Login - RevUpBids</title>
      </Head>
      <div className={styles.loginBox}>
        <h1>Login to RevUpBids</h1>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            className={styles.formControl}
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className={styles.formControl}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className={styles.btnPrimary}>
            Login
          </button>
        </form>
        <p>
          <a href="/forget-password" className={styles.link}>Forgot Password?</a>
        </p>
        <p>
          Don't have an account?{' '}
          <a href="/register" className={styles.link}>Sign Up</a>
        </p>
      </div>
    </div>
  );
}