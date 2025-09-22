import { useEffect, useState } from "react";
import { Modal, Button, Table } from "react-bootstrap";
import Navbar from '../components/Navbar';
import Footer from "../components/Footer";
import toast from "react-hot-toast";

export default function Auctions() {
    const [sellerId, setSellerId] = useState(null);
    const [auctions, setAuctions] = useState([]);
    const [completedAuctions, setCompletedAuctions] = useState([]);
    const [bids, setBids] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedAuctionId, setSelectedAuctionId] = useState(null);
    const [timers, setTimers] = useState({}); // Stores auction countdown times
    const [paidBids, setPaidBids] = useState([]);


    useEffect(() => {
        const storedSellerId = localStorage.getItem("sellerId");
        if (storedSellerId) setSellerId(storedSellerId);
    }, []);

    useEffect(() => {
        if (sellerId) {
            fetchAuctions(sellerId);
            fetchCompletedAuctions(sellerId);
        }
    }, [sellerId]);

    useEffect(() => {
        const interval = setInterval(() => {
            updateTimers();
        }, 1000); // Update every second

        return () => clearInterval(interval);
    }, [auctions]);

    const fetchAuctions = async (sellerId) => {
        try {
            const res = await fetch(`/api/getSellerAuctions?sellerid=${sellerId}`);
            const data = await res.json();
            console.log("Auctions:", data); // Debugging log
            if (data.success) {
                setAuctions(data.auctions);
                initializeTimers(data.auctions);
            }
        } catch (error) {
            console.error("Error fetching auctions:", error);
        }
    };

    const fetchCompletedAuctions = async (sellerId) => {
        try {
            const res = await fetch(`/api/getCompletedAuctions?sellerid=${sellerId}`);
            const data = await res.json();
            console.log("Completed Auctions:", data); // Debugging log
            if (data.success) {
                setCompletedAuctions(data.completedAuctions);
            } else {
                setCompletedAuctions([]); // Ensure it's an empty array if response is invalid
            }
        } catch (error) {
            console.error("Error fetching completed auctions:", error);
            setCompletedAuctions([]); // Prevents crashing if API call fails
        }
    };
    

    const initializeTimers = (auctions) => {
        const newTimers = {};
        auctions.forEach((car) => {
            if (car.auction_end_time) {
                newTimers[car.id] = calculateRemainingTime(car.auction_end_time);
            }
        });
        setTimers(newTimers);
    };

    const calculateRemainingTime = (endTime) => {
        const endTimestamp = new Date(endTime).getTime();
        const currentTimestamp = new Date().getTime();
        return Math.max(0, endTimestamp - currentTimestamp);
    };

    const updateTimers = () => {
        setTimers((prevTimers) => {
            const updatedTimers = {};
            Object.keys(prevTimers).forEach((auctionId) => {
                updatedTimers[auctionId] = Math.max(0, prevTimers[auctionId] - 1000);
            });
            return updatedTimers;
        });
    };

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    const startAuction = async (car_id) => {
        if (!confirm("Are you sure you want to start this auction?")) return;

        try {
            const response = await fetch(`/api/startAuction`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ car_id, seller_id: sellerId })
            });

            const data = await response.json();
            if (data.success) {
                toast.success("Auction started successfully!",{position: 'top-right'});
                fetchAuctions(sellerId);
            } else {
                toast.error(`Error: ${data.message}`,{position: 'top-right'});
            }
        } catch (error) {
            console.error("Error starting auction:", error);
        }
    };

    const cancelAuction = async (car_id) => {
        if (!confirm("Are you sure you want to cancel this auction?")) return;

        try {
            await fetch(`/api/cancelAuction`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ car_id, seller_id: sellerId })
            });

            toast.success("Auction cancelled successfully!",{position: 'top-right'});
            fetchAuctions(sellerId);

        } catch (error) {
            toast.error("Error cancelling auction:", error,{position: 'top-right'});
        }
    };

    const viewBids = async (id) => {
        setSelectedAuctionId(id);
        setShowModal(true);
        try {
            const res = await fetch(`/api/getBids?auctionid=${id}`);
            const data = await res.json();
            if (data.success) setBids(data.bids);
        } catch (error) {
            console.error("Error fetching bids:", error);
        }
    };

    const approveBid = async (bidId, auctionId) => {
        try {
            const res = await fetch(`/api/approvebid`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bidId, auctionId })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Bid approved successfully. An email has been sent to the buyer.",{position: 'top-right'});
                viewBids(auctionId);
            }
            else {
                toast.error(data.error,{position: 'top-right'});
            }

        } catch (error) {
            console.error("Error approving bid:", error);
        }
    };

    const rejectPaymentBid = async (bidId, auctionId) => {
        try {
            const res = await fetch(`/api/rejectpaymentBid`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bidId })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Bid rejected successfully.",{position: 'top-right'});
                viewBids(auctionId);
            }
            else {
                toast.error(data.error,{position: 'top-right'});
            }

        } catch (error) {
            console.error("Error rejecting Payment bid:", error);
        }
    };

    const rejectbid = async (bidId, auctionId) => {
        try {
            console.log("Rejecting bid:", bidId); // Debugging log

            const response = await fetch("/api/rejectBid", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bidId }),
            });

            console.log("Response received:", response); // Debugging log

            const data = await response.json();
            console.log("Response data:", data); // Debugging log

            if (!response.ok) {
                toast.error(data.message || "Failed to reject bid.",{position: 'top-right'});
            }

            toast.success("Bid rejected successfully. An email has been sent to the buyer.",{position: 'top-right'});
            viewBids(auctionId); // Refresh the bid list
        } catch (error) {
            console.error("Error rejecting bid:", error);
            alert(`Error: ${error.message}`);
        }
    };

    // const paymentDone = async (bidId, auctionId) => {
    //     try {
    //         console.log("Rejecting bid:", bidId); // Debugging log

    //         const response = await fetch("/api/paymentdone", {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({ bidId }),
    //         });

    //         console.log("Response received:", response); // Debugging log

    //         const data = await response.json();
    //         console.log("Response data:", data); // Debugging log

    //         if (!response.ok) {
    //             alert(data.message || "Failed to reject bid.");
    //         }

    //         alert("Payment Done successfully. An email has been sent to the buyer.");
    //         setPaidBids((prevPaidBids) => [...prevPaidBids, bidId]);
    //         viewBids(auctionId); // Refresh the bid list
    //     } catch (error) {
    //         console.error("Error rejecting bid:", error);
    //         alert(`Error: ${error.message}`);
    //     }
    // };

    return (
        <div>
            <Navbar />
            <div className="container">
                <h2>My Auctions</h2>
                {auctions.length === 0 ? (
                    <p className="text-center text-muted">No approved auctions available.</p>
                ) : (
                <div className="row">
                    {auctions.map((car) => (
                        <div key={car.id} className="col-md-4 mb-4">
                            <div className="card">
                                <img src={`/uploads/${car.car_images?.[0] || "default.jpg"}`} className="img-fluid" style={{ height: "200px", objectFit: "cover", width: "100%" }} alt="Car" />
                                <div className="card-body">
                                    <h5>{car.company} {car.model} ({car.color})</h5>
                                    <p><strong>Highest Bid:</strong> {car.highest_bid || "No bids yet"}</p>
                                    <p><strong>Minimum Price:</strong> {car.min_price}</p>

                                    {/* Auction Timer */}
                                    <p className="text-danger">
                                        <strong>Time Left:</strong> {car.auction_end_time ? (timers[car.id] > 0 ? formatTime(timers[car.id]) : "Auction Ended") : "Not Started"}
                                    </p>

                                    <div className="btn-group">
                                        <div className="btn-group">
                                            {car.car_status === "Approved" ? (
                                                <>
                                                    <button className="btn btn-primary" onClick={() => startAuction(car.id)}>Start Now</button>
                                                    <button className="btn btn-danger" onClick={() => cancelAuction(car.id)}>Cancel</button>
                                                </>
                                            ) : car.car_status === "Available" ? (
                                                <>

                                                    <button className="btn btn-danger" onClick={() => cancelAuction(car.id)}>Cancel</button>
                                                    <button className="btn btn-info" onClick={() => viewBids(car.id)}>View Bids</button>
                                                </>
                                            ) : null}
                                        </div>

                                    </div>

                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                )}

                <h2>Auction History</h2>
                {completedAuctions.length === 0 ? (
                    <p className="text-center text-muted">No completed auctions available.</p>
                ) : (
                <div className="row">
                    {completedAuctions.map((car) => (
                        <div key={car.id} className="col-md-4 mb-4">
                            <div className="card">
                                <img src={`/uploads/${car.car_images?.[0] || "default.jpg"}`} className="img-fluid" style={{ height: "200px", objectFit: "cover", width: "100%" }} alt="Car" />
                                <div className="card-body">
                                    <h5>{car.company} {car.model} ({car.color})</h5>
                                    <p><strong>Car Condition:</strong> {car.car_condition}</p>
                                    <p><strong>Fuel Type:</strong> {car.fuel_type}</p>
                                    <p><strong>Insurance:</strong> {car.insurance}</p>
                                    <p><strong>Manufacture Year:</strong> {car.manufacture_year}</p>
                                    <p><strong>Owner History:</strong> {car.owner_history}</p>
                                    <p><strong>Kilometers Driven:</strong> {car.kilometers}</p>
                                    <p><strong>Highest Bid:</strong> {car.highest_bid}</p>
                                    <p><strong>Seller:</strong> {car.sellername}</p>
                                    <p><strong>Description:</strong> {car.description}</p>
                                    <p><strong>Auction Start Time:</strong> {new Date(car.auction_start_time).toLocaleString()}</p>
                                    <p><strong>Auction End Time:</strong> {new Date(car.auction_end_time).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                )}


                <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Bids for Auction {selectedAuctionId}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Buyer Name</th>
                                    <th>Bid Price</th>
                                    <th>Bid Time</th>
                                    <th>Bid Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bids.length > 0 ? (
                                    bids.map((bid) => (
                                        <tr key={bid.bidid}>
                                            <td>{bid.first_name} {bid.last_name}</td>
                                            <td>${bid.bid_price}</td>
                                            <td>{new Date(bid.bid_time).toLocaleString()}</td>
                                            <td>{bid.bid_status}</td>
                                            <td>
                                                {bid.bid_status === "Pending" ? (
                                                    <>
                                                        <Button
                                                            variant="success"
                                                            size="sm"
                                                            className="me-1"
                                                            onClick={() => approveBid(bid.bidid, selectedAuctionId)}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() => rejectbid(bid.bidid, selectedAuctionId)}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </>
                                                ) : bid.bid_status === "Approved" ? (
                                                    <>
                                    
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() => rejectPaymentBid(bid.bidid, selectedAuctionId)}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </>
                                                ) : bid.bid_status === "Completed" ? (
                                                    <Button variant="success" size="sm" disabled>Paid</Button>
                                                ) : bid.bid_status === "Rejected" ? (
                                                    <Button variant="secondary" size="sm" disabled>Rejected</Button>
                                                ) : null}

                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center">No bids found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </Modal.Body>
                </Modal>


            </div>
            <Footer />
        </div>
    );
}
