import React, { useEffect, useState, useCallback } from "react";
import "./AllMarkets.css";
import axios from "axios";
import BidPieChart from "../Dashboard/PieChart";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const marketImages = {
  Bullish: "bullish.png",
  Bearish: "bearish.png",
  "Nifty Prediction": "nifty-prediction.png",
  "Bank Nifty Prediction": "bank-nifty-prediction.png",
};

const Card = ({ title, image, bidSlots, filledSlots, onClick }) => {
  return (
    <div className={`all-card`} onClick={() => onClick(title)}>
      <div className="all-card-content">
        <h2>{title}</h2>
        <div className="all-time-container">
          <div className="all-time-left">
            <p className="all-des">Filled Slots</p>
            <p className="all-time">{filledSlots}</p>
          </div>
          <div className="all-timer-line"></div>
          <div className="all-time-right">
            <p className="all-des">Bid Slots</p>
            <p className="all-time">{bidSlots}</p>
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
  const [isActive, setIsActive] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedBidData, setSelectedBidData] = useState(null);
  const [filledSlotsData, setFilledSlotsData] = useState({});
  const userId = "556c3d52-e18d-11ef-9b7f-02fd6cfaf985";

  async function getFilledSlots() {
    const formattedDate = new Date()
      .toLocaleDateString("en-GB")
      .split("/")
      .join("-");
    const marketIds = [
      "6187ba91-e190-11ef-9b7f-02fd6cfaf985",
      "877c5f82-e190-11ef-9b7f-02fd6cfaf985",
      "97f37603-e190-11ef-9b7f-02fd6cfaf985",
      "9f0c2c24-e190-11ef-9b7f-02fd6cfaf985",
    ];

    let slotsData = {};

    for (const marketId of marketIds) {
      const apiUrl = `https://prod-api.nifty10.com/bid/market?Date=${formattedDate}&marketId=${marketId}&userId=${userId}`;
      try {
        const response = await axios.get(apiUrl);
        const data = response.data.data || [];

        let totalFilledSlots = 0;
        let overallBidSlots = 0;

        data.forEach((market) => {
          if (market.active && !market.freeBid) {
            overallBidSlots += market.bidSlots;
            totalFilledSlots += (market.bidSlots - market.totalAvailableCount);
          }
        });

        slotsData[marketId] = {
          filledSlots: totalFilledSlots,
          bidSlots: overallBidSlots,
        };
      } catch (error) {
        console.error("Error fetching filled slots:", error);
        slotsData[marketId] = { filledSlots: 0, bidSlots: 0 };
      }
    }

    setFilledSlotsData(slotsData);
  }

  useEffect(() => {
    getFilledSlots();
  }, [marketData]);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await axios.get("http://localhost:4000/get/market");
        setMarketData(response.data.data || []);
      } catch (error) {
        console.error("Error fetching market data:", error);
        toast.error("Error fetching data.!");
      } finally {
        setLoading(false);
      }
    };
    fetchMarketData();
  }, []);
  const handleMarketClick = useCallback(async (marketId, marketName) => {
    setSelectedMarket(marketName);
    setDataLoading(true);
    setErrorMsg("");
    setIsActive(false);
    setSelectedRow(null);
  
    try {
      const data = await getMarketData(marketId);
      if (data.length === 0) {
        setErrorMsg("No data available for today.");
      }
      // Sort numerically using bidName (converted from string to number)
      const sortedData = data.sort((a, b) => Number(a.bidName) - Number(b.bidName));
      const filteredData = sortedData.filter((item) => item.freeBid === false);
      setTableData(filteredData);
    } catch (error) {
      setErrorMsg("Failed to load data.");
      console.error("Error fetching table data:", error);
      toast.error("Error fetching data.!");
    } finally {
      setDataLoading(false);
    }
  }, []);
  
  useEffect(() => {
    if (marketData.length > 0 && !selectedMarket) {
      const bullishMarket = marketData.find((m) =>
        m.marketName.toLowerCase().includes("bullish")
      );
      if (bullishMarket) {
        handleMarketClick(bullishMarket.marketId, bullishMarket.marketName);
      }
    }
  }, [marketData, selectedMarket, handleMarketClick]);
  

  const getMarketData = async (marketId) => {
    setDataLoading(true);
    setErrorMsg("");

    try {
      const formattedDate = new Date()
        .toLocaleDateString("en-GB")
        .split("/")
        .join("-");
      const apiUrl = `https://prod-api.nifty10.com/bid/market?Date=${formattedDate}&marketId=${marketId}&userId=${userId}`;
      const response = await axios.get(apiUrl);
      const data = response.data.data || [];
      if (!data.length) setErrorMsg("No data available for today.");
      return data;
    } catch (error) {
      setErrorMsg("Failed to load data.");
      console.error("Error fetching market data:", error);
      toast.error("Error fetching data.!");
      return [];
    } finally {
      setDataLoading(false);
    }
  };

  

  // Automatically select the row with bidName "19" for bullish and bearish markets
  useEffect(() => {
    if (
      selectedMarket &&
      (selectedMarket.toLowerCase().includes("bullish") ||
       selectedMarket.toLowerCase().includes("bearish")) &&
      tableData.length > 0
    ) {
      const defaultRow = tableData.find((row) => row.bidName === "19");
      if (defaultRow) {
        rowSelected(defaultRow.dayWiseBidId, defaultRow.marketId);
      }
    }
  }, [selectedMarket, tableData]);

  const rowSelected = async (id, marketId) => {
    setIsActive(true);
    setSelectedRow(id);
    setErrorMsg("");

    try {
      const formattedDate = new Date()
        .toLocaleDateString("en-GB")
        .split("/")
        .join("-");
      const apiUrl = `https://prod-api.nifty10.com/bid/market?Date=${formattedDate}&marketId=${marketId}&userId=${userId}`;
      const response = await axios.get(apiUrl);
      const data = response.data.data || [];

      if (!data.length) {
        setErrorMsg("No data available for today.");
        return;
      }

      const selectedBid = data.find(
        (bid) => bid.dayWiseBidId === id && bid.marketId === marketId
      );

      if (selectedBid) {
        const { bidName, bidSlots, dayWiseBidId, totalAvailableCount, marketName } = selectedBid;
        const completedBids = bidSlots - totalAvailableCount;
        const percentage = bidSlots > 0 ? ((completedBids / bidSlots) * 100).toFixed(2) : "0.00";

        setSelectedBidData({ bidName, dayWiseBidId, bidSlots, totalAvailableCount, marketName, percentage, completedBids });
      } else {
        console.log("Bid not found.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorMsg("Failed to load data.");
      toast.error("Error fetching data.!");
    }
  };

  const changeActiveStatus = async (id, prevStatus) => {
    try {
      const newStatus = !prevStatus;
      const response = await fetch(
        `https://dev-api.nifty10.com/bid/change/daily/bid/status?dayWiseBidId=${id}&status=${newStatus}`,
        { method: "GET" }
      );
      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      setTableData((prevTable) =>
        prevTable?.map((row) =>
          row.dayWiseBidId === id ? { ...row, active: newStatus } : row
        ) || []
      );

      if (selectedMarket?.bidData) {
        setSelectedMarket((prevMarket) => ({
          ...prevMarket,
          bidData: prevMarket.bidData?.map((row) =>
            row.dayWiseBidId === id ? { ...row, active: newStatus } : row
          ) || [],
        }));
      }

      setMarketData((prevMarkets) =>
        prevMarkets?.map((market) =>
          market.id === selectedMarket?.id
            ? {
                ...market,
                bidData: market.bidData?.map((row) =>
                  row.dayWiseBidId === id ? { ...row, active: newStatus } : row
                ) || [],
              }
            : market
        ) || []
      );
    } catch (error) {
      toast.error("Error changing status. Please try again.");
    }
  };

const onClickStatus = (id, prevStatus) => {
  const selectedBid = tableData.find((bid) => bid.dayWiseBidId === id);

  if (!selectedBid) {
    toast.error("Bid not found.");
    return;
  }

  const filledSlots = selectedBid.bidSlots - selectedBid.totalAvailableCount;

  if (filledSlots > 0) {
    toast.error("Cannot deactivate bid with filled slots.");
    return;
  }

  const newStatus = !prevStatus;
  const statusText = prevStatus ? "Active" : "Inactive";
  const newStatusText = newStatus ? "Active" : "Inactive";

  Swal.fire({
    title: "Are you sure?",
    text: `Do you want to change the status from ${statusText} to ${newStatusText}?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "No",
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      changeActiveStatus(id, prevStatus);
      Swal.fire({
        title: "Changed!",
        text: `Status changed successfully to ${newStatusText}.`,
        icon: "success",
      });
    } else {
      Swal.fire({
        title: "Cancelled",
        text: "Status not changed.",
        icon: "error",
      });
    }
  });
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
              filledSlots={filledSlotsData?.[market.marketId]?.filledSlots || 0}
              bidSlots={filledSlotsData?.[market.marketId]?.bidSlots || 0}
              onClick={() => handleMarketClick(market.marketId, market.marketName)}
            />
          ))
        )}
        <ToastContainer position="top-right" style={{ marginTop: "65px" }} />
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
                      <td>{index + 1}</td>
                      <td>{row.bidName}</td>
                      <td>{row.bidSlots}</td>
                      <td>{row.poolPrize}</td>
                      <td
                        onClick={() => {
                          onClickStatus(row.dayWiseBidId, row.active);
                        }}
                        className="market-table-status status-active"
                      >
                        {row.active ? "✅ Active" : "❌ Inactive"}
                      </td>
                      <td>{row.firstPrize}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="error-msg">{errorMsg}</p>
            )}
          </div>
          {isActive && <BidPieChart {...selectedBidData} />}
        </div>
      )}
      <button className="all-floating-button">☰</button>
    </div>
  );
};

export default AllMarkets;
