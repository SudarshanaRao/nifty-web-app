const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 4000;
const API_BASE_URL = "https://dev-api.nifty10.com"

// Enable CORS for frontend requests
app.use(cors());

app.get("/get/company", async (req, res) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/company`);

        res.json(response.data);
    } catch (error) {
        console.error("Error fetching Dev data:", error.message);
        res.status(500).json({ error: "Failed to fetch data from Dev" });
    }
});

app.get("/get/market", async (req, res) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/market`, { timeout: 5000 });
        res.json(response.data);
    } catch (error) {
        if (error.response) {
            // Server responded with a status code other than 2xx
            res.status(error.response.status).json({ error: error.response.data });
        } else if (error.request) {
            // Request was made but no response received
            res.status(502).json({ error: "No response from market API" });
        } else {
            // Something else went wrong
            res.status(500).json({ error: "Internal Server Error" });
        }
        console.error("Error fetching market data:", error.message);
    }
});


app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
