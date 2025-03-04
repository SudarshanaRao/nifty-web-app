import React, { useEffect, useState } from "react";
import "./BullishPerformance.css";

const BullishPerformance = ({ onBack }) => {
  const [bullishStocks, setBullishStocks] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchBullishStocks = async () => {
      setLoading(true); // Start loading
      try {
        const response = await fetch("https://dev-api.nifty10.com/company");
        const data = await response.json();

        if (Array.isArray(data.data)) {
          const filteredBullishStocks = data.data.filter(
            (stock) => stock.liveBB === true && stock.companyStatus === "BULLISH"
          );

          setBullishStocks(filteredBullishStocks.slice(0, 5)); // Limit to 5 stocks
        } else {
          console.error("Unexpected API response format", data);
        }
      } catch (error) {
        console.error("Error fetching bullish stocks:", error);
      }
      setLoading(false); // Stop loading
    };

    fetchBullishStocks();
  }, []);

  return (
    <div className="bullish-container">
      <div className="bullish-header">
        <button className="bullish-back-btn" onClick={onBack}>&larr;</button>
        <h1 className="results-title">Bullish</h1>
      </div>
      <h2 className="bullish-subtitle">Add Day Performance For Final Result</h2>

      {loading ? (
        <div className="bullish-loading-container">
          <div className="bullish-loader"></div>
        </div>
      ) : (
        <table className="bullish-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            {bullishStocks.map((stock) => (
              <tr key={stock.companyCode}>
                <td>{stock.companyName}</td>
                <td><input type="text" className="bullish-input" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button className="bullish-submit-btn" disabled={loading}>Submit</button>
    </div>
  );
};

export default BullishPerformance;
