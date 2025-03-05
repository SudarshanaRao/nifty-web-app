import React, { useState } from "react";
import "./Results.css";
import Markets from "../Market/Markets";
import DayPerformance from "../DayPerformance/DayPerformance";

const Results = () => {
  const [selectedMarket, setSelectedMarket] = useState(null);

  const handleBack = () => {
    setSelectedMarket(null); // Reset to show only Markets
  };

  return (
    <div className="Results-container">
      <Markets onSelectMarket={setSelectedMarket} />
      <div className="results-form-container">
        {selectedMarket && <DayPerformance trend={selectedMarket.toUpperCase()} onBack={handleBack} /> }
      </div>
    </div>
  );
};

export default Results;
