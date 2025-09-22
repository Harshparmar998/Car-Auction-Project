// Fetch and display buyers
function fetchbids() {
  fetch('http://localhost:4000/get-bids')
    .then(response => response.json())
    .then(data => {
      const bidList = document.getElementById('bidList');
      bidList.innerHTML = ''; // Clear the table
      data.forEach((bid, index) => {
        const row = `
          <tr>
            <td>${index + 1}</td>
            <td>${bid.bidid}</td>
            <td>${bid.auction_id}</td>
            <td>${bid.first_name}</td>
            <td>${bid.last_name}</td>
            <td>${bid.bid_price}</td>
            <td>${bid.bid_time}</td>
            <td>
              <button class="btn btn-danger btn-delete" data-id="${bid.bidid}">
                <i class="fas fa-trash"></i> Delete
              </button>
            </td>
          </tr>`;
        bidList.insertAdjacentHTML('beforeend', row); // Use bidList instead of buyerlist
      });

      document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', deletebid);
      });
    })
    .catch(error => console.error('Error fetching bids:', error));
}

// Delete bid
function deletebid(e) {
  const id = e.target.closest('button').dataset.id;
  if (confirm('Are you sure you want to delete this bid?')) {
    fetch(`http://localhost:4000/delete-bid/${id}`, {
      method: 'DELETE',
    })
      .then(response => response.json())
      .then(data => {
        alert(data.message);
        fetchbids();
      })
      .catch(error => console.error('Error deleting bid:', error));
  }
}

// Initial fetch
document.addEventListener('DOMContentLoaded', fetchbids);
