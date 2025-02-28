import React, { useEffect, useState } from "react";
import axios from "axios";
import "./company.css";

function Company() {
    const [stocks, setStocks] = useState([]);

    useEffect(() => {
        axios
            .get("http://localhost:4000/get/company")
            .then((response) => {
                let fetchedStocks = response.data.data || [];
                fetchedStocks = fetchedStocks.slice(0);

                setStocks(fetchedStocks);
            })
            .catch((error) => console.error("Error fetching data:", error));
    }, []);

    return (
        <div id="companyContainer" className="company-container">
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
