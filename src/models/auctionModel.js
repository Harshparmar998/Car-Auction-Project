export const fetchAuctionDetails = async (carId) => {
    try {
      const res = await fetch(`/api/viewnow?carid=${carId}`);
      const data = await res.json();
      return data || null;
    } catch (error) {
      console.error("Error fetching auction details:", error);
      return null;
    }
  };
  
  export const fetchSellerDetails = async (sellerId) => {
    try {
      const res = await fetch(`/api/sellerdetails?sellerid=${sellerId}`);
      const data = await res.json();
      return res.ok ? data.seller : null;
    } catch (error) {
      console.error("Error fetching seller details:", error);
      return null;
    }
  };
  
  export const placeBid = (userRole, auctionId) => {
    if (!userRole) {
      alert("Please log in to place a bid.");
      window.location.href = "/buyer-panel/html/login.html";
      return;
    }
  
    if (userRole === "seller") {
      alert("Sellers are not allowed to place bids.");
      return;
    }
  
    alert(`Proceeding to place bid for auction ID: ${auctionId}`);
  };
  