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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("https://dev-api.nifty10.com/bid/get/allResult");
      const result = await response.json();
  
      if (!result.data || !Array.isArray(result.data)) {
        setData([]);
        return;
      }
  
      const now = new Date();
      const currentHour = now.getHours();
      const currentDate = now.getDate();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
  
      let cycleStart, cycleEnd;
  
      if (currentHour >= 9 && currentHour < 16) {
        // If time is between 9:00 AM and 4:00 PM, take the last market cycle (Yesterday 4:00 PM to Today 9:00 AM)
        cycleStart = new Date(currentYear, currentMonth, currentDate - 1, 16, 0, 0);
        cycleEnd = new Date(currentYear, currentMonth, currentDate, 9, 0, 0);
      } else if(currentHour >= 16 && currentHour < 24) {
        // If time is after 4:00 PM or before 9:00 AM, take today's cycle (Today 4:00 PM to Tomorrow 9:00 AM)
        cycleStart = new Date(currentYear, currentMonth, currentDate, 16, 0, 0);
        cycleEnd = new Date(currentYear, currentMonth, currentDate + 1, 9, 0, 0);
      } else {
        cycleStart = new Date(currentYear, currentMonth, currentDate - 1, 16, 0, 0);
        cycleEnd = new Date(currentYear, currentMonth, currentDate, 9, 0, 0);
      }
  
      const marketWiseData = {};
      const uniqueBidNames = new Set();
  
      result.data.forEach((bid) => {
        const createdDate = new Date(bid.createdDate);
  
        if (createdDate < cycleStart || createdDate > cycleEnd) return; // Filter based on cycle
  
        const { bidName, marketName, totalPlacedBidSlots } = bid;
        uniqueBidNames.add(bidName);
  
        if (!marketWiseData[bidName]) {
          marketWiseData[bidName] = {
            bidName,
            Bullish: 0,
            Bearish: 0,
            "Nifty Prediction": 0,
            "Bank Nifty Prediction": 0,
          };
        }
  
        if (marketGradients[marketName]) {
          marketWiseData[bidName][marketName] += totalPlacedBidSlots;
        }
        console.log(marketWiseData[bidName][marketName]);
      });
      
      
      const formattedData = Array.from(uniqueBidNames)
        .sort((a, b) => a.localeCompare(b))
        .map((bidName) => marketWiseData[bidName]);
  
      setData(formattedData.length > 0 ? formattedData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [year]);
  

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
