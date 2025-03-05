import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./MarketStatus.css";

function MarketStatus() {
    const [activeTab, setActiveTab] = useState("marketStatus");
    const [stocks, setStocks] = useState([]);
    const [filter, setFilter] = useState(null);
    const [isSubmitActive, setIsSubmitActive] = useState(false);
    const [selectedStocks, setSelectedStocks] = useState({});
    const [hasToggled, setHasToggled] = useState(false);
    const [trueBullishStocks, setTrueBullishStocks] = useState([]);
    const [trueBearishStocks, setTrueBearishStocks] = useState([]);

    useEffect(() => {
        setTrueBullishStocks(stocks.filter(stock => stock.companyStatus === "BULLISH" && stock.liveBB));
        setTrueBearishStocks(stocks.filter(stock => stock.companyStatus === "BEARISH" && stock.liveBB));
    }, [stocks]);

    useEffect(() => {
        axios
            .get("http://localhost:4000/get/company")
            .then((response) => {
                setStocks(response.data.data || []);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                toast.error("Failed to fetch company data.");
            });
    }, []);

    const handleStatusChange = (companyCode, newStatus) => {
        setStocks((prevStocks) =>
            prevStocks.map((stock) =>
                stock.companyCode === companyCode
                    ? { ...stock, companyStatus: newStatus, isSelected: true }
                    : stock
            )
        );
        setIsSubmitActive(true);
    };

    const handleTabChange = async (tab) => {
        setActiveTab(tab);
        if (tab === "marketStatus") setFilter(null);
        setHasToggled(false)
        
        try {
            const response = await axios.get("https://dev-api.nifty10.com/company");
            const updatedStocks = response.data.data;
            setStocks(updatedStocks);
            
            setTrueBullishStocks(updatedStocks.filter(stock => stock.companyStatus === "BULLISH" && stock.liveBB));
            setTrueBearishStocks(updatedStocks.filter(stock => stock.companyStatus === "BEARISH" && stock.liveBB));
        } catch (error) {
            console.error("Failed to fetch stocks:", error);
        }
    };

    const handleToggleChange = (newFilter) => {
        setHasToggled(true);
        setFilter(newFilter);
        // setFilter((prevFilter) => (prevFilter === newFilter ? null : newFilter));
        // setSelectedStocks({});
    };

    const handleCheckboxChange = (event, companyCode) => {
        setSelectedStocks((prevSelected) => {

            const updatedSelected = { ...prevSelected };
    
            if (event.target.checked) {
                if (Object.keys(updatedSelected).length < 10) {
                    updatedSelected[companyCode] = true;
                }
            } else {
                delete updatedSelected[companyCode];
            }
    
            return updatedSelected;
        });
    };
    const selectedCount = Object.keys(selectedStocks).length;
    const isStockDisabled = (stock) => {
        if (stock.companyStatus === "BEARISH") {
            return selectedBearishCount >= 5 && !selectedBearishStocks[stock.companyCode];
        }
        if (stock.companyStatus === "BULLISH") {
            return selectedBullishCount >= 5 && !selectedBullishStocks[stock.companyCode];
        }
        return false;
    };

    const bearishStocks = stocks.filter(stock => stock.companyStatus === "BEARISH");
    const bullishStocks = stocks.filter(stock => stock.companyStatus === "BULLISH");

    // Get the selected stocks from the user
    const selectedBearishStocks = bearishStocks.filter(stock => selectedStocks[stock.companyCode]);
    const selectedBullishStocks = bullishStocks.filter(stock => selectedStocks[stock.companyCode]);

    const selectedBearishCount = selectedBearishStocks.length;
    const selectedBullishCount = selectedBullishStocks.length;


    const handleProceed = async () => {
        if (selectedCount < 10) {
            toast.warn("Please select exactly 10 stocks to proceed!", { position: "top-right" });
            return;
        }

        const updatedStockData = stocks.map(stock => ({
            companyId: stock.companyId,
            companyStatus: stock.companyStatus,
            liveBB: stock.companyStatus === "BEARISH"
                ? selectedBearishStocks.includes(stock) // True only for selected bearish stocks
                : stock.companyStatus === "BULLISH"
                ? selectedBullishStocks.includes(stock) // True only for selected bullish stocks
                : false, // All other stocks should have liveBB: false
        }));
        
        
    
        try {
            const response = await axios.put(
                "https://dev-api.nifty10.com/company/bulk/update/company",
                updatedStockData,
                {
                    params: { userId: "556c3d52-e18d-11ef-9b7f-02fd6cfaf985" },
                    headers: { "Content-Type": "application/json" },
                }
            );
    
            console.log("Proceed API Response:", response.data);
            toast.success("Live BB status updated successfully!", { position: "top-right" });

            setStocks(updatedStockData);
            setTrueBullishStocks(updatedStockData.filter(stock => stock.companyStatus === "BULLISH" && stock.liveBB));
            setTrueBearishStocks(updatedStockData.filter(stock => stock.companyStatus === "BEARISH" && stock.liveBB));
            
            // Reset selection after successful API call
            setSelectedStocks({});
            handleTabChange("liveBB")
            
        } catch (error) {
            console.error("API Error:", error.response?.data || error.message);
            toast.error("Failed to update Live BB status!", { position: "top-right" });
        }
    };
    
    

    const handleSubmit = async () => {
        if (!isSubmitActive) return;

        const updatedStocks = stocks.filter((stock) => stock.isSelected);

        if (updatedStocks.length === 0) {
            toast.warn("Please select at least one stock to update!", { position: "top-right" });
            return;
        }

        try {
            await Promise.all(
                updatedStocks.map(async (updatedStock) => {
                    const requestData = {
                        companyId: updatedStock.companyId,
                        companyName: updatedStock.companyName,
                        companyCode: updatedStock.companyCode,
                        rankNumber: updatedStock.rankNumber || 0,
                        companyPoint: updatedStock.companyPoint || 0,
                        companyStatus: updatedStock.companyStatus,
                        liveBB: false,
                        createdBy: "556c3d52-e18d-11ef-9b7f-02fd6cfaf985",
                        createdDate: new Date().toISOString(),
                        modifiedBy: "556c3d52-e18d-11ef-9b7f-02fd6cfaf985",
                        modifiedDate: new Date().toISOString(),
                        active: true,
                    };

                    console.log("Sending data:", requestData);

                    const response = await axios.post(
                        "https://dev-api.nifty10.com/company/update/company",
                        requestData,
                        {
                            params: { userId: "556c3d52-e18d-11ef-9b7f-02fd6cfaf985" },
                            headers: { "Content-Type": "application/json" },
                        }
                    );

                    console.log("API Response:", response.data);
                    toast.success(`Market status updated for ${updatedStock.companyName}`, {
                        position: "top-right",
                    });
                })
            );

            setIsSubmitActive(false);
        } catch (error) {
            console.error("API Error:", error.response?.data || error.message);
            toast.error("Failed to update market status!", { position: "top-right" });
        }
    };

    const filteredStocks = filter ? stocks.filter((stock) => stock.companyStatus === filter) : stocks;

    const liveBBStocks = stocks.filter((stock) => stock.companyStatus === (filter || "BEARISH"));

    return (
        <div id="marketStatusContainer" className="market-status-container">
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
            <ToastContainer position="top-right" style={{ marginTop: "65px" }} />
            

            <div className="toggle-switch-container">
                <span className="toggle-text">BEARISH</span>
                <div>
                    <label className="switch-button" htmlFor="switch">
                        <div className="switch-outer">
                            <input
                                id="switch"
                                type="checkbox"
                                checked={filter === "BULLISH"}
                                onChange={() => handleToggleChange(filter === "BULLISH" ? "BEARISH" : "BULLISH")}
                            />
                            <div className="button">
                                <span className="button-toggle"></span>
                                <span className="button-indicator"></span>
                            </div>
                        </div>
                    </label>
                </div>
                <span className="toggle-text">BULLISH</span>
            </div>

            {activeTab === "marketStatus" && (
                <>
                
                    <div className="market-stocks-container">
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
                    <button className="submit-button" disabled={!isSubmitActive} onClick={handleSubmit}>
                        Submit
                    </button>
                </>
            )}

            {activeTab === "liveBB" && (
                <>
                    {!hasToggled ? (
                            <div className="custom-stocks-container">
                            <div className="custom-stocks-column custom-bullish-column">
                                <h3 className="custom-column-title">BULLISH</h3>
                                {trueBullishStocks.slice(0, 5).map(stock => (
                                    <div key={stock.companyCode} className="custom-stock-item">
                                        <span className="custom-stock-name">{stock.companyName}</span>
                                        <span className="custom-stock-name">{stock.companyPoint}</span>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="custom-stocks-column custom-bearish-column">
                                <h3 className="custom-column-title">BEARISH</h3>
                                {trueBearishStocks.slice(0, 5).map(stock => (
                                    <div key={stock.companyCode} className="custom-stock-item">
                                        <span className="custom-stock-name">{stock.companyName}</span>
                                        <span className="custom-stock-name">{stock.companyPoint}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    
                    ) : (
                        <>
                    {selectedCount === 10 ? "" : <div>
                            <p className="selection-msg">Kindly select 5 BULLISH and 5 BEARISH to proceed</p>
                        </div>
                    }
                    
                    <div className='live-bb-container'>
                        {liveBBStocks.map((stock) => (
                            <div key={stock.companyCode} className={`stock-box ${isStockDisabled(stock) && !selectedStocks[stock.companyCode] ? "disabled-container" : ""}`}>
                                <input
                                    type="checkbox"
                                    className="live-checkbox"
                                    name={`status-${stock.companyCode}`}
                                    value={stock.companyStatus}
                                    checked={!!selectedStocks[stock.companyCode]}
                                    onChange={(e) => handleCheckboxChange(e, stock.companyCode)}
                                    disabled={isStockDisabled(stock) && !selectedStocks[stock.companyCode]}   
                                />
                                <span className="stock-symbol">{stock.companyName}</span>
                                <div className="radio-group">
                                    <label>
                                        <input
                                            type="radio"
                                            name={`status-${stock.companyCode}`}
                                            value={stock.companyStatus}
                                            checked={stock.companyStatus === "BULLISH" || stock.companyStatus === "BEARISH"}
                                            disabled={isStockDisabled(stock)}
                                        />
                                        {stock.companyStatus === "BULLISH" ? "Bullish" : "Bearish"}
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="submit-button" onClick={handleProceed} disabled={selectedCount < 10}>
                        Proceed
                    </button>
                    </>
                    )}
                </>
            )}
            
        </div>
    );
}

export default MarketStatus;
