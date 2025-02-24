import React, { useEffect, useState } from "react";
import axios from "axios";
import "./style.css";
import stockData from "../../stockData";

function Company() {
    const [stocks, setStocks] = useState([]);

    useEffect(() => {
        axios
            .get("http://localhost:4000/get/company")
            .then((response) => {
                console.log("API Response:", response.data);
                let fetchedStocks = response.data.data || [];

                // Skip the first index
                fetchedStocks = fetchedStocks.slice(1);

                // Map through fetched stocks and update pChange from stockData if available
                const updatedStocks = fetchedStocks.map((stock) => {
                    const matchingStock = stockData.find(
                        (s) => s.symbol === stock.symbol
                    );
                    return {
                        ...stock,
                        pChange: matchingStock ? matchingStock.pChange : stock.pChange,
                    };
                });

                setStocks(updatedStocks);
            })
            .catch((error) => console.error("Error fetching data:", error));
    }, []);

    return (
        <div className="container">
            <h1>NIFTY 50 STOCKS</h1>
            <ul className="stocks-container">
                {stocks.map((stock, index) => (
                    <li key={index} className="stock-box">
                        <span className="stock-symbol">{stock.companyName}</span>
                        <span className="stock-value">
                            {Math.max(Number(stock.companyPoint), 0)}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Company;
