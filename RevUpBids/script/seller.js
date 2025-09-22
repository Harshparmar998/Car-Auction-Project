// Fetch and display sellers
function fetchSellers() {
  
  fetch('http://localhost:4000/get-pending-sellers')
    .then(response => response.json())
    .then(data => {
      const pendingsellerList = document.getElementById('pendingsellerList');
      pendingsellerList.innerHTML='';
      data.forEach((pending, index)=>{
        const row=`
          <tr>
            <td>${index+1}</td>
            <td>${pending.name}</td>
            <td>${pending.email}</td>
            <td>${pending.phone}</td>
            <td>${pending.password}</td>
            <td>
              <button class="btn btn-success btn-approve" data-p_id="${pending.p_sellerid}">
                  <i class="fas fa-check"></i> Approve
              </button>

              <button class="btn btn-danger btn-reject" data-p_id="${pending.p_sellerid}">
                  <i class="fas fa-times"></i> Reject
              </button>
            </td>
          </tr>`;
          pendingsellerList.insertAdjacentHTML('beforeend', row);
      });

      document.querySelectorAll('.btn-approve').forEach(button => {
        button.addEventListener('click', approveseller);
      });

      document.querySelectorAll('.btn-reject').forEach(button => {
        button.addEventListener('click', rejectseller);
      });
    })

  fetch('http://localhost:4000/get-sellers')
    .then(response => response.json())
    .then(data => {
      const sellerList = document.getElementById('sellerList');
      sellerList.innerHTML = ''; // Clear the table
      data.forEach((seller, index) => {
        const row = `
          <tr>
            <td>${index + 1}</td>
            <td>${seller.name}</td>
            <td>${seller.email}</td>
            <td>${seller.phone}</td>
            <td>${seller.cars_listed}</td>
            <td>${seller.password}</td>
            <td>
              <button class="btn btn-danger btn-delete" data-id="${seller.sellerid}">
                <i class="fas fa-trash"></i> Delete
              </button>
            </td>
          </tr>`;
        sellerList.insertAdjacentHTML('beforeend', row);
      });

      // Attach event listeners for edit and delete buttons
      
      document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', deleteSeller);
      });
    })
    .catch(error => console.error('Error fetching sellers:', error));
}

// Delete Seller
function deleteSeller(e) {
  const id = e.target.closest('button').dataset.id;
  if (confirm('Are you sure you want to delete this seller?')) {
    fetch(`http://localhost:4000/delete-seller/${id}`, {
      method: 'DELETE',
    })
      .then(response => response.json())
      .then(data => {
        alert(data.message);
        fetchSellers();
      })
      .catch(error => console.error('Error deleting seller:', error));
  }
}

function rejectseller(e){
  const id = e.target.closest('button').dataset.p_id;
  if (confirm('Are you sure you want to reject this seller?')) {
    fetch(`http://localhost:4000/reject-seller/${id}`, {
      method: 'DELETE',
    })
      .then(response => response.json())
      .then(data => {
        alert(data.message);
        fetchSellers();
      })
      .catch(error => console.error('Error rejecting seller:', error));
  }
}

// Approve Seller
function approveseller(e) {
  const id = e.target.closest('button').dataset.p_id;
  if (confirm('Are you sure you want to approve this seller?')) {
    fetch(`http://localhost:4000/approve-seller/${id}`, {
      method: 'PATCH',  // or 'POST' if appropriate for your backend
    })
      .then(response => response.json())
      .then(data => {
        alert(data.message);
        fetchSellers();  // Reload the seller list
      })
      .catch(error => console.error('Error approving seller:', error));
  }
}

// Initial fetch
document.addEventListener('DOMContentLoaded', fetchSellers);