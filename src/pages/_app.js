import { useEffect } from "react";
import { Toaster } from "react-hot-toast";  // Import Toaster
import '../styles/globals.css';
import "bootstrap/dist/css/bootstrap.min.css";

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    fetch("/api/runAuctionChecker")
      .then(res => res.json())
      .then(data => console.log(data.message))
      .catch(err => console.error("Error starting auction checker:", err));
  }, []);

  return (
    <>
      <Toaster position="top-right" />  {/* Add Toaster for toast notifications */}
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
