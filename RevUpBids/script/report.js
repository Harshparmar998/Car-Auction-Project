document.getElementById("generateReport").addEventListener("click", function() {
    const selectedReportType = document.querySelector('input[name="reportType"]:checked').value;
    if (selectedReportType === 'sales') {
      showModal('sales');
    } else if (selectedReportType === 'bids') {
      showModal('bids');
    } else if (selectedReportType === 'auctions') {
      showModal('auctions');
    } else if (selectedReportType === 'payments') {
      showModal('payments');
    }
  });
  
  function showModal(reportType) {
    if (reportType === 'sales') {
      document.getElementById('salesReportModal').style.display = "block";
    } else if (reportType === 'bids') {
      document.getElementById('bidsReportModal').style.display = "block";
    } else if (reportType === 'auctions') {
      document.getElementById('auctionsReportModal').style.display = "block";
    } else if (reportType === 'payments') {
      document.getElementById('paymentsReportModal').style.display = "block";
    }
  }
  
  // Close modal functions
  document.getElementById('closeSalesModal').addEventListener("click", function() {
    document.getElementById('salesReportModal').style.display = "none";
  });
  document.getElementById('closeBidsModal').addEventListener("click", function() {
    document.getElementById('bidsReportModal').style.display = "none";
  });
  document.getElementById('closeAuctionsModal').addEventListener("click", function() {
    document.getElementById('auctionsReportModal').style.display = "none";
  });
  document.getElementById('closePaymentsModal').addEventListener("click", function() {
    document.getElementById('paymentsReportModal').style.display = "none";
  });
  
  // Function to send data to the backend
async function sendDataToBackend(url, data) {
  try {
      const response = await fetch(url, {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
      });

      const result = await response.json();
      alert(result.message);
  } catch (error) {
      console.error("Error:", error);
      alert("Failed to save report.");
  }
}

// Handle Sales Report Submission
document.getElementById('salesReportForm').addEventListener("submit", function(event) {
  event.preventDefault();
  const data = {
      productName: document.getElementById('salesProductName').value,
      amount: document.getElementById('salesAmount').value,
      salesDate: document.getElementById('salesDate').value
  };
  sendDataToBackend("http://localhost:4000/save-sales-report", data);
  document.getElementById('salesReportModal').style.display = "none";
});

// Handle Bids Report Submission
document.getElementById('bidsReportForm').addEventListener("submit", function(event) {
  event.preventDefault();
  const data = {
      bidderName: document.getElementById('bidderName').value,
      auctionId: document.getElementById('auctionId').value,
      bidAmount: document.getElementById('bidAmount').value
  };
  sendDataToBackend("http://localhost:4000/save-bids-report", data);
  document.getElementById('bidsReportModal').style.display = "none";
});

// Handle Auctions Report Submission
document.getElementById('auctionsReportForm').addEventListener("submit", function(event) {
  event.preventDefault();
  const data = {
      auctionName: document.getElementById('auctionName').value,
      auctionStatus: document.getElementById('auctionStatus').value
  };
  sendDataToBackend("http://localhost:4000/save-auctions-report", data);
  document.getElementById('auctionsReportModal').style.display = "none";
});

// Handle Payment Report Submission
document.getElementById('paymentsReportForm').addEventListener("submit", function(event) {
  event.preventDefault();
  const data = {
      paymentStatus: document.getElementById('paymentStatus').value,
      paymentDate: document.getElementById('paymentDate').value
  };
  sendDataToBackend("http://localhost:4000/save-payments-report", data);
  document.getElementById('paymentsReportModal').style.display = "none";
});
