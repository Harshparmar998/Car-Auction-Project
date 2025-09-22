'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar.js';
import Footer from '../components/Footer.js';
import styles from '../styles/sellcar.module.css';
import toast from "react-hot-toast";



export default function SellCarForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        sellername: "",
        company: "",
        model: "",
        condition: "",
        insurance: "",
        color: "",
        chassis_no: "",
        description: "",
        min_price: "",
        max_price: "",
        manufacture_year: "",
        fuel_type: "",
        owner_history: "",
        kilometers: "",
    });

    const [carData, setCarData] = useState({});
    const [companies, setCompanies] = useState([]);
    const [models, setModels] = useState([]);
    const [colors, setColors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [maxYearMonth, setMaxYearMonth] = useState("");
    const [chassisError, setChassisError] = useState(""); // Error state for chassis number

    useEffect(() => {
        const fetchCarData = async () => {
            try {
                const response = await fetch("/api/get-cars");
                const data = await response.json();

                if (data.success) {
                    const carMap = {};

                    data.data.forEach((car) => {
                        if (!carMap[car.company]) {
                            carMap[car.company] = {};
                        }
                        if (!carMap[car.company][car.model]) {
                            carMap[car.company][car.model] = [];
                        }
                        carMap[car.company][car.model].push(car.color);
                    });

                    setCarData(carMap);
                    setCompanies(Object.keys(carMap));
                } else {
                    console.error("Failed to load car data:", data.message);
                }
            } catch (error) {
                console.error("Error fetching car data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCarData();

        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = String(today.getMonth() + 1).padStart(2, "0");
        setMaxYearMonth(`${currentYear}-${currentMonth}`);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCompanyChange = (e) => {
        const selectedCompany = e.target.value;
        setFormData({ ...formData, company: selectedCompany, model: "", color: "" });

        if (carData[selectedCompany]) {
            setModels(Object.keys(carData[selectedCompany]));
            setColors([]);
        }
    };

    const handleModelChange = (e) => {
        const selectedModel = e.target.value;
        setFormData({ ...formData, model: selectedModel, color: "" });

        const selectedCompany = formData.company;
        if (carData[selectedCompany] && carData[selectedCompany][selectedModel]) {
            setColors(carData[selectedCompany][selectedModel]);
        }
    };

    // Chassis number validation
    const validateChassisNumber = (chassisNo) => {
        if (chassisNo.length !== 17) {
            return "Chassis number must be exactly 17 characters long.";
        }

        const invalidChars = ['I', 'O', 'Q', 'i', 'o', 'q'];
        for (let char of chassisNo) {
            if (invalidChars.includes(char)) {
                return "Chassis number cannot contain I, O, or Q.";
            }
        }

        const validChassisNumberRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
        if (!validChassisNumberRegex.test(chassisNo)) {
            return "Chassis number must only contain alphanumeric characters (A-Z, 0-9) and cannot contain I, O, or Q.";
        }

        return "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Form Data Before Submission:", formData);
        const sellerId = localStorage.getItem("sellerId");

        if (!sellerId) {
            alert("Seller ID is missing!");
            return;
        }

        // Validate chassis number
        const chassisValidationMessage = validateChassisNumber(formData.chassis_no);
        if (chassisValidationMessage) {
            setChassisError(chassisValidationMessage);
            return;
        }
        setChassisError(""); // Clear error if valid

        if (formData.manufacture_year > maxYearMonth) {
            alert("Manufacture year cannot be in the future.");
            return;
        }

        try {
            const res = await fetch("/api/sell-car", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, sellerId }),
            });

            const data = await res.json();
            if (data.success) {
                toast.success(data.message, {
                    position: "top-right",
                });
                localStorage.setItem("car-id", data.carId);
                router.push("/car-document");
            } else {
                toast.error(data.message, {
                    position: "top-right",
                });
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };
  return (

    <div>
        <Navbar/>
        <div className={`container ${styles.sellCarForm}`}>
      <h2 className='text-center my-4'>Sell Your Car</h2>
      <form onSubmit={handleSubmit} className={`row g-3 ${styles.formContainer}`}>

        {/* Name */}
        <div className={`col-md-6 ${styles.inputField}`}>
          <label className='form-label'>Name as per Document</label>
          <input type='text' name='sellername' className='form-control' value={formData.name} onChange={handleChange} required />
        </div>

        {/* Car Company */}
        <div className={`col-md-6 ${styles.inputField}`}>
        <label>Company:</label>
            <select name="company" value={formData.company} onChange={handleCompanyChange} required>
                <option value="" disabled>Select Company</option>
                {companies.map((company) => (
                    <option key={company} value={company}>{company}</option>
                ))}
            </select>
        </div>

        {/* Car Model */}
        <div className={`col-md-6 ${styles.inputField}`}>
          <label className='form-label'>Car Model</label>
          <select name="model" value={formData.model} onChange={handleModelChange} required disabled={!formData.company}>
                <option value="" disabled>Select Model</option>
                {models.map((model) => (
                    <option key={model} value={model}>{model}</option>
                ))}
            </select>
        </div>

        {/* Condition */}
        <div className={`col-md-6 ${styles.inputField}`}>
          <label className='form-label'>Condition</label>
          <select name='condition' className='form-select' value={formData.condition} onChange={handleChange} required>
            <option value='' disabled>Select Condition</option>
            <option value="Good">Good</option>
            <option value="Excellent">Excellent</option>
            <option value="Average">Average</option>
          </select>
        </div>

        {/* Insurance */}
        <div className={`col-md-6 ${styles.inputField}`}>
          <label className='form-label'>Insurance</label>
          <select name='insurance' className='form-select' value={formData.insurance} onChange={handleChange} required>
            <option value='' disabled>Select Insurance</option>
            <option value='Yes'>Yes</option>
            <option value='No'>No</option>
          </select>
        </div>

        {/* Car Color */}
        <div className={`col-md-6 ${styles.inputField}`}>
          <label className='form-label'>Car Color</label>
          <select name="color" value={formData.color} onChange={handleChange} required disabled={!formData.model}>
                <option value="" disabled>Select Color</option>
                {colors.map((color) => (
                    <option key={color} value={color}>{color}</option>
                ))}
            </select>
        </div>


       
        {/* Manufacture Year */}
        <div className={`mb-3 ${styles.inputField}`}>
                <label htmlFor="manufacture_year" className="form-label">
                    Manufacture Year
                </label>
                <input
                    type="month"
                    id="manufacture_year"
                    name="manufacture_year"
                    className="form-control"
                    required
                    max={maxYearMonth} // Restrict future dates
                    value={formData.manufacture_year}
                    onChange={handleChange}
                />
            </div>

        {/* Fuel Type */}
        <div className={`col-md-6 ${styles.inputField}`}>
          <label className='form-label'>Fuel Type</label>
          <select name='fuel_type' className='form-select' value={formData.fuel_type} onChange={handleChange} required>
            <option value='' disabled>Select Fuel Type</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="CNG">CNG</option>
          </select>
        </div>

        {/* Chassis Number */}
        <div className={`col-md-6 ${styles.inputField}`}>
                    <label className='form-label'>Chassis Number</label>
                    <input
                        type='text'
                        name='chassis_no'
                        className='form-control'
                        value={formData.chassis_no}
                        onChange={handleChange}
                        required
                    />
                    {chassisError && <small className="text-danger">{chassisError}</small>}
                </div>

        {/* Address */}
        <div className={`col-md-6 ${styles.inputField}`}>
                <label className='form-label'>Address</label>
          <input type='text' name='description' className='form-control' value={formData.description} onChange={handleChange} required />
        </div>

        {/* Kilometers Driven */}
        <div className={`col-md-6 ${styles.inputField}`}>
          <label className='form-label'>Kilometers Driven</label>
          <input type='number' name='kilometers' className='form-control' value={formData.kilometers_driven} onChange={handleChange} required />
        </div>

        {/* Minimum Price */}
        <div className={`col-md-6 ${styles.inputField}`}>
          <label className='form-label'>Minimum Price</label>
          <input type='number' min="1000" max="500000" name='min_price' className='form-control' value={formData.min_price} onChange={handleChange} required />
        </div>

        {/* Maximum Price */}
        <div className={`col-md-6 ${styles.inputField}`}>
          <label className='form-label'>Maximum Price</label>
          <input type='number' min="500000" max="15000000" name='max_price' className='form-control' value={formData.max_price} onChange={handleChange} required />
        </div>

         {/* Number of Previous Owners */}
         <div className={`col-md-6 ${styles.inputField}`}>
          <label className='form-label'>Previous Owners</label>
          <input type='number' name='owner_history' className='form-control' value={formData.prev_owners} onChange={handleChange} required />
        </div>

        {/* Submit Button */}
        <div className='col-12'>
          <button type='submit' className={`btn ${styles.submitBtn}`}>Submit</button>
        </div>

      </form>
    </div>
                <Footer/>
    </div>

    
  );
}
