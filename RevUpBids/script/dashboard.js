// Fetch total bids from the Node.js server
fetch('http://localhost:4000/getTotalBids')
    .then(response => response.json())
    .then(data => {
        // Inject total bids into the HTML element
        document.getElementById('total').textContent = data.total_bids;
    })
    .catch(error => {
        console.error('Error fetching total bids:', error);
    });

// Fetch total seller from the Node.js server
fetch('http://localhost:4000/gettotalsellers')
    .then(response => response.json())
    .then(data => {
        // Inject total bids into the HTML element
        document.getElementById('total-sellers').textContent = data.total_seller;
    })
    .catch(error => {
        console.error('Error fetching total bids:', error);
    });    

// Fetch total seller from the Node.js server
fetch('http://localhost:4000/gettotalauction')
    .then(response => response.json())
    .then(data => {
        // Inject total bids into the HTML element
        document.getElementById('total-auctions').textContent = data.total_auction;
    })
    .catch(error => {
        console.error('Error fetching total bids:', error);
    });        

// Fetch total seller from the Node.js server
fetch('http://localhost:4000/gettotalsoldcar')
    .then(response => response.json())
    .then(data => {
        console.log(data);
        // Inject total bids into the HTML element
        document.getElementById('sold-car').innerHTML = data[0].sold_car;
    })
    .catch(error => {
        console.error('Error fetching total bids:', error);
    });       
    
    
    fetch('http://localhost:4000/recentsellerlist')
    .then(response => response.json())
    .then(data => {
      const recentsellerlist = document.getElementById('recentsellerlist');
      recentsellerlist.innerHTML = ''; // Clear the table
      data.forEach((recentseller, index) => {
        const row = `
          <tr>
            <td>${recentseller.sellerid}</td>
            <td>${recentseller.name}</td>
            <td>${recentseller.cars_listed}</td>
          </tr>`;
          recentsellerlist.insertAdjacentHTML('beforeend', row);
      })
    });  

    fetch('http://localhost:4000/recentbidlist')
    .then(response => response.json())
    .then(data => {
      const recentbidlist = document.getElementById('recentbidlist');
      recentbidlist.innerHTML = ''; // Clear the table
      data.forEach((recentbid, index) => {
        const row = `
          <tr>
            <td>${recentbid.bidid}</td>
            <td>${recentbid.bid_price}</td>
            <td>${recentbid.auction_id}</td>
          </tr>`;
          recentbidlist.insertAdjacentHTML('beforeend', row);
      })
    });  
