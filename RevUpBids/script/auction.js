document.addEventListener('DOMContentLoaded', () => {
  fetch("http://localhost:4000/get-pending-auctions")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const auctionList = document.getElementById('pendingauctionList');
      auctionList.innerHTML = ''; // Clear the table
      
      data.forEach((auction) => {
        const row = `
          <tr>
            <td>${auction.id}</td>
            <td>${auction.company} ${auction.model} (${auction.color})</td>
            <td>${auction.min_price}</td>
            <td>${auction.sellername}</td>
            <td>${auction.car_status}</td>
            <td>
              <img src="http://localhost:3000/uploads/${auction.car_image}" 
                   alt="${auction.company}" 
                   style="width: 100px; height: 100px; object-fit: contain;">
            </td>
            <td>
              <button class="btn btn-success btn-approve" data-id="${auction.id}">
                <i class="fas fa-check"></i> Approve
              </button>
              <button class="btn btn-danger btn-reject" data-id="${auction.id}">
                <i class="fas fa-times"></i> Reject
              </button>
            </td>
          </tr>`;
        auctionList.insertAdjacentHTML('beforeend', row);
      });

      document.querySelectorAll('.btn-approve').forEach(button => {
        button.addEventListener('click', approveAuction);
      });

      document.querySelectorAll('.btn-reject').forEach(button => {
        button.addEventListener('click', rejectAuction);
      });

    })
    .catch(error => console.error('Error fetching auctions:', error));

    fetch("http://localhost:4000/get-approved-auctions")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const auctionList = document.getElementById('auctionList');
      auctionList.innerHTML = ''; // Clear the table
      
      data.forEach((auction) => {
        const row = `
          <tr>
            <td>${auction.id}</td>
            <td>${auction.company} ${auction.model} (${auction.color})</td>
            <td>${auction.min_price}</td>
            <td>${auction.car_status}</td>
            <td>
              <img src="http://localhost:3000/uploads/${auction.car_image}" 
                   alt="${auction.company}" 
                   style="width: 100px; height: 100px; object-fit: contain;">
            </td>
          </tr>`;
        auctionList.insertAdjacentHTML('beforeend', row);
      });
    })
    .catch(error => console.error('Error fetching approved auctions:', error));
});

function approveAuction(e) {
  const id = e.target.closest('button').dataset.id;
  if (confirm('Are you sure you want to approve this auction?')) {
    fetch(`http://localhost:4000/approve-auction/${id}`, {
      method: 'PATCH',
    })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
      location.reload(); // Refresh page to update table
    })
    .catch(error => console.error('Error approving auction:', error));
  }
}

function rejectAuction(e) {
  const id = e.target.closest('button').dataset.id;
  if (confirm('Are you sure you want to reject this auction?')) {
    fetch(`http://localhost:4000/reject-auction/${id}`, {
      method: 'PATCH',
    })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
      location.reload(); // Refresh page to update table
    })
    .catch(error => console.error('Error rejecting auction:', error));
  }
}


