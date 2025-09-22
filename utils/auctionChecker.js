const db = require("./db"); // Ensure it imports the correct DB connection

const auctionChecker = async () => {
    console.log("Checking for expired auctions...");

    const sql = `
        UPDATE car_details 
        SET car_status = "Completed" 
        WHERE car_status = "Available" 
        AND (
            auction_end_time <= NOW() 
            OR id IN (SELECT DISTINCT auction_id FROM bids WHERE payment_status = "Paid")
        )`;

    try {
        const [result] = await db.execute(sql); // ✅ Use `execute()` instead of `query()`
        console.log(`${result.affectedRows} auctions marked as completed.`);
    } catch (error) {
        console.error("Error closing auctions:", error);
    }
};

module.exports = auctionChecker; // ✅ Ensure it's exported correctly
