// Function to format date-time and remove extra details
function formatDateTime(dateTimeString) {
  const dateObj = new Date(dateTimeString);
  const formattedDate = dateObj.toISOString().split("T")[0]; // Extracts only the date (YYYY-MM-DD)
  const formattedTime = dateObj.toTimeString().split(" ")[0]; // Extracts only the time (HH:MM:SS)
  return `${formattedDate} ${formattedTime}`;
}

// Fetch and display payments
function fetchPayment() {
  fetch('http://localhost:4000/get-payments')
      .then(response => response.json())
      .then(data => {
          console.log('Data:', data);
          const paymentList = document.getElementById('paymentList');
          paymentList.innerHTML = ''; // Clear the table

          data.forEach((payment, index) => {
              let amount = payment.bid_price;
              let percentage = ((amount * 2) / 100).toFixed(2); // Ensure 2 decimal places
              
              // Determine background color based on payment status
              let isPaid = payment.payment_status.toLowerCase() === 'paid';
              let bgColor = isPaid ? 'rgb(2,0,36)' : 'red';
              let textColor = 'white'; // Ensure text is readable

              const row = `
                  <tr>
                      <td>${index + 1}</td>
                      <td>${payment.bidid}</td>
                      <td>${payment.auction_id}</td>
                      <td>${payment.buyerid}</td>
                      <td>${payment.first_name} ${payment.last_name}</td>
                      <td>${payment.bid_price}</td>
                      <td>${percentage}</td>
                      <td>${formatDateTime(payment.payment_deadline)}</td> <!-- Formatted Date-Time -->
                      <td>
                          <span style="
                              display: inline-block;
                              padding: 5px 10px;
                              background-color: ${bgColor};
                              color: ${textColor};
                              border-radius: 5px;
                              font-weight: bold;
                              text-align: center;
                              min-width: 80px;">
                              ${payment.payment_status}
                          </span>
                      </td>
                  </tr>`;

              paymentList.insertAdjacentHTML('beforeend', row);
          });
      })
      .catch(error => console.error('Error fetching payment:', error));
}

// Initial fetch when the page loads
document.addEventListener('DOMContentLoaded', fetchPayment);
