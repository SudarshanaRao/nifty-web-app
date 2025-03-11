import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "./Dashboard.css";


const marketGradients = {
  Bullish: "linear-gradient(135deg, #B2F2BB, #8EE4AF)",
  Bearish: "linear-gradient(135deg, #FFB3B3, #FF6F61)",
  "Nifty Prediction": "linear-gradient(135deg, #A7C7E7, #74A9D8)",
  "Bank Nifty Prediction": "linear-gradient(135deg, #FFD8A8, #FFAD60)",
};


const BoxGraph = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState("2025");

  const fetchAllMarketsData = useCallback(async () => {
    setLoading(true);
    try {
        const formattedDate = new Date().toLocaleDateString("en-GB").split("/").join("-") - 6;
        const userId = "556c3d52-e18d-11ef-9b7f-02fd6cfaf985";
        const marketIds = [
            "6187ba91-e190-11ef-9b7f-02fd6cfaf985",
            "877c5f82-e190-11ef-9b7f-02fd6cfaf985",
            "97f37603-e190-11ef-9b7f-02fd6cfaf985",
            "9f0c2c24-e190-11ef-9b7f-02fd6cfaf985",
        ]; // Market IDs

        // Fetch data for all markets
        const apiRequests = marketIds.map(marketId =>
            fetch(`https://dev-api.nifty10.com/bid/market?Date=${formattedDate}&marketId=${marketId}&userId=${userId}`)
                .then(response => response.json())
        );

        const results = await Promise.all(apiRequests);
        
        // Flatten the response and handle missing data
        const allMarketData = results.flatMap(result => result?.data || []);
        
        if (allMarketData.length === 0) {
            console.warn("No market data received");
        }

        // **Filter out freeBid === false**
        const filteredData = allMarketData.filter(bid => bid?.freeBid === false);

        const marketWiseData = {};
        const uniqueBidNames = new Set();

        filteredData.forEach((bid) => {
            const { bidName, marketName, totalAvailableCount, bidSlots } = bid;

            if (!bidName || !marketName || totalAvailableCount == null || bidSlots == null) {
                console.warn("Skipping invalid bid entry:", bid);
                return;
            }

            const completedBids = bidSlots - totalAvailableCount + 10;
            uniqueBidNames.add(bidName);

            if (!marketWiseData[bidName]) {
                marketWiseData[bidName] = { bidName, Bullish: 0, Bearish: 0, "Nifty Prediction": 0, "Bank Nifty Prediction": 0 };
            }

            if (marketGradients[marketName]) {
                // Ensure initialization before addition
                if (!marketWiseData[bidName][marketName]) {
                    marketWiseData[bidName][marketName] = 0;
                }
                marketWiseData[bidName][marketName] += completedBids;
            }
        });

        const formattedData = Array.from(uniqueBidNames)
            .sort((a, b) => a.localeCompare(b))
            .map((bidName) => marketWiseData[bidName]);

        console.log("Formatted Data:", formattedData);
        
        setData(formattedData.length > 0 ? formattedData : []);
    } catch (error) {
        console.error("Error fetching data:", error);
    } finally {
        setLoading(false);
    }
}, []);

useEffect(() => {
    fetchAllMarketsData();
}, [fetchAllMarketsData]);



  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>Market-Wise Bid Analysis</h3>
        <div className="time-filters">
          <span className="active">Last 24hrs</span>
        </div>
        <select
          className="year-select"
          onChange={(e) => setYear(e.target.value)}
          value={year}
        >
          <option value="2025">2025 Year</option>
          <option value="2024">2024 Year</option>
        </select>
      </div>

      {loading ? (
        <div className="box-graph-load-container">
          <p className="loading-message box-graph-load">Loading data, please wait...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="box-graph-load-container">
          <p className="error-msg">No data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={330} margin={{ bottom: 50 }}>
          <BarChart data={data} barSize={20}>
            <defs>
              <linearGradient id="bullishGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#B2F2BB" />
                <stop offset="100%" stopColor="#8EE4AF" />
              </linearGradient>
              <linearGradient id="bearishGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFB3B3" />
                <stop offset="100%" stopColor="#FF6F61" />
              </linearGradient>
              <linearGradient id="niftyGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#A7C7E7" />
                <stop offset="100%" stopColor="#74A9D8" />
              </linearGradient>
              <linearGradient id="bankNiftyGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFD8A8" />
                <stop offset="100%" stopColor="#FFAD60" />
              </linearGradient>
            </defs>

            <XAxis 
              dataKey="bidName" 
              axisLine={true} 
              tick={{ fill: "#aaa" }} 
              label={{
                value: "Entry Fee", 
                position: "outsideBottom",
                dy: 10, 
                fill: "#666",
                fontSize: 14,
                fontWeight: "bold",
              }} 
            />

            <YAxis 
              axisLine={true} 
              tick={{ fill: "#aaa" }} 
              domain={[0, 200]} 
              label={{
                value: "Bid Slots", 
                angle: -90, 
                position: "insideLeft",
                fill: "#666",
                dx: 7,  
                dy: 0,
                fontSize: 14,
                fontWeight: "bold",
                margin: "10px",
              }} 
            />

            <Tooltip
              content={({ payload }) => {
                if (!payload || payload.length === 0) return null;
                return (
                  <div className="custom-tooltip">
                    <p className="tooltip-title">{payload[0].payload.bidName}</p>
                    {payload.map((entry, index) => (
                      <div key={index} className="tooltip-item">
                        <span
                          className="tooltip-color-box"
                          style={{ background: marketGradients[entry.name] }}
                        ></span>
                        <span
                          className="tooltip-text"
                          style={{
                            background: marketGradients[entry.name],
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                        >
                          {entry.name}: {entry.value}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />

            <Legend />

            <Bar dataKey="Bullish" fill="url(#bullishGradient)" radius={[5, 5, 0, 0]} />
            <Bar dataKey="Bearish" fill="url(#bearishGradient)" radius={[5, 5, 0, 0]} />
            <Bar dataKey="Nifty Prediction" fill="url(#niftyGradient)" radius={[5, 5, 0, 0]} />
            <Bar dataKey="Bank Nifty Prediction" fill="url(#bankNiftyGradient)" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default BoxGraph;
