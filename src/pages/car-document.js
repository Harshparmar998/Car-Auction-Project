'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import styles from '@/styles/cardocument.module.css';
import toast from "react-hot-toast";

export default function SellCarDocuments() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [sellerId, setSellerId] = useState('');
    const [carId, setCarId] = useState('');
    const [validationMessages, setValidationMessages] = useState({
        license_img: '',
        rc_img: '',
    });

    const [formData, setFormData] = useState({
        rc_number: '',
        license_number: '',
        license_img: null,
        rc_img: null,
        car_bill: null
    });

    useEffect(() => {
        const storedLogin = localStorage.getItem('isLoggedIn');
        const storedSellerId = localStorage.getItem('sellerId');
        const storedCarId = localStorage.getItem('car-id');

        if (storedLogin) {
            setIsLoggedIn(true);
            setSellerId(storedSellerId);
            setCarId(storedCarId);
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleFileChange = async (e) => {
        const { name, files } = e.target;
        if (files.length > 0) {
            const file = files[0];

            // Call Google Vision API to validate the uploaded document
            const isValid = await validateImageWithVisionAPI(file, name);
            if (!isValid) {
                setValidationMessages(prev => ({
                    ...prev,
                    [name]: `❌ ${name.replace('_', ' ')} does not match. Please re-upload.`
                }));
                return;
            }

            setValidationMessages(prev => ({
                ...prev,
                [name]: `✅ ${name.replace('_', ' ')} successfully validated.`
            }));

            setFormData(prevState => ({
                ...prevState,
                [name]: file
            }));
        }
    };

    // Function to send image to backend for Google Vision API validation
    const validateImageWithVisionAPI = async (file, fieldName) => {
        const imageData = new FormData();
        imageData.append("file", file);
        imageData.append("rc_number", formData.rc_number);
        imageData.append("license_number", formData.license_number);
        imageData.append("field", fieldName);

        try {
            const response = await fetch('/api/validate-image', {
                method: "POST",
                body: imageData
            });

            const result = await response.json();
            return result.valid; // Return true if valid, false otherwise
        } catch (error) {
            console.error("Validation Error:", error);
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!sellerId || !carId) {
            toast.error('Seller ID or Car ID is missing!');
            return;
        }

        // Ensure that validation messages are not errors before submitting
        if (validationMessages.license_img.includes('❌') || validationMessages.rc_img.includes('❌')) {
            toast.error('Please fix the validation errors before submitting.');
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('rc_number', formData.rc_number);
        formDataToSend.append('license_number', formData.license_number);
        formDataToSend.append('license_img', formData.license_img);
        formDataToSend.append('rc_img', formData.rc_img);
        formDataToSend.append('car_bill', formData.car_bill);
        formDataToSend.append('sellerId', sellerId);
        formDataToSend.append('car_id', carId);

        try {
            const response = await fetch('/api/cardocument', {
                method: 'POST',
                body: formDataToSend
            });
            const data = await response.json();

            if (data.success) {
                toast.success(data.message, { position: 'top-right' });
                router.push('/car-image');
            } else {
                toast.error(data.message, { position: 'top-right' });
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            toast.error('Something went wrong! Please try again later.');
        }
    };

    return (
        <div>
            <Navbar />
            <div className={styles.container}>
                <div className={styles.formContainer}>
                    <h2 className={styles.textCenter}>Sell Car - Required Documents</h2>
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        <div className={styles.mb3}>
                            <label className={styles.formLabel}>RC Book Number</label>
                            <input type="text" name="rc_number" className={styles.formControl} required onChange={handleInputChange} />
                        </div>
                        <div className={styles.mb3}>
                            <label className={styles.formLabel}>Driving License Number</label>
                            <input type="text" name="license_number" className={styles.formControl} required onChange={handleInputChange} />
                        </div>
                        <div className={styles.mb3}>
                            <label className={styles.formLabel}>Upload Driving License</label>
                            <input type="file" name="license_img" className={styles.formControl} accept="image/*" required onChange={handleFileChange} />
                            {validationMessages.license_img && <p className={styles.validationMessage}>{validationMessages.license_img}</p>}
                        </div>
                        <div className={styles.mb3}>
                            <label className={styles.formLabel}>Upload RC Book</label>
                            <input type="file" name="rc_img" className={styles.formControl} accept="image/*" required onChange={handleFileChange} />
                            {validationMessages.rc_img && <p className={styles.validationMessage}>{validationMessages.rc_img}</p>}
                        </div>
                        <button type="submit" className={styles.btnPrimary}>Submit</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
