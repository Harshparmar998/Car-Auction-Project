import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/Profile.module.css"; // Import CSS module
import Navbar from "@/components/Navbar";

export default function Profile() {
    const router = useRouter();
    const [userType, setUserType] = useState("");
    const [isEditing, setIsEditing] = useState(false); // Controls edit mode
    const [profileData, setProfileData] = useState({
        full_name: "",
        email: "",
        phone_number: "",
        password: "",
    });
    const [originalProfileData, setOriginalProfileData] = useState({}); // To store original data

    useEffect(() => {
        const isLoggedIn = localStorage.getItem("isLoggedIn");
        const sellerId = localStorage.getItem("sellerId");
        const buyerId = localStorage.getItem("buyerId");

        if (!isLoggedIn) {
            alert("You are not logged in. Redirecting to login page.");
            router.push("/login");
            return;
        }

        let profileUrl = sellerId
            ? `/api/seller/${sellerId}`
            : `/api/buyer/${buyerId}`;

        const type = sellerId ? "seller" : "buyer";
        setUserType(type);

        fetch(profileUrl)
            .then((res) => res.json())
            .then((data) => {
                console.log("Profile Data:", data);
                if (data.success) {
                    const fetchedProfile = {
                        full_name: type === "seller" ? data.seller?.name || "" : data.buyer?.full_name || "",
                        email: type === "seller" ? data.seller?.email || "" : data.buyer?.email || "",
                        phone_number: type === "seller" ? data.seller?.phone || "" : data.buyer?.phone_number || "",
                        password: data.seller?.password || data.buyer?.password || "",
                    };
                    setProfileData(fetchedProfile);
                    setOriginalProfileData(fetchedProfile); // Store original data
                } else {
                    alert(data.message || "Unable to load profile details.");
                }
            })
            .catch((error) => {
                console.error("Error fetching profile:", error);
                alert("An error occurred while fetching profile details.");
            });
    }, [router]);

    const handleInputChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleEditClick = () => {
        setIsEditing(true); // Enable editing mode
    };

    const handleCancelEdit = () => {
        setIsEditing(false); // Disable editing mode
        setProfileData(originalProfileData); // Revert changes
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const userId = localStorage.getItem("sellerId") || localStorage.getItem("buyerId");
        if (!userId) {
            alert("User ID not found. Please log in again.");
            return;
        }

        console.log("User ID before API call:", userId);

        const updatedProfileData = {
            id: userId,
            userType,
            full_name: profileData.full_name,
            email: profileData.email,
            phone_number: profileData.phone_number,
            password: profileData.password,
        };

        const profileUrl = userType === "seller"
            ? `/api/update/${userId}`
            : `/api/update/${userId}`;

        fetch(profileUrl, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedProfileData),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("Response Data:", data);
                if (data.success) {
                    alert("Profile updated successfully!");
                    setIsEditing(false); // Disable editing after update
                    setOriginalProfileData(profileData); // Save updated data
                } else {
                    alert(data.message || "Failed to update profile.");
                }
            })
            .catch((error) => {
                console.error("Error updating profile:", error);
                alert("An error occurred while updating your profile.");
            });
    };

    return (
        <div>
            <Navbar />
            <div className={styles.profileContainer}>
                <div className={styles.profileHeader}>
                    <img src="/images/men.jpeg" alt="Profile" className={styles.profileImage} />
                    <h2>{profileData.full_name || "N/A"}</h2>
                    <p>{profileData.email || "N/A"}</p>
                </div>

                <div className={styles.formSection}>
                    <h5 className="mb-3">Profile Details</h5>
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className={styles.formLabel}>Full Name</label>
                                <input
                                    type="text"
                                    className={`form-control ${styles.formControl}`}
                                    name="full_name"
                                    value={profileData.full_name}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className={styles.formLabel}>Email Address</label>
                                <input
                                    type="email"
                                    className={`form-control ${styles.formControl}`}
                                    name="email"
                                    value={profileData.email}
                                    disabled
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className={styles.formLabel}>Phone Number</label>
                                <input
                                    type="number"
                                    className={`form-control ${styles.formControl}`}
                                    name="phone_number"
                                    value={profileData.phone_number}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className={styles.formLabel}>Password</label>
                                <input
                                    type={isEditing ? "text" : "password"}
                                    className={`form-control ${styles.formControl}`}
                                    name="password"
                                    value={profileData.password}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>
                        
                        {isEditing ? (
                            <>
                                <button type="submit" className={styles.btnPrimary}>Save Changes</button>
                                <button type="button" className={`ms-2 ${styles.btnSecondary}`} onClick={handleCancelEdit}>
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button type="button" className={styles.btnPrimary} onClick={handleEditClick}>
                                Edit Profile
                            </button>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
