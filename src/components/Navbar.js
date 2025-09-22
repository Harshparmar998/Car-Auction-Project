import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Navbar.module.css';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    setIsLoggedIn(!!loggedIn);
    if (loggedIn) {
      setUserRole(role); 
      setUserName(name);
    }
  }, []);

  const handleLogout = async () => {
    // Clear only the relevant keys
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('sellerId'); // Clear seller ID
    localStorage.removeItem('buyerId'); // Clear buyer ID
  
    // Update state
    setIsLoggedIn(false);
    setUserRole('');
    setUserName('');
  
    alert('You have been logged out.');
  
    // Ensure navigation happens
    await router.push('/');
  };
  
  const toggleSidebar = (e) => {
    e.stopPropagation(); // Prevent click from propagating to the document
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(`.${styles.sidebar}`) && !e.target.closest(`.${styles.moreButton}`)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search-results?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarBrand}>
        <a href="/">RevUpBids</a>
        <div className={styles.searchContainer}>
        <input
            type="text"
            placeholder="Search..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className={styles.searchButton} onClick={handleSearch}>Search</button>
        </div>
      </div>

      <div className={styles.navActions}>
        {isLoggedIn ? (
          <>
            <span className={styles.greeting}>
              Welcome, {userName || (userRole === 'seller' ? 'Seller' : 'Buyer')}
            </span>
            {userRole === 'buyer' && (
              <button className={styles.actionButton} onClick={() => router.push('/buy-car')}>
                Buy Car
              </button>
            )}
            {userRole === 'seller' && (
              <button className={styles.actionButton} onClick={() => router.push('/sellcar')}>
                Sell Car
              </button>
            )}
            <button className={styles.moreButton} onClick={toggleSidebar}>
              More
            </button>
          </>
        ) : (
          <>
            <button className={styles.loginButton} onClick={() => router.push('/login')}>
              Login
            </button>
            <button className={styles.signupButton} onClick={() => router.push('/register')}>
              Sign Up
            </button>
          </>
        )}
      </div>

      {sidebarOpen && (
        <div className={styles.sidebar}>
          {userRole === 'buyer' && (
            <a href="my-bids" className={styles.sidebarItem}>
              My Bids
            </a>
          )}
          {userRole === 'seller' && (
            <a href="myauction" className={styles.sidebarItem}>
              My Auctions
            </a>
          )}
          <a href="/profile" className={styles.sidebarItem}>My Profile</a>
          <a href="/payment" className={styles.sidebarItem}>Payment</a>
          <a href="/about" className={styles.sidebarItem}>About Us</a>
          <a href="/contact" className={styles.sidebarItem}>Contact Us</a>
          <a href="/feedback" className={styles.sidebarItem}>Feedback</a>
          <a href="/login" className={styles.sidebarItem} onClick={handleLogout}>Logout</a>
        </div>

      )}
    </nav>
  
  );
}
