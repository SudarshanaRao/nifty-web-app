import React, { useEffect, useState } from "react";
import "./AllMarkets.css";
import axios from "axios";

const marketImages = {
  Bullish: "bullish.png",
  Bearish: "bearish.png",
  "Nifty Prediction": "nifty-prediction.png",
  "Bank Nifty Prediction": "bank-nifty-prediction.png",
};

const Card = ({ title, color, image, openTime, closeTime, onClick = () => console.log() }) => {
  return (
    <div className={`all-card ${color}`} onClick={() => onClick(title)}>
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
      <div className="all-card-icon">
        <img src={image} alt={title} className="all-icon" />
      </div>
    </div>
  );
};

const AllMarkets = ({ onSelectMarket }) => {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await axios.get("http://localhost:4000/get/market");
        setMarketData(response.data.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching market data:", error);
        setLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  return (
    <div className="all-cards-container">
      {loading ? (
        <p>Loading market data...</p>
      ) : (
        marketData.map((market) => {
          const color = market.marketName
            ? market.marketName.toLowerCase().replace(/\s+/g, "-")
            : "default";


          return (
            <Card
              key={market.marketId}
              title={market.marketName}
              color={color}
              image={marketImages[market.marketName] || "default.png"}
              openTime={market.openingTime}
              closeTime={market.closingTime}
              onClick={onSelectMarket}
            />
          );
        })
      )}
      <button className="all-floating-button">☰</button>
    </div>
  );
};

export default AllMarkets;
