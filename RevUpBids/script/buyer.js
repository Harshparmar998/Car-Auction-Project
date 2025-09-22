// Fetch and display buyers
function fetchbuyers() {
  fetch('http://localhost:4000/get-buyers')
    .then(response => response.json())
    .then(data => {
      const buyerlist = document.getElementById('buyerlist');
      buyerlist.innerHTML = ''; // Clear the table
      data.forEach((buyer, index) => {
        const row = `
          <tr> 
            <td>${index + 1}</td>
            <td>${buyer.full_name}</td>
            <td>${buyer.email}</td>
            <td>${buyer.phone_number}</td>
            <td>${buyer.password}</td>
            <td>
              <button class="btn btn-danger btn-delete" data-id="${buyer.id}">
                <i class="fas fa-trash"></i> Delete
              </button>
            </td>
          </tr>`;
        buyerlist.insertAdjacentHTML('beforeend', row);
      });

      document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', deletebuyer);
      });
    })
    .catch(error => console.error('Error fetching buyers:', error));
}

// Delete Buyer
function deletebuyer(e) {
  const id = e.target.closest('button').dataset.id;
  if (confirm('Are you sure you want to delete this buyer?')) {
    fetch(`http://localhost:4000/delete-buyer/${id}`, {
      method: 'DELETE',
    })
      .then(response => response.json())
      .then(data => {
        alert(data.message);
        fetchbuyers();
      })
      .catch(error => console.error('Error deleting buyer:', error));
  }
}

// Open Edit Modal


// Initial fetch
document.addEventListener('DOMContentLoaded', fetchbuyers);
