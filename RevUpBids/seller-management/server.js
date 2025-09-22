const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cron = require("node-cron");
const nodemailer = require("nodemailer");


const app = express();
app.use(cors());
app.use(express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Ensure 'uploads/' directory exists
if (!fs.existsSync("uploads/")) {
    fs.mkdirSync("uploads/");
}

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }  // 10MB file size limit, adjust as needed
}).fields([
    { name: "license_img", maxCount: 1 },
    { name: "rc_img", maxCount: 1 },
    { name: "car_bill", maxCount: 1 },
]);

const uploadImages = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }
 }).array("car_images[]", 5); // Allows multiple images


// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Your MySQL username
    password: '', // Your MySQL password
    database: 'revupbids',
});

// Connect to the database 
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

/*----------------------------------Seller------------------------------------ */

// API to add a seller
app.post('/add-seller', (req, res) => {
    const { name, email, phone, cars_listed } = req.body;

    if (!name || !email || !phone || typeof cars_listed === 'undefined') {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = `INSERT INTO sellers (name, email, phone, cars_listed) VALUES (?, ?, ?, ?)`;

    db.query(query, [name, email, phone, cars_listed], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Failed to add seller' });
        }
        res.status(200).json({ message: 'Seller added successfully!' });
    });
});

// API to fetch all sellers
app.get('/get-sellers', (req, res) => {
    const query = 'SELECT * FROM sellers';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching sellers:', err);
            return res.status(500).json({ error: 'Failed to fetch sellers' });
        }
        res.status(200).json(results);
    });
});

// API to fetch all pending sellers
app.get('/get-pending-sellers', (req, res) => {
    const query = 'SELECT * FROM approve_seller';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching sellers:', err);
            return res.status(500).json({ error: 'Failed to fetch sellers' });
        }
        res.status(200).json(results);
    });
});

// API to delete a seller
app.delete('/delete-seller/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM sellers WHERE sellerid = ?';

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting seller:', err);
            return res.status(500).json({ error: 'Failed to delete seller' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Seller not found' });
        }
        res.status(200).json({ message: 'Seller deleted successfully!' });
    });
});

// API to reject seller
app.delete('/reject-seller/:id', (req, res) => {
    const { id } = req.params;

    // Delete the seller from the pending list
    const query = 'DELETE FROM approve_seller WHERE p_sellerid = ?';

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error rejecting seller:', err);
            return res.status(500).json({ error: 'Failed to reject seller' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Seller not found' });
        }
        res.status(200).json({ message: 'Seller rejected and deleted successfully!' });
    });
});


//API to approve seller
app.patch('/approve-seller/:id', (req, res) => {
    const { id } = req.params;

    // Check if the seller already exists
    const checkQuery = 'SELECT COUNT(*) AS count FROM sellers WHERE sellerid = ?';

    db.query(checkQuery, [id], (err, result) => {
        if (err) {
            console.error('Error checking seller existence:', err);
            return res.status(500).json({ error: 'Failed to check seller existence' });
        }

        if (result[0].count > 0) {
            return res.status(400).json({ error: 'Seller already exists in the active sellers list' });
        }
    });
    
    // Insert the seller into the active sellers table
    const insertQuery = 'INSERT INTO sellers (sellerid, name, email, phone, cars_listed, password) SELECT p_sellerid, name, email, phone, 0, password FROM approve_seller WHERE p_sellerid = ?';

    db.query(insertQuery, [id], (err, result) => {
        if (err) {
            console.error('Error approving seller:', err);
            return res.status(500).json({ error: 'Failed to approve seller' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Seller not found' });
        }

        // Delete the seller from the pending list after approving
        const deleteQuery = 'DELETE FROM approve_seller WHERE p_sellerid =  ?';

        db.query(deleteQuery, [id], (err, deleteResult) => {
            if (err) {
                console.error('Error removing seller from pending:', err);
                return res.status(500).json({ error: 'Failed to remove seller from pending list' });
            }

            res.status(200).json({ message: 'Seller approved and moved to active sellers list!' });
        });
    });
});


// API to edit a seller
app.put('/edit-seller/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, phone, cars_listed } = req.body;

    if (!name || !email || !phone || typeof cars_listed === 'undefined') {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = `
        UPDATE sellers 
        SET name = ?, email = ?, phone = ?, cars_listed = ?
        WHERE sellerid = ?`;

    db.query(query, [name, email, phone, cars_listed, id], (err, result) => {
        if (err) {
            console.error('Error updating seller:', err);
            return res.status(500).json({ error: 'Failed to update seller' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Seller not found' });
        }
        res.status(200).json({ message: 'Seller updated successfully!' });
    });
});

/*----------------------------------Buyer------------------------------------ */



// API to fetch all buyers
app.get('/get-buyers', (req, res) => {
    const query = 'SELECT * FROM buyers';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching buyers:', err);
            return res.status(500).json({ error: 'Failed to fetch buyers' });
        }
        res.status(200).json(results);
    });
});


// API to delete a buyer
app.delete('/delete-buyer/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM buyers WHERE id = ?';

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting buyer:', err);
            return res.status(500).json({ error: 'Failed to delete buyer' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'buyer not found' });
        }
        res.status(200).json({ message: 'buyer deleted successfully!' });
    });
});

/*----------------------------------Dashboard------------------------------------ */

//get total bids count
app.get('/getTotalBids', (req, res) => {
    const query = 'SELECT COUNT(bidid) AS total_bids FROM bids';
  
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching total bids:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
  
      // Return the total bids as JSON
      res.json({ total_bids: results[0].total_bids || 0 });
    });
  });


//get total seller count
app.get('/gettotalsellers', (req, res) => {
    const query = 'SELECT COUNT(name) AS total_seller FROM sellers';
  
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching total seller:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
  
      // Return the total bids as JSON
      res.json({ total_seller: results[0].total_seller || 0 });
    });
  });  

//get total auction count
app.get('/gettotalauction', (req, res) => {
    const query = `SELECT COUNT(car_status) AS total_auction FROM car_details`;
  
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching total auction:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
  
      // Return the total bids as JSON
      res.json({ total_auction: results[0].total_auction || 0 });
    });
  });  

  //get total bid count
app.get('/gettotalsoldcar', (req, res) => {
    const query = 'SELECT COUNT(id) AS sold_car FROM car_details WHERE car_status="completed";';
  
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching total sold car:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
  
      // Return the total bids as JSON
      res.json(results);
    });
  }); 

app.get('/recentsellerlist', (req, res) => {
const query = 'SELECT sellerid,name,cars_listed FROM sellers LIMIT 3';
  
db.query(query, (err, results) => {
    if (err) {
        console.error('Error fetching recentsellerlist:', err);
        res.status(500).send('Internal Server Error');
        return;
    }
  
      // Return the total bids as JSON
      res.json(results);
    });
}); 

app.get('/recentbidlist', (req, res) => {
const query = 'SELECT bidid,bid_price,auction_id FROM bids LIMIT 3';
  
db.query(query, (err, results) => {
    if (err) {
        console.error('Error fetching recentbidlist:', err);
        res.status(500).send('Internal Server Error');
        return;
    }
  
      // Return the total bids as JSON
      res.json(results);
    });
}); 

/*----------------------------------auction------------------------------------ */

// API to fetch all auctions
app.get('/get-pending-auctions', (req, res) => {
    const query = `
        SELECT c.*, 
               (SELECT image_path FROM car_images WHERE car_id = c.id LIMIT 1) AS car_image 
        FROM car_details c 
        WHERE c.car_status = 'Pending'`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching pending auctions:', err);
            return res.status(500).json({ error: 'Failed to fetch pending auctions' });
        }
        res.status(200).json(results);
    });
});

app.get('/get-approved-auctions', (req, res) => {
    const query = `
        SELECT c.*, 
               (SELECT image_path FROM car_images WHERE car_id = c.id LIMIT 1) AS car_image 
        FROM car_details c 
        WHERE c.car_status = 'Approved' || c.car_status = 'Available'`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching approved auctions:', err);
            return res.status(500).json({ error: 'Failed to fetch approved auctions' });
        }
        res.status(200).json(results);
    });
});


app.patch('/approve-auction/:id', (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: "Car ID is required" });
    }

    const sql = `UPDATE car_details SET car_status = 'Approved' WHERE id = ?`;

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }
        res.json({ message: "Auction approved successfully" });
    });
});

app.patch('/reject-auction/:id', (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: "Car ID is required" });
    }

    const sql = `DELETE car_details, sell_car_documents, car_images  
FROM car_details  
LEFT JOIN sell_car_documents ON car_details.id = sell_car_documents.car_id  
LEFT JOIN car_images ON car_details.id = car_images.car_id  
WHERE car_details.id = ?;
`;

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }
        res.json({ message: "Auction Rejected successfully" });
    });
});

/*----------------------------------bids------------------------------------ */

// API to fetch all bids
app.get('/get-bids', (req, res) => {
    const query = 'SELECT * FROM bids';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching bids:', err);
            return res.status(500).json({ error: 'Failed to fetch bids' });
        }
        res.status(200).json(results);
    });
});

// API to delete a auction
app.delete('/delete-bid/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM bids WHERE bidid = ?';

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting bid:', err);
            return res.status(500).json({ error: 'Failed to delete bid' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'bid not found' });
        }
        res.status(200).json({ message: 'bid deleted successfully!' });
    });
});

/*----------------------------------payment------------------------------------ */

// API to fetch all bids
app.get('/get-payments', (req, res) => {
    const query = `SELECT * FROM bids 
WHERE bid_status IN ("Approved", "Completed") 
AND payment_status IN ("Paid", "Pending");
`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching payment:', err);
            return res.status(500).json({ error: 'Failed to fetch payment' });
        }
        res.status(200).json(results);
    });
});


/*--------------------------------------Forget password----------------------------------------*/

app.post('/forgot-password', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    sendResetEmail(email);
    return res.status(200).json({ success: true, message: 'Password reset link has been sent to your email.' });
});

// Function to send reset email
function sendResetEmail(email) {
    const resetLink = `https://cold-pants-leave.loca.lt/reset-password?email=${encodeURIComponent(email)}`;

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'harshparmar090909@gmail.com',
            pass: 'kfdr wpoj mhdf koip',
        },
    });

    const mailOptions = {
        from: 'harshparmar090909@gmail.com',
        to: email,
        subject: 'Password Reset Request',
        html: `
            <!DOCTYPE html>
            <html>
            <body>
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f4f4f9;">
                    <h1>Password Reset Request</h1>
                    <p>Hi,</p>
                    <p>You requested to reset your password. Click the button below to reset it:</p>
                    <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 6px;">Reset Password</a>
                    <p>If the button doesn’t work, copy and paste this link into your browser:</p>
                    <p><a href="${resetLink}">${resetLink}</a></p>
                    <p>Thank you,<br>The RevUpBids Team</p>
                </div>
            </body>
            </html>`
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error('Error sending email:', err);
        } else {
            console.log('Reset email sent:', info.response);
        }
    });
}


app.post('/reset-password', (req, res) => {
    const { email, role, newPassword } = req.body;

    if (!email || !newPassword) {
        return res.status(400).json({ success: false, message: 'Email and new password are required' });
    }

    const table = role === 'buyer' ? 'buyers' : 'sellers';
    const updateQuery = `UPDATE ${table} SET password = ? WHERE email = ?`;

    db.query(updateQuery, [newPassword, email], (err, result) => {
        if (err) {
            console.error('Error updating password:', err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        return res.status(200).json({ success: true, message: 'Password reset successfully' });
    });
});



/*-------------------------------------------Report---------------------------------------------- */

// Save Sales Report
app.post("/save-sales-report", (req, res) => {
    const { productName, amount, salesDate } = req.body;
    const sql = "INSERT INTO sales_reports (product_name, amount, sales_date) VALUES (?, ?, ?)";
    db.query(sql, [productName, amount, salesDate], (err, result) => {
      if (err) {
        console.error("Error inserting sales report:", err);
        return res.status(500).json({ message: "Failed to save sales report" });
      }
      res.status(200).json({ message: "Sales Report Saved Successfully" });
    });
  });
  
  // Save Bids Report
  app.post("/save-bids-report", (req, res) => {
    const { bidderName, auctionId, bidAmount } = req.body;
    const sql = "INSERT INTO bids_reports (bidder_name, auction_id, bid_amount) VALUES (?, ?, ?)";
    db.query(sql, [bidderName, auctionId, bidAmount], (err, result) => {
      if (err) {
        console.error("Error inserting bids report:", err);
        return res.status(500).json({ message: "Failed to save bids report" });
      }
      res.status(200).json({ message: "Bids Report Saved Successfully" });
    });
  });
  
  // Save Auctions Report
  app.post("/save-auctions-report", (req, res) => {
    const { auctionName, auctionStatus } = req.body;
    const sql = "INSERT INTO auctions_reports (auction_name, auction_status) VALUES (?, ?)";
    db.query(sql, [auctionName, auctionStatus], (err, result) => {
      if (err) {
        console.error("Error inserting auctions report:", err);
        return res.status(500).json({ message: "Failed to save auctions report" });
      }
      res.status(200).json({ message: "Auctions Report Saved Successfully" });
    });
  });
  
  // Save Payment Report
  app.post("/save-payments-report", (req, res) => {
    const { paymentStatus, paymentDate } = req.body;
    const sql = "INSERT INTO payments_reports (payment_status, payment_date) VALUES (?, ?)";
    db.query(sql, [paymentStatus, paymentDate], (err, result) => {
      if (err) {
        console.error("Error inserting payment report:", err);
        return res.status(500).json({ message: "Failed to save payment report" });
      }
      res.status(200).json({ message: "Payment Report Saved Successfully" });
    });
  });
  

// Error handling for invalid endpoints
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start the server
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


