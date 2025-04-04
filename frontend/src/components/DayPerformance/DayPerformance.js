import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./DayPerformance.css";

const DayPerformance = ({ trend, onBack, marketId }) => {
  // Use the passed marketId or retrieve it from localStorage
  const effectiveMarketId = marketId;

  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState({});

  const userId = "556c3d52-e18d-11ef-9b7f-02fd6cfaf985"; // Default User ID

  // Get today's date in DD-MM-YYYY format
  const getTodayDate = () => {
    const today = new Date();
    const dd = today.getDate().toString().padStart(2, "0");
    const mm = (today.getMonth() + 1).toString().padStart(2, "0");
    const yyyy = today.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  useEffect(() => {
    // console.log("Received Market ID in DayPerformance:", effectiveMarketId);
    const fetchStocks = async () => {
      setLoading(true);
      try {
        const response = await fetch("https://dev-api.nifty10.com/company");
        const data = await response.json();
        if (data?.data && Array.isArray(data.data)) {
          const filteredStocks = data.data.filter(
            (stock) =>
              stock?.liveBB === true &&
              stock?.companyStatus.toUpperCase() === trend
          );
          setStocks(filteredStocks.slice(0, 5)); // Show only top 5
        } else {
          console.error("Unexpected API response format", data);
          setStocks([]);
        }
      } catch (error) {
        console.error(`Error fetching ${trend} stocks:`, error);
        setStocks([]);
      }
      setLoading(false);
    };
    fetchStocks();
  }, [trend, effectiveMarketId]);

  // Handle input change
  const handleInputChange = (companyId, value) => {
    setPerformanceData((prev) => ({
      ...prev,
      [companyId]: parseFloat(value) || 0,
    }));
  };

  // Handle form submission with updated payload format and toast notifications
  const handleSubmit = async () => {
    if (!effectiveMarketId) {
      console.error("Market ID is missing");
      toast.error("Market ID is required.");
      return;
    }
    // console.log("Market ID at submission:", effectiveMarketId);

    const formattedData = stocks.map((stock) => ({
      companyId: stock.companyId,
      companyName: stock.companyName,
      companyStatus: trend,
      rank: 0,
      point: 0,
      currentPoint: 0,
      dayPerformance: parseFloat(performanceData[stock.companyId]) || 0,
      specialCompany: false,
      liveBB: true,
    }));

    // Use today's date in DD-MM-YYYY format
    const todayDate = getTodayDate();

    // Build URL with query parameters
    const url = `https://dev-api.nifty10.com/bid/market/result?date=${todayDate}&marketId=${effectiveMarketId}&userId=${userId}`;
    // console.log("Submitting payload to URL:", url);
    // console.log("Payload:", JSON.stringify(formattedData, null, 2));

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.text();
        } catch (e) {
          errorData = "No error details provided";
        }
        console.error("API Error Response:", errorData);
        throw new Error("Failed to submit data");
      }

      toast.success("Result submitted successfully!");
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("Submission failed.");
    }
  };

  return (
    <div className="day-performance-container">
      <div className="performance-header">
        <button className="performance-back-btn" onClick={onBack}>
          &larr;
        </button>
        <h1 className="results-title">{trend}</h1>
      </div>
      <h2 className="performance-subtitle">Add Day Performance For Final Result</h2>

      {loading ? (
        <div className="performance-loading-container">
          <div className="performance-loader"></div>
        </div>
      ) : stocks.length > 0 ? (
        <table className="performance-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Day Performance</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => (
              <tr key={stock.companyId}>
                <td>{stock.companyName}</td>
                <td>
                  <input
                    type="number"
                    className="performance-input"
                    value={performanceData[stock.companyId] || ""}
                    required
                    onChange={(e) =>
                      handleInputChange(stock.companyId, e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-data-message">No {trend} stocks available</p>
      )}

      <button
        className="performance-submit-btn"
        onClick={handleSubmit}
        disabled={
          loading ||
          stocks.length === 0 ||
          !stocks.every((stock) => performanceData[stock.companyId] !== undefined && performanceData[stock.companyId] !== "")
        }
      >
        Submit
      </button>
    </div>
  );
};

export default DayPerformance;
