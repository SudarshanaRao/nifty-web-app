import React, { useEffect, useState } from "react";
import "./DayPerformance.css";

const DayPerformance = ({ trend, onBack }) => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStocks = async () => {
      setLoading(true);
      try {
        const response = await fetch("https://prod-api.nifty10.com/company");
        const data = await response.json();

        if (data?.data && Array.isArray(data.data)) {
          const filteredStocks = data.data.filter(
            (stock) =>
              stock?.liveBB === true && stock?.companyStatus.toUpperCase() === trend
          );

          setStocks(filteredStocks.slice(0, 5)); // Limit to 5 stocks
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
  }, [trend]); // Refetch data when the trend changes

  return (
    <div className="day-performance-container">
      <div className="performance-header">
        <button className="performance-back-btn" onClick={onBack}>&larr;</button>
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
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => (
              <tr key={stock.companyCode}>
                <td>{stock.companyName}</td>
                <td><input type="text" className="performance-input" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-data-message">No {trend} stocks available</p>
      )}

      <button className="performance-submit-btn" disabled={loading}>Submit</button>
    </div>
  );
};

export default DayPerformance;
