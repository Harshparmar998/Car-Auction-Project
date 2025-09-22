import { useState } from "react";
import styles from "../styles/register.module.css"; // Importing CSS module

const Register = () => {
    const [userType, setUserType] = useState("buyer");
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone_number: "",
        password: ""
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async(e) => {
        e.preventDefault();
        console.log("Submitting:", formData);
        // Add API call logic here
        const payload = {
            ...formData,
            role: userType, // Dynamically set role
        };

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            console.log(data);

            if (response.ok) {
                alert(data.message);
                window.location.href = "/login"; // Redirect after success
            } else {
                alert(data.message || "Registration failed");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while registering");
        }

    };

    return (
        <div className={styles.registrationContainer}>
            <div className={styles.registrationBox}>
                <h1 className={styles.heading}>Register for RevUpBids</h1>
                
                {/* User Type Selection Buttons */}
                <div className={styles.btnGroup}>
                    <button
                        className={`${styles.btn} ${userType === "buyer" ? styles.btnPrimary : styles.btnOutline}`}
                        onClick={() => setUserType("buyer")}
                    >
                        Buyer
                    </button>
                    <button
                        className={`${styles.btn} ${userType === "seller" ? styles.btnPrimary : styles.btnOutline}`}
                        onClick={() => setUserType("seller")}
                    >
                        Seller
                    </button>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className={styles.registrationForm}>
                    <h4 className={styles.subHeading}>{userType === "buyer" ? "Buyer" : "Seller"} Registration</h4>

                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Name</label>
                        <input type="text" name="full_name" className={styles.formControl} onChange={handleInputChange} required />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Email</label>
                        <input type="email" name="email" className={styles.formControl} onChange={handleInputChange} required />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Phone Number</label>
                        <input type="number" name="phone_number" className={styles.formControl} onChange={handleInputChange} required />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Password</label>
                        <input type="password" name="password" className={styles.formControl} onChange={handleInputChange} required />
                    </div>

                    <button type="submit" className={styles.btnPrimary}>
                        Register as {userType === "buyer" ? "Buyer" : "Seller"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;
