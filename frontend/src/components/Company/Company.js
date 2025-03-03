import React, { useEffect, useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import "./company.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function Company() {
    const [stocks, setStocks] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [companyData, setCompanyData] = useState(null);

    const getNextCompanyCode = () => {
        if (!stocks || stocks.length === 0) {
            return "#C00001";
        }

        const lastCompany = stocks.reduce((max, company) => {
            const num = parseInt(company.companyCode.replace("#C", ""), 10);
            return num > max ? num : max;
        }, 0);

        return `#C${String(lastCompany + 1).padStart(5, "0")}`;
    };

    const handleAddCompanySubmit = async (e) => {
        e.preventDefault();
    
        try {
            const payload = [
                {
                    active: true,
                    companyCode: companyData.companyCode,
                    companyId: companyData.companyId,
                    companyName: companyData.companyName,
                    companyPoint: parseFloat(companyData.companyPoint), // Ensure it's a double
                    companyStatus: "BULLISH",
                    createdBy: "556c3d52-e18d-11ef-9b7f-02fd6cfaf985",
                    createdDate: new Date().toISOString(), // Current timestamp
                    liveBB: false,
                    modifiedBy: "556c3d52-e18d-11ef-9b7f-02fd6cfaf985",
                    modifiedDate: new Date().toISOString(), // Current timestamp
                    rankNumber: parseInt(companyData.rankNumber, 10) || 0,
                }
            ];
    
            const response = await axios.post(
                "http://dev-api.nifty10.com/company/bulk/create?userId=556c3d52-e18d-11ef-9b7f-02fd6cfaf985", 
                payload, 
                {
                    headers: { "Content-Type": "application/json" },
                    mode: "cors",
                    withCredentials: true
                }
            );
    
            toast.success("Company added successfully!", { position: "top-right" });
            setStocks([...stocks, ...response.data]); // Append new data
            setShowModal(false);
        } catch (error) {
            console.error("Error adding company:", error);
            toast.error("Failed to add company. Check API and try again!", { position: "top-right" });
        }
    };
    

    const handleAddCompany = () => {
        setCompanyData({
            active: true,
            companyCode: getNextCompanyCode(), // Set new company code
            companyId: uuidv4(),
            companyName: "",
            companyPoint: 0,
            companyStatus: "BULLISH",
            createdBy: "556c3d52-e18d-11ef-9b7f-02fd6cfaf985",
            createdDate: new Date().toISOString(),
            liveBB: false,
            modifiedBy: "556c3d52-e18d-11ef-9b7f-02fd6cfaf985",
            modifiedDate: new Date().toISOString(),
            rankNumber: 1,
        });
        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCompanyData((prev) => ({
            ...prev,
            [name]: name === "companyPoint" ? parseFloat(value) : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form Data Submitted:", companyData);
        setStocks([...stocks, companyData]); // Update local state after submission
        setShowModal(false);
    };

    useEffect(() => {
        axios
            .get("http://localhost:4000/get/company")
            .then((response) => {
                let fetchedStocks = response.data.data || [];
                setStocks(fetchedStocks);
            })
            .catch((error) => console.error("Error fetching data:", error));
    }, []);

    return (
        <div id="companyContainer" className="company-container">
            <h1>NIFTY 50 STOCKS</h1>
            <ToastContainer position="top-right" style={{ marginTop: "65px" }} />

            <div className="add-company-btn">
                <button className="submit-button" onClick={handleAddCompany}>
                    ADD COMPANY
                </button>
            </div>

            {showModal && companyData && (
                <div className="company-popup">
                    <div className="company-popup-content">
                        <h2>Add Company</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="company-form-group">
                                <label htmlFor="companyName">Company Name</label>
                                <input
                                    type="text"
                                    id="companyName"
                                    name="companyName"
                                    placeholder="Enter Company Name"
                                    value={companyData.companyName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="company-form-group">
                                <label htmlFor="companyCode">Company Code</label>
                                <input
                                    type="text"
                                    id="companyCode"
                                    name="companyCode"
                                    value={companyData.companyCode}
                                    readOnly
                                />
                            </div>

                            <div className="company-form-group">
                                <label>Status</label>
                                <div className="company-radio-group">
                                    <input
                                        type="radio"
                                        name="companyStatus"
                                        value="BULLISH"
                                        checked={companyData.companyStatus === "BULLISH"}
                                        className="company-radio-input"
                                        onChange={handleChange}
                                    />
                                    <label className="company-radio-label">Bullish</label>

                                    <input
                                        type="radio"
                                        name="companyStatus"
                                        value="BEARISH"
                                        checked={companyData.companyStatus === "BEARISH"}
                                        className="company-radio-input"
                                        onChange={handleChange}
                                    />
                                    <label className="company-radio-label">Bearish</label>
                                </div>
                            </div>

                            <div className="company-form-group">
                                <label htmlFor="companyPoint">Company Point</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    id="companyPoint"
                                    name="companyPoint"
                                    placeholder="Enter Points"
                                    value={companyData.companyPoint}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" onClick={handleAddCompanySubmit} className="submit-btn">Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {!showModal && (
                <ul className="stocks-container">
                    {stocks.map((stock, index) => (
                        <li key={index} className="stock-box">
                            <span className="stock-symbol">{stock.companyName}</span>
                            <span className="stock-value">
                                {Math.max(Number(stock.companyPoint), 0)}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Company;
