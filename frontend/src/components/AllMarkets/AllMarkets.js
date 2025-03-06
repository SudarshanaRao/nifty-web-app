import React, { useEffect, useState } from "react";
import "./AllMarkets.css";
import axios from "axios";

const marketImages = {
  Bullish: "bullish.png",
  Bearish: "bearish.png",
  "Nifty Prediction": "nifty-prediction.png",
  "Bank Nifty Prediction": "bank-nifty-prediction.png",
};

const Card = ({ title, color, image, openTime, closeTime, onClick }) => {
  return (
    <div className={`all-card`} onClick={() => onClick(title)}>
      <div className="all-card-content">
        <h2>{title}</h2>
        <div className="all-time-container">
          <div className="all-time-left">
            <p className="all-des">Opens today</p>
            <p className="all-time">@ {openTime}</p>
          </div>
          <div className="all-timer-line"></div>
          <div className="all-time-right">
            <p className="all-des">Closes tomorrow</p>
            <p className="all-time">@ {closeTime}</p>
          </div>
        </div>
      </div>
      <div className={`all-card-icon ${title}`}>
        <img src={image} alt={title} className="all-icon" />
      </div>
    </div>
  );
};

const AllMarkets = () => {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await axios.get("http://localhost:4000/get/market");
        setMarketData(response.data.data || []);
      } catch (error) {
        console.error("Error fetching market data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMarketData();
  }, []);

  const handleMarketClick = async (marketName) => {
    setSelectedMarket(marketName);
    setDataLoading(true);
    setErrorMsg("");
  
    try {
      const response = await axios.get(
        `https://dev-api.nifty10.com/bid/get/allDayBid`
      );
      const data = response.data.data || [];
  
      const today = new Date().toISOString().split("T")[0];
  
      const filteredData = data.filter(
        (item) =>
          item.marketName === marketName &&
          item.active === true &&
          item.freeBid === false &&
          item.createdDate &&
          item.createdDate.startsWith(today)
      );
  
      if (filteredData.length === 0) {
        setErrorMsg("No data available for today.");
      }
  
      // **Sort numerically using bidName (converted from string to number)**
      const sortedData = filteredData.sort(
        (a, b) => Number(a.bidName) - Number(b.bidName)
      );
  
      console.log(sortedData);
      setTableData(sortedData);
    } catch (error) {
      setErrorMsg("Failed to load data.");
      console.error("Error fetching table data:", error);
    } finally {
      setDataLoading(false);
    }
  };
  
  

  return (
    <div className="all-markets-bg-container">
      <div className="all-cards-container">
        {loading ? (
          <p>Loading market data...</p>
        ) : (
          marketData.map((market) => (
            <Card
              key={market.marketId}
              title={market.marketName}
              color={market.marketName?.toLowerCase().replace(/\s+/g, "-") || "default"}
              image={marketImages[market.marketName] || "default.png"}
              openTime={market.openingTime}
              closeTime={market.closingTime}
              onClick={handleMarketClick}
            />
          ))
        )}
      </div>

      {selectedMarket && (
        <div className="markets-table-container">
          <div className={`popup-heading ${selectedMarket}`}>{selectedMarket}</div>
          <div className="table-container">
            {dataLoading ? (
              <p className="loading-message">Loading data, please wait...</p>
            ) : tableData.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Bid DATE</th>
                    <th>Value</th>
                    <th>Slots</th>
                    <th>Prize Pool</th>
                    <th>Status</th>
                    <th>First Prize</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row) => (
                    <tr key={row.dayWiseBidId}>
                      {/* <td>{row.bidId}</td> */}
                      <td>
                        {new Date(row.createdDate).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td>{row.bidName}</td>
                      <td>{row.bidSlots}</td>
                      <td>{row.poolPrize}</td>
                      <td className="market-table-status status-active">✅ Active</td>
                      <td>{row.firstPrize}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="error-msg">No data available for today.</p>
            )}
          </div>

        </div>
      )}
      <button className="all-floating-button">☰</button>
    </div>
  );
};

export default AllMarkets;
