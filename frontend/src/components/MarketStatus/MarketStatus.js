import React, { useEffect, useState } from "react";
import axios from "axios";
import "./style.css";

function MarketStatus() {
    const [activeTab, setActiveTab] = useState("marketStatus");
    const [stocks, setStocks] = useState([]);
    const [filter, setFilter] = useState(null);

    useEffect(() => {
        axios
            .get("http://localhost:4000/get/company")
            .then((response) => {
                console.log("API Response:", response.data);
                setStocks(response.data.data || []);
            })
            .catch((error) => console.error("Error fetching data:", error));
    }, []);

    const handleStatusChange = (companyCode, newStatus) => {
        setStocks((prevStocks) =>
            prevStocks.map((stock) =>
                stock.companyCode === companyCode ? { ...stock, companyStatus: newStatus } : stock
            )
        );
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === "marketStatus") setFilter(null);
    };

    const handleToggleChange = (newFilter) => {
        setFilter((prevFilter) => (prevFilter === newFilter ? null : newFilter));
    };

    const filteredStocks = filter ? stocks.filter((stock) => stock.companyStatus === filter) : stocks;

    return (
        <div id="marketStatusContainer" className="container">
            <div className="tab-container">
                <button
                    className={`tab ${activeTab === "marketStatus" ? "active" : ""}`}
                    onClick={() => handleTabChange("marketStatus")}
                >
                    Market Status
                </button>
                <button
                    className={`tab ${activeTab === "liveBB" ? "active" : ""}`}
                    onClick={() => handleTabChange("liveBB")}
                >
                    Live BB
                </button>
            </div>

            {activeTab === "marketStatus" && (
                <>
                    <div className="toggle-container">
                        <button
                            className={`toggle-button ${filter === "BULLISH" ? "active" : ""}`}
                            onClick={() => handleToggleChange("BULLISH")}
                        >
                            Bullish
                        </button>
                        <button
                            className={`toggle-button ${filter === "BEARISH" ? "active" : ""}`}
                            onClick={() => handleToggleChange("BEARISH")}
                        >
                            Bearish
                        </button>
                    </div>

                    <div className="stocks-container">
                        {filteredStocks.map((stock) => (
                            <div key={stock.companyCode} className="stock-box">
                                <span className="stock-symbol">{stock.companyName}</span>
                                <div className="radio-group">
                                    <label>
                                        <input
                                            type="radio"
                                            name={`status-${stock.companyCode}`}
                                            value="BULLISH"
                                            checked={stock.companyStatus === "BULLISH"}
                                            onChange={() => handleStatusChange(stock.companyCode, "BULLISH")}
                                        />
                                        Bullish
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name={`status-${stock.companyCode}`}
                                            value="BEARISH"
                                            checked={stock.companyStatus === "BEARISH"}
                                            onChange={() => handleStatusChange(stock.companyCode, "BEARISH")}
                                        />
                                        Bearish
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="submit-button">Submit</button>
                </>
            )}

            {activeTab === "liveBB" && (
                <div className="live-bb-container">
                    <h2>Live BB Content Goes Here</h2>
                </div>
            )}
        </div>
    );
}

export default MarketStatus;
