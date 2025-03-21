import './Dashboard.css';
import React, { useEffect, useState } from "react";
import axios from "axios";
import BoxGraph from './BoxGraph';
import Todo from '../Todo/Todo'


const Card = ({ title, color, image, data, growthRate, duration }) => {
    return (
      <div className={'all-card dashboard-card-container'}>
        <div className="all-card-content dashboard-content">
          <h2>{title}</h2>
          <div className="all-time-container">
            <div className="all-time-left">
              <p className="all-time-res">{data}</p>
            </div>
          </div>
        </div>
        <div className={`all-card-icon ${color}`}>
          <img src={image} alt={title} className="all-icon" />
        </div>
        {growthRate !== undefined && (
                <div className="order-footer">
                    <div className="stats-background">
                        <span className={`growth-rate ${growthRate > 0 ? "increase" : "decrease"}`}>
                            {growthRate > 0 ? "▲" : "▼"} {Math.abs(growthRate)}%
                        </span>
                        <span>{duration}</span>
                        <a href="#markets">View More</a>
                    </div>
                </div>
            )}
      </div>
    );
  };

const Dashboard = () => {
    const [totalUsers, setTotalUsers] = useState(0);
    const [last24HoursUsers, setLast24HoursUsers] = useState(0);
    const [last24HoursGrowth, setLast24HoursGrowth] = useState(0);
    const [lastWeekGrowth, setLastWeekGrowth] = useState(0);
    const [totalSpent, setTotalSpent] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [lastWeekRevenueGrowth, setLastWeekRevenueGrowth] = useState(0);
    const [lastWeekSpentGrowth, setLastWeekSpentGrowth] = useState(0);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get("https://prod-api.nifty10.com/nif/user/list/activeUser");
                const users = response.data.data || [];

                setTotalUsers(users.length); // Total users count

                // Get date ranges
                const now = new Date();
                const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                const prevWeekStart = new Date(lastWeek.getTime() - 7 * 24 * 60 * 60 * 1000);

                // Filter users
                const newUsersLast24Hrs = users.filter(user => new Date(user.createdDate) >= twentyFourHoursAgo);
                const newUsersLastWeek = users.filter(user => new Date(user.createdDate) >= lastWeek);

                // Get previous period counts
                const prev24HrsUsers = users.filter(user => 
                    new Date(user.createdDate) >= new Date(twentyFourHoursAgo.getTime() - 24 * 60 * 60 * 1000) &&
                    new Date(user.createdDate) < twentyFourHoursAgo
                ).length;

                const prevWeekUsers = users.filter(user => 
                    new Date(user.createdDate) >= new Date(lastWeek.getTime() - 7 * 24 * 60 * 60 * 1000) &&
                    new Date(user.createdDate) < lastWeek
                ).length;

                // Calculate total revenue (sum of all investedMoney)
                const finalTotalRevenue = users.reduce((sum, user) => sum + (user.investedMoney || 0), 0);

                // Get last week's revenue
                const lastWeekRevenue = newUsersLastWeek.reduce((sum, user) => sum + (user.investedMoney || 0), 0);

                // Get previous week's revenue
                const prevWeekRevenue = users
                    .filter(user => new Date(user.createdDate) >= prevWeekStart && new Date(user.createdDate) < lastWeek)
                    .reduce((sum, user) => sum + (user.investedMoney || 0), 0);


                // Function to calculate growth percentage (capped at 100%)
                const calculateGrowth = (newCount, prevCount) => {
                    if (prevCount === 0) return newCount > 0 ? 100 : 0;
                    let growth = ((newCount - prevCount) / prevCount) * 100;
                    return Math.min(growth, 100); // Ensure it doesn't exceed 100%
                };

                // Calculate growth percentages
                const last24HrsGrowth = calculateGrowth(newUsersLast24Hrs.length, prev24HrsUsers);
                const lastWeekGrowth = calculateGrowth(newUsersLastWeek.length, prevWeekUsers);
                const lastWeekRevenueGrowth = calculateGrowth(lastWeekRevenue, prevWeekRevenue);

                setLast24HoursUsers(newUsersLast24Hrs.length);
                setLast24HoursGrowth(last24HrsGrowth.toFixed(2)); // Round to 2 decimal places
                setLastWeekGrowth(lastWeekGrowth.toFixed(2));
                setTotalRevenue(finalTotalRevenue)
                setLastWeekRevenueGrowth(lastWeekRevenueGrowth.toFixed(2))


                const formattedDate = new Date().toLocaleDateString("en-GB").split("/").join("-");

                    const userId = "556c3d52-e18d-11ef-9b7f-02fd6cfaf985";
                    const marketIds = [
                        "6187ba91-e190-11ef-9b7f-02fd6cfaf985",
                        "877c5f82-e190-11ef-9b7f-02fd6cfaf985",
                        "97f37603-e190-11ef-9b7f-02fd6cfaf985",
                        "9f0c2c24-e190-11ef-9b7f-02fd6cfaf985",
                    ]; // Market IDs

                    // Fetch data for all markets
                    const apiRequests = marketIds.map(marketId =>
                        fetch(`https://prod-api.nifty10.com/bid/market?Date=${formattedDate}&marketId=${marketId}&userId=${userId}`)
                            .then(response => response.json())
                    );

                    const marketData = await Promise.all(apiRequests);
                    const allBids = marketData.flatMap((item) => item.data);
                    const selectedBids = allBids.filter((bid) => bid.active === true && bid.freeBid === false);
                    const resultValues = selectedBids.map((bid) => ({
                        ...bid,
                        calculatedValue: bid.entryFee * (bid.bidSlots - bid.totalAvailableCount),
                    }));

                    const totalCalculatedValue = resultValues.reduce((sum, bid) => sum + bid.calculatedValue, 0);
                      
                    setTotalSpent(totalCalculatedValue)
                    
                     // Flatten and preprocess data
                    const bids = marketData.flatMap(m => m.data || []);
                    const totalSpentLastWeek = now.getTime() - 7 * 24 * 60 * 60 * 1000;
                    const totalSpentPrevWeekStart = totalSpentLastWeek - 7 * 24 * 60 * 60 * 1000;

                    // Preprocess bids with validated dates
                    const processedBids = bids
                        .map(bid => {
                            const createdDate = bid.createdDate ? new Date(bid.createdDate).getTime() : null;
                            return {
                                createdDate,
                                bidName: parseFloat(bid.bidName) || 0, // Ensure numeric value
                                bidSlots: bid.bidSlots || 0,
                                totalAvailableBidCount: bid.totalAvailableCount || 0,
                                freeBid: !!bid.freeBid,
                                active: bid.active ?? true
                            };
                        })
                        .filter(bid => bid.createdDate && !isNaN(bid.createdDate)); // Remove invalid dates

                    // **Calculate spending in different time ranges**
                    const calculateSpent = (start, end) =>
                        processedBids
                            .filter(bid => bid.createdDate >= start && (!end || bid.createdDate < end) && !bid.freeBid && bid.active)
                            .reduce((sum, bid) => sum + (bid.bidName * (bid.bidSlots - bid.totalAvailableBidCount)), 0);

                    const lastWeekSpent = calculateSpent(totalSpentLastWeek);
                    const prevWeekSpent = calculateSpent(totalSpentPrevWeekStart, totalSpentLastWeek);

                    // **Calculate Growth Rate (Capped at 100%)**
                    const calculateTotalSpentGrowth = (newValue, prevValue) => {
                        if (prevValue === 0) return newValue > 0 ? 100 : 0;
                        return Math.min(((newValue - prevValue) / prevValue) * 100, 100);
                    };

                    const totalSpentLastWeekGrowth = calculateTotalSpentGrowth(lastWeekSpent, prevWeekSpent);
                    setLastWeekSpentGrowth(totalSpentLastWeekGrowth)
                    
                    

            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, []);

    return (
        <div className="all-markets-bg-container dashboard-container">
            <div className="all-cards-container dashboard-cards-container">
                <Card
                key="totalUsers"
                title="TOTAL USERS"
                color="Bullish"
                image="./total-users.png"
                data={totalUsers.toString()}
                growthRate= {lastWeekGrowth}
                duration="Last Week"
                />
                <Card
                    key="last24HoursUsers"
                    title="NEW USERS"
                    color="Bearish"
                    image="./24hrs-users.png"
                    data={last24HoursUsers.toString()}
                    growthRate= {last24HoursGrowth}
                    duration="Last 24hrs"
                />
                <Card
                    key="totalRevenue"
                    title="TOTAL REVENUE"
                    color="Nifty"
                    image="./total-revenue.png"
                    data={`₹ ${totalRevenue.toLocaleString()}`}
                    growthRate={lastWeekRevenueGrowth}
                    duration="Last week"
                />
                <Card
                    key="totalSpent"
                    title="Total Spent (Last 24 Hrs)"
                    color="Bank"
                    image="./total-spent.png"
                    data={`₹ ${totalSpent.toLocaleString()}`} // Format for better readability
                    duration="Last week"
                    growthRate={lastWeekSpentGrowth}
                />
            </div>
            <div className='dashboard-graph-todo'>
                < BoxGraph />
                <Todo />
            </div>
        </div>
    );
};

export default Dashboard;
