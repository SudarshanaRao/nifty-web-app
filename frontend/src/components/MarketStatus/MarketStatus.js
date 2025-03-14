import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./MarketStatus.css";

function MarketStatus() {
    const [activeTab, setActiveTab] = useState("marketStatus");
    const [stocks, setStocks] = useState([]);
    const [filter, setFilter] = useState("BEARISH");
    const [isSubmitActive, setIsSubmitActive] = useState(false);
    const [pendingUpdates, setPendingUpdates] = useState({});
    const [selectedStocks, setSelectedStocks] = useState({});
    const [visibleStocks, setVisibleStocks] = useState(stocks);

    useEffect(() => {
        setVisibleStocks(stocks);
        const updatedPendingUpdates = Object.fromEntries(
            stocks.map(stock => [stock.companyCode, filter])
        );
    
        setPendingUpdates(updatedPendingUpdates);
        setIsSubmitActive(true);
    
        // Ensure all stocks are visible with updated status
        setVisibleStocks(stocks.map(stock => ({
            ...stock,
            companyStatus: filter,
        })));
    }, [filter, stocks]);

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

    const handleTabChange = async (tab) => {
        setActiveTab(tab);
        handleToggleChange("BEARISH")
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
            ...stock, // Keep all original properties
            liveBB: stock.companyStatus === "BEARISH"
                ? selectedBearishStocks.includes(stock) // True only for selected bearish stocks
                : stock.companyStatus === "BULLISH"
                ? selectedBullishStocks.includes(stock) // True only for selected bullish stocks
                : false, // Default to false for all others
        }));
    
        try {
            const response = await axios.put(
                "https://dev-api.nifty10.com/company/bulk/update/company",
                updatedStockData.map(({ companyId, companyStatus, liveBB }) => ({ companyId, companyStatus, liveBB })), // Send only necessary data
                {
                    params: { userId: "556c3d52-e18d-11ef-9b7f-02fd6cfaf985" },
                    headers: { "Content-Type": "application/json" },
                }
            );
    
            console.log("Proceed API Response:", response.data);
            toast.success("Live BB status updated successfully!", { position: "top-right" });
    
            setStocks(updatedStockData); // ✅ Keeps full stock object to prevent UI issues
    
            // Reset selection after successful API call
            setSelectedStocks({});
            handleTabChange("liveBB");
    
        } catch (error) {
            console.error("API Error:", error.response?.data || error.message);
            toast.error("Failed to update Live BB status!", { position: "top-right" });
        }
    };
    
    
    const handleToggleChange = (newFilter) => {
            setFilter(newFilter);
            setFilter(newFilter);
        
            const defaultStatus = newFilter.toUpperCase(); // "BULLISH" or "BEARISH"
        
            // Set all stocks to the selected status (Bullish or Bearish)
            const updatedPendingUpdates = Object.fromEntries(
                stocks.map(stock => [stock.companyCode, defaultStatus])
            );
        
            setPendingUpdates(updatedPendingUpdates);
            setIsSubmitActive(true);
        
            // Ensure all stocks are visible with updated status
            setVisibleStocks(stocks.map(stock => ({
                ...stock,
                companyStatus: defaultStatus,
            })));
    };

    const handleStatusChange = (companyCode, newStatus) => {
        setPendingUpdates((prev) => ({
            ...prev,
            [companyCode]: newStatus, // Allow manual updates per stock
        }));
    
        setIsSubmitActive(true);
    };
    
    
    const handleSubmit = async () => {
        if (!isSubmitActive) return;
    
        // Ensure all 50 stocks are updated with the selected filter (Bullish/Bearish)
        const updatedStocks = stocks.map(stock => ({
            ...stock,
            companyStatus: pendingUpdates[stock.companyCode] || stock.companyStatus,
        }));
    
        try {
            await Promise.all(
                updatedStocks.map(updatedStock =>
                    axios.post(
                        "https://dev-api.nifty10.com/company/update/company",
                        {
                            companyId: updatedStock.companyId,
                            companyName: updatedStock.companyName,
                            companyCode: updatedStock.companyCode,
                            companyPoint: updatedStock.companyPoint || 0,
                            companyStatus: updatedStock.companyStatus,
                            liveBB: false,
                            active: true,
                        },
                        {
                            params: { userId: "556c3d52-e18d-11ef-9b7f-02fd6cfaf985" },
                            headers: { "Content-Type": "application/json" },
                        }
                    )
                )
            );
    
            setStocks(updatedStocks);
            setPendingUpdates({});
            setIsSubmitActive(false);
            toast.success("Market status updated successfully!", { position: "top-right" });
    
        } catch (error) {
            console.error("API Error:", error.response?.data || error.message);
            toast.error("Failed to update market status!", { position: "top-right" });
        }
    };
    const liveBBStocks = stocks.sort((a, b) => {
        const statusA = a.companyStatus === (filter || "BEARISH") ? 1 : 0;
        const statusB = b.companyStatus === (filter || "BEARISH") ? 1 : 0;
        
        return statusB - statusA; // Sort bullish (1) before bearish (0)
      });
      

    return (
        <div id="marketStatusContainer" className="market-status-container">
            <div className="markets-header-container">
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
            
            {activeTab === "marketStatus" && (
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
            )}
            </div>

            {activeTab === "marketStatus" && (
                <>
                
                    <div className="market-stocks-container">
                        {visibleStocks.map((stock) => (
                            <div key={stock.companyCode} className="stock-box">
                                <span className="stock-symbol">{stock.companyName}</span>
                                <div className="radio-group">
                                    <label>
                                        <input
                                            type="radio"
                                            name={`status-${stock.companyCode}`}
                                            value="BULLISH"
                                            checked={
                                                pendingUpdates[stock.companyCode] !== undefined
                                                    ? pendingUpdates[stock.companyCode] === "BULLISH"
                                                    : stock.companyStatus === "BULLISH"
                                            }
                                            onChange={() => handleStatusChange(stock.companyCode, "BULLISH")}
                                        />
                                        Bullish
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name={`status-${stock.companyCode}`}
                                            value="BEARISH"
                                            checked={
                                                pendingUpdates[stock.companyCode] !== undefined
                                                    ? pendingUpdates[stock.companyCode] === "BEARISH"
                                                    : stock.companyStatus === "BEARISH"
                                            }
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
                    {selectedCount === 10 ? "" : <div>
                            <p className="selection-msg">Kindly select 5 BULLISH and 5 BEARISH to proceed</p>
                        </div>
                    }
                    
                    <div className='live-bb-container'>
                        {liveBBStocks.map((stock) => (
                            <div key={stock.companyCode} className={`stock-box live-stock-box ${isStockDisabled(stock) && !selectedStocks[stock.companyCode] ? "disabled-container" : ""}`}>
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
        </div>
    );
}

export default MarketStatus;
