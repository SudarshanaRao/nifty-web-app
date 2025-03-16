import React, { useState, useEffect } from "react";
import axios from "axios";
import "./BidsCreation.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BidCreationForm = () => {
  const generateBidCode = () => `#MB${Math.floor(1000 + Math.random() * 9000)}`;
  const [formData, setFormData] = useState({
    bidName: "",
    bidCode: generateBidCode(),
    entryFee: "",
    poolPrize: "",
    firstPrize: "",
    bidSlots: "",
    individualBidCount: "15",  
    guaranteedBidCount: "0",   
    newDayBid: "MANUAL",       
    companyRequired: true,     
    bankRequired: false,       
    marketId: "",
    marketName: "",
    createdBy: "556c3d52-e18d-11ef-9b7f-02fd6cfaf985",
    active: true,
    prizeMasterList: [],
  });

  const [markets, setMarkets] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const response = await axios.get("https://prod-api.nifty10.com/market");
        if (response.data?.data) {
          setMarkets(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching markets:", error);
      }
    };
    fetchMarkets();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleMarketChange = (e) => {
    const { value } = e.target;
    if (value === "bullish_bearish") {
      setFormData((prev) => ({
        ...prev,
        marketId: "bullish_bearish",
        marketName: "Bullish & Bearish",
      }));
    } else {
      const selectedMarket = markets.find((m) => m.marketId === value);
      setFormData((prev) => ({
        ...prev,
        marketId: selectedMarket?.marketId || "",
        marketName: selectedMarket?.marketName || "",
      }));
    }
  };

  const handlePrizeChange = (index, field, value) => {
    const updatedPrizes = [...formData.prizeMasterList];
    updatedPrizes[index][field] = value;
    setFormData((prev) => ({ ...prev, prizeMasterList: updatedPrizes }));
  };

  const addPrizeLevel = () => {
    setFormData((prev) => ({
      ...prev,
      prizeMasterList: [
        ...prev.prizeMasterList,
        { level: prev.prizeMasterList.length + 1, prize: "", userCount: "" },
      ],
    }));
  };

  const removePrizeLevel = (index) => {
    const updatedPrizes = formData.prizeMasterList.filter((_, i) => i !== index);
    // Reassign level numbers
    updatedPrizes.forEach((p, i) => (p.level = i + 1));
    setFormData((prev) => ({ ...prev, prizeMasterList: updatedPrizes }));
  };

  const validateForm = () => {
    let newErrors = {};
    const requiredFields = [
      "bidName",
      "entryFee",
      "poolPrize",
      "firstPrize",
      "bidSlots",
      "individualBidCount",
      "guaranteedBidCount",
      "marketId",
    ];
    requiredFields.forEach((key) => {
      if (!formData[key]) {
        newErrors[key] = "This field is required";
      }
    });

    formData.prizeMasterList.forEach((prize, index) => {
      if (!prize.prize || !prize.userCount) {
        newErrors[`prize_${index}`] = "Both prize and user count are required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      console.log("🚀 Sending Request JSON:", JSON.stringify(formData, null, 2));
      
      if (formData.marketId === "bullish_bearish") {
        // If Bullish & Bearish is selected, create bids for both
        await Promise.all(
          [
            { marketId: "6187ba91-e190-11ef-9b7f-02fd6cfaf985", marketName: "Bullish" },
            { marketId: "877c5f82-e190-11ef-9b7f-02fd6cfaf985", marketName: "Bearish" }
          ].map(async ({ marketId, marketName }) => {
            const bidData = { ...formData, marketId, marketName };
            const response = await axios.post(
              "https://dev-api.nifty10.com/bid/configuration/create?userId=556c3d52-e18d-11ef-9b7f-02fd6cfaf985",
              bidData,
              { headers: { "Content-Type": "application/json" } }
            );
            console.log("✅ Success for marketId", marketId, response.data);
          })
        );
      } else {
        // Normal case for a single marketId
        const selectedMarket = markets.find((m) => m.marketId === formData.marketId);
        const bidData = { ...formData, marketName: selectedMarket?.marketName || "" };
        const response = await axios.post(
          "https://dev-api.nifty10.com/bid/configuration/create?userId=556c3d52-e18d-11ef-9b7f-02fd6cfaf985",
          bidData,
          { headers: { "Content-Type": "application/json" } }
        );
        console.log("✅ Success:", response.data);
      }
  
      toast.success("Bid Created successfully!", { position: "top-right" });
      setFormData({
        bidName: "",
        bidCode: generateBidCode(),
        entryFee: "",
        poolPrize: "",
        firstPrize: "",
        bidSlots: "",
        individualBidCount: "15",  
        guaranteedBidCount: "0",   
        newDayBid: "MANUAL",       
        companyRequired: true,     
        bankRequired: false,       
        marketId: "",
        marketName: "",
        createdBy: "556c3d52-e18d-11ef-9b7f-02fd6cfaf985",
        active: true,
        prizeMasterList: [],
      });
    } catch (error) {
      console.error("❌ API Error:", error.response ? error.response.data : error.message);
      toast.error("Failed to add Bid. Try again!", { position: "top-right" });
    }
  };
  

  return (
    <div className="uni-bid-form-container">
      <h2 className="uni-form-heading">Bid Creation</h2>
      <ToastContainer position="top-right" style={{ marginTop: "65px" }} />

      {/* Use our custom grid class instead of Tailwind spacing classes */}
      <form onSubmit={handleSubmit} className="uni-bid-form-grid">
        {/* Bid Name */}
        <div className="uni-form-group">
          <label>Bid Name</label>
          <input
            type="text"
            name="bidName"
            value={formData.bidName}
            onChange={handleChange}
            placeholder="Enter Bid Name"
            required
          />
          {errors.bidName && <p className="uni-error-text">{errors.bidName}</p>}
        </div>

        {/* Entry Fee */}
        <div className="uni-form-group">
          <label>Entry Fee</label>
          <input
            type="number"
            name="entryFee"
            value={formData.entryFee}
            onChange={handleChange}
            placeholder="Enter Entry Fee"
            required
          />
          {errors.entryFee && <p className="uni-error-text">{errors.entryFee}</p>}
        </div>

        {/* Prize Pool */}
        <div className="uni-form-group">
          <label>Prize Pool</label>
          <input
            type="number"
            name="poolPrize"
            value={formData.poolPrize}
            onChange={handleChange}
            placeholder="Enter Prize Pool"
            required
          />
          {errors.poolPrize && <p className="uni-error-text">{errors.poolPrize}</p>}
        </div>

        {/* First Prize */}
        <div className="uni-form-group">
          <label>First Prize</label>
          <input
            type="number"
            name="firstPrize"
            value={formData.firstPrize}
            onChange={handleChange}
            placeholder="Enter First Prize"
            required
          />
          {errors.firstPrize && <p className="uni-error-text">{errors.firstPrize}</p>}
        </div>

        {/* Bid Slots */}
        <div className="uni-form-group">
          <label>Bid Slots</label>
          <input
            type="number"
            name="bidSlots"
            value={formData.bidSlots}
            onChange={handleChange}
            placeholder="Enter Bid Slots"
            required
          />
          {errors.bidSlots && <p className="uni-error-text">{errors.bidSlots}</p>}
        </div>

        {/* Market */}
        <div className="uni-form-group">
          <label>Market</label>
          <select name="marketId" value={formData.marketId || ""} onChange={handleMarketChange} required>
            <option value="">Select Market</option>
            <option value="bullish_bearish">Bullish & Bearish</option>
            {markets.map((market) => (
              <option key={market.marketId} value={market.marketId}>
                {market.marketName}
              </option>
            ))}
          </select>
          {errors.marketId && <p className="uni-error-text">{errors.marketId}</p>}
        </div>

        {/* Active (Radio Buttons) */}
        <div className="uni-form-group">
          <label>Active</label>
          <div className="company-radio-group">
            
              <input
                type="radio"
                name="active"
                value="true"
                className="company-radio-input"
                checked={formData.active === true}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    active: e.target.value === "true",
                  }))
                }
              />
              <label className="company-radio-label">
              True
            </label>
            
              <input
                type="radio"
                name="active"
                value="false"
                className="company-radio-input"
                checked={formData.active === false}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    active: e.target.value === "true",
                  }))
                }
              />
              <label className="company-radio-label">
              False
            </label>
          </div>
        </div>

        {/* Hidden Fields */}
        <input type="hidden" name="individualBidCount" value={formData.individualBidCount} />
        <input type="hidden" name="guaranteedBidCount" value={formData.guaranteedBidCount} />
        <input type="hidden" name="newDayBid" value={formData.newDayBid} />
        <input type="hidden" name="companyRequired" value={formData.companyRequired} />
        <input type="hidden" name="bankRequired" value={formData.bankRequired} />

        {/* Prize Breakdown (Full width) */}
        <div className="uni-form-group" style={{ gridColumn: "1 / span 2" }}>
          <h3 className="uni-section-title">Prize Breakdown</h3>
          <table className="uni-prize-breakdown-table">
            <thead>
              <tr>
                <th style={{ width: "10%" }}>Level</th>
                <th style={{ width: "35%" }}>Prize Amount</th>
                <th style={{ width: "35%" }}>User Count</th>
                <th style={{ width: "20%" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {formData.prizeMasterList.map((prize, index) => (
                <tr key={index}>
                  <td>Lvl {prize.level}</td>
                  <td>
                    <input
                      type="number"
                      placeholder="Prize Amount"
                      value={prize.prize}
                      onChange={(e) => handlePrizeChange(index, "prize", e.target.value)}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      placeholder="User Count"
                      value={prize.userCount}
                      onChange={(e) => handlePrizeChange(index, "userCount", e.target.value)}
                      required
                    />
                    {errors[`prize_${index}`] && (
                      <p className="uni-error-text">{errors[`prize_${index}`]}</p>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="uni-remove-button"
                      onClick={() => removePrizeLevel(index)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" onClick={addPrizeLevel} className="uni-add-row-button">
            Add Row
          </button>
        </div>

        {/* Submit Button (Full width) */}
        <div className="uni-form-group" style={{ gridColumn: "1 / span 2", textAlign: "right" }}>
          <button type="submit" className="uni-submit-button">
            Create Bid
          </button>
        </div>
      </form>
    </div>
  );
};

export default BidCreationForm;