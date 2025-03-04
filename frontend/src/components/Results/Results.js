import React, { useState } from "react";
import "./Results.css";
import Markets from "../Market/Markets";
import BullishPerformance from "../BullishPerformance/BullishPerformance";
import BearishPerformance from "../BearishPerformance/BearishPerformance";

const Results = () => {
  const [selectedMarket, setSelectedMarket] = useState(null);

  const handleBack = () => {
    setSelectedMarket(null); // Reset to show only Markets
  };

  return (
    <div className="Results-container">
      <Markets onSelectMarket={setSelectedMarket} />
      <div className="results-form-container">
        {selectedMarket === "Bullish" && <BullishPerformance onBack={handleBack} />}
        {selectedMarket === "Bearish" && <BearishPerformance onBack={handleBack} />}
      </div>
    </div>
  );
};

export default Results;
