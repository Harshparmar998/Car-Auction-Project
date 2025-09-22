"use client";
import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../styles/feedback.module.css';
import Navbar from '../components/Navbar';

export default function FeedbackPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ✅ Basic Form Validation
        if (name === "" || email === "" || message === "") {
            alert("All fields are required!");
            return;
        }

        // ✅ Prepare FormData to send data
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('message', message);

        try {
            // ✅ Send Data to /api/feedback
            const response = await fetch('/api/feedback', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            // ✅ Handle Success Response
            if (response.status === 200) {
                alert(result.message);
                setSuccessMessage(true);

                // ✅ Clear Input Fields
                setName('');
                setEmail('');
                setMessage('');

                // ✅ Hide Success Message after 5 seconds
                setTimeout(() => {
                    setSuccessMessage(false);
                }, 5000);
            } else {
                setErrorMessage(result.message);
                alert(result.message);
            }

        } catch (error) {
            console.error("❌ Error submitting feedback:", error);
            setErrorMessage("Something went wrong. Please try again later.");
            alert("Something went wrong. Please try again later.");
        }
    };

    return (
        <div>
            <Navbar />
            <div className={styles.feedbackContainer}>
                <Head>
                    <title>Feedback - RevUpBids</title>
                </Head>

                <div className={styles.feedbackBox}>
                    <h1>Give Your Feedback</h1>
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        <input
                            type="text"
                            className={styles.formControl}
                            placeholder="Your Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <input
                            type="email"
                            className={styles.formControl}
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <textarea
                            className={styles.formControl}
                            placeholder="Write your feedback here..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows="4"
                            required
                        ></textarea>
                        <button type="submit" className={styles.btnPrimary}>
                            Submit Feedback
                        </button>
                    </form>

                    {/* ✅ Success Message */}
                    {successMessage && (
                        <div className="alert alert-success mt-3">
                            ✅ Thank you for your feedback! We appreciate your response.
                        </div>
                    )}

                    {/* ✅ Error Message */}
                    {errorMessage && (
                        <div className="alert alert-danger mt-3">
                            ❌ {errorMessage}
                        </div>
                    )}

                    {/* ✅ Back to Dashboard */}
                    <div className="mt-3 text-center">
                        <p>
                            <a href="/" className={styles.link}>
                                Go Back to Dashboard
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}