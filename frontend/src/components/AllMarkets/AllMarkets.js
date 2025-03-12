import React, { useEffect, useState } from "react";
import "./AllMarkets.css";
import axios from "axios";
import BidPieChart from "../Dashboard/PieChart";
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
  const [isActive, setIsActive] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)
  const [selectedBidData, setSelectedBidData] = useState(null)

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

  const getMarketData = async (marketId) => {
    setDataLoading(true);
    setErrorMsg("");

    try {
        const formattedDate = new Date().toLocaleDateString("en-GB").split("/").join("-");
        const userId = "556c3d52-e18d-11ef-9b7f-02fd6cfaf985";
        const apiUrl = `https://dev-api.nifty10.com/bid/market?Date=${formattedDate}&marketId=${marketId}&userId=${userId}`;

        const response = await axios.get(apiUrl);
        const data = response.data.data || [];

        if (!data.length) setErrorMsg("No data available for today.");

        return data;
    } catch (error) {
        setErrorMsg("Failed to load data.");
        console.error("Error fetching market data:", error);
        return [];
    } finally {
        setDataLoading(false);
    }
};


const handleMarketClick = async (marketId, marketName) => {
    setSelectedMarket(marketName);
    setDataLoading(true);
    setErrorMsg("");

    try {
        
        const data = await getMarketData(marketId)

        if (data.length === 0) {
            setErrorMsg("No data available for today.");
        }

        // **Sort numerically using bidName (converted from string to number)**
        const sortedData = data.sort(
            (a, b) => Number(a.bidName) - Number(b.bidName)
        );
        const filteredData = sortedData.filter(item => item.freeBid === false);

        setTableData(filteredData);
    } catch (error) {
        setErrorMsg("Failed to load data.");
        console.error("Error fetching table data:", error);
    } finally {
        setDataLoading(false);
    }
};


const rowSelected = async (id, marketId) => {
  if (!isActive) {
      setIsActive(true);
      setSelectedRow(id);
      setErrorMsg(""); // Clear previous errors

      try {
          const formattedDate = new Date().toLocaleDateString("en-GB").split("/").join("-");
          const userId = "556c3d52-e18d-11ef-9b7f-02fd6cfaf985";
          const apiUrl = `https://dev-api.nifty10.com/bid/market?Date=${formattedDate}&marketId=${marketId}&userId=${userId}`;

          const response = await axios.get(apiUrl);
          const data = response.data.data || [];

          if (!data.length) {
              setErrorMsg("No data available for today.");
              return;
          }

          const selectedBid = data.find((bid) => bid.dayWiseBidId === id && bid.marketId === marketId);
          
          if (selectedBid) {
            const { bidName, bidSlots, dayWiseBidId, totalAvailableCount, marketName } = selectedBid;

            const filledCount = bidSlots - totalAvailableCount; // Placed bids
            const percentage = bidSlots > 0 ? ((filledCount / bidSlots) * 100).toFixed(2) : "0.00";

            
            // Calculate remaining bids
            const completedBids = bidSlots - totalAvailableCount;
            
            setSelectedBidData({ bidName, dayWiseBidId, bidSlots, totalAvailableCount, marketName, percentage, completedBids });
            
          } else {
              console.log("Bid not found.");
          }
      } catch (error) {
          console.error("Error fetching data:", error);
          setErrorMsg("Failed to load data.");
      }
  } else {
      setIsActive(false);
      setSelectedRow(null);
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
              onClick={() => {handleMarketClick(market.marketId, market.marketName)}}
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
                      <th>Index</th>
                      <th>Value</th>
                      <th>Slots</th>
                      <th>Prize Pool</th>
                      <th>Status</th>
                      <th>First Prize</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, index) => (
                      <tr 
                        key={row.dayWiseBidId} 
                        onClick={() => rowSelected(row.dayWiseBidId, row.marketId)}
                        className={selectedRow === row.dayWiseBidId ? "row-active" : ""}
                      >
                        {/* <td>{row.bidId}</td> */}
                        <td>{index + 1}</td>
                        <td>{row.bidName}</td>
                        <td>{row.bidSlots}</td>
                        <td>{row.poolPrize}</td>
                        <td className="market-table-status status-active">{row.active ? '✅ Active' : '❌ Inactive'}</td>
                        <td>{row.firstPrize}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="error-msg">{errorMsg}</p>
              )}
            </div>
            {selectedBidData && <BidPieChart {...selectedBidData} />}
        </div>
      )}
      <button className="all-floating-button">☰</button>
    </div>
  );
};

export default AllMarkets;
