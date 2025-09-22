import auctionChecker from "../../../utils/auctionChecker";

export default async function handler(req, res) {
    try {
        await auctionChecker(); // ✅ Ensure we await the function
        res.status(200).json({ message: "Auction checker run successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error running auction checker" });
    }
}
