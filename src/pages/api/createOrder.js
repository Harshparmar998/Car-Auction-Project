import Razorpay from "razorpay";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ success: false, message: "Method Not Allowed" });
    }

    const { amount, currency, receipt } = req.body; // Ensure these are passed

    if (!amount || !currency || !receipt) {
        return res.status(400).json({ success: false, message: "Missing required parameters." });
    }

    try {
        const razorpay = new Razorpay({
            key_id: "rzp_test_Prbw0kZivKFUWj",
            key_secret: "cyaQ0ShMN5eVh0XRkYZAzI6Y",
        });

        const options = {
            amount: amount * 100, // Convert to paise
            currency: currency || "INR",
            receipt: receipt,
            payment_capture: 1, // Auto capture payment
        };

        const order = await razorpay.orders.create(options);
        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ success: false, message: "Failed to create order." });
    }
}
