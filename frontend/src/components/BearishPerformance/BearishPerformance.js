import React, { useEffect, useState } from "react";
import "./BearishPerformance.css";

const BearishPerformance = ({ onBack }) => {
  const [bearishStocks, setBearishStocks] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchBearishStocks = async () => {
      setLoading(true); // Start loading
      try {
        const response = await fetch("https://dev-api.nifty10.com/company");
        const data = await response.json();

        if (data?.data && Array.isArray(data.data)) {
          const filteredBearishStocks = data.data.filter(
            (stock) => stock?.liveBB === true && stock?.companyStatus === "BEARISH"
          );

          setBearishStocks(filteredBearishStocks.slice(0, 5)); // Limit to 5 stocks
        } else {
          console.error("Unexpected API response format", data);
          setBearishStocks([]); // Reset state on unexpected format
        }
      } catch (error) {
        console.error("Error fetching bearish stocks:", error);
        setBearishStocks([]); // Ensure UI remains stable on error
      }
      setLoading(false); // Stop loading
    };

    fetchBearishStocks();
  }, []);

  return (
    <div className="bearish-container">
      <div className="bearish-header">
        <button className="bearish-back-btn" onClick={onBack}>&larr;</button>
        <h1 className="results-title">Bearish</h1>
      </div>
      <h2 className="bearish-subtitle">Add Day Performance For Final Result</h2>

      {loading ? (
        <div className="bearish-loading-container">
          <div className="bearish-loader"></div>
        </div>
      ) : bearishStocks.length > 0 ? (
        <table className="bearish-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            {bearishStocks.map((stock) => (
              <tr key={stock.companyCode}>
                <td>{stock.companyName}</td>
                <td><input type="text" className="bearish-input" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-data-message">No bearish stocks available</p>
      )}

      <button className="bearish-submit-btn" disabled={loading}>Submit</button>
    </div>
  );
};

export default BearishPerformance;
