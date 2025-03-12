import './Dashboard.css';
import React, { useEffect, useState } from "react";
import axios from "axios";
import BoxGraph from './BoxGraph';

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
    const [growthRate, setGrowthRate] = useState(0);
    const [last24HoursUsers, setLast24HoursUsers] = useState(0);
    const [last24HoursGrowth, setLast24HoursGrowth] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [revenueGrowthRate, setRevenueGrowthRate] = useState(0);
    const [totalSpent, setTotalSpent] = useState(0);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get("https://dev-api.nifty10.com/nif/user/list/activeUser");
                const users = response.data.data || [];

                setTotalUsers(users.length); // Total users count

                // Get date ranges
                const now = new Date();
                
                // Last 24 hours
                const last24HoursStart = new Date(now.getTime() - (24 * 60 * 60 * 1000));
                
                // Previous 24 hours (24-48 hours ago)
                const prev24HoursStart = new Date(now.getTime() - (48 * 60 * 60 * 1000));
                const prev24HoursEnd = last24HoursStart;

                // Last Week and Previous Week
                const lastWeekStart = new Date();
                lastWeekStart.setDate(now.getDate() - 7);

                const twoWeeksAgoStart = new Date();
                twoWeeksAgoStart.setDate(now.getDate() - 14);
                const twoWeeksAgoEnd = new Date();
                twoWeeksAgoEnd.setDate(now.getDate() - 8);

                // Users in last 24 hours
                const last24HoursUsersList = users.filter(user => new Date(user.createdDate) >= last24HoursStart);
                setLast24HoursUsers(last24HoursUsersList.length);

                // Users in previous 24 hours
                const prev24HoursUsersList = users.filter(user => 
                    new Date(user.createdDate) >= prev24HoursStart && new Date(user.createdDate) < prev24HoursEnd
                );

                // Calculate growth rate for last 24 hours
                const last24Count = last24HoursUsersList.length;
                const prev24Count = prev24HoursUsersList.length;
                const last24Growth = prev24Count > 0 
                    ? Math.min(((last24Count - prev24Count) / prev24Count) * 100, 100) 
                    : (last24Count > 0 ? 100 : 0);
                setLast24HoursGrowth(last24Growth.toFixed(1));

                // Users in the last week and previous week
                const lastWeekUsers = users.filter(user => new Date(user.createdDate) >= lastWeekStart);
                const prevWeekUsers = users.filter(user => 
                    new Date(user.createdDate) >= twoWeeksAgoStart && new Date(user.createdDate) <= twoWeeksAgoEnd
                );

                // Calculate weekly growth rate
                const lastWeekCount = lastWeekUsers.length;
                const prevWeekCount = prevWeekUsers.length;
                const weeklyGrowth = prevWeekCount > 0 
                    ? Math.min(((lastWeekCount - prevWeekCount) / prevWeekCount) * 100, 100) 
                    : (lastWeekCount > 0 ? 100 : 0);
                setGrowthRate(weeklyGrowth.toFixed(1));

                const totalRevenueGenerated = users.reduce((sum, user) => sum + (user.investedMoney || 0), 0);
                setTotalRevenue(totalRevenueGenerated);

                // Revenue in last 24 hours
                const last24Revenue = last24HoursUsersList.reduce((sum, user) => sum + (user.investedMoney || 0), 0);
                const prev24Revenue = prev24HoursUsersList.reduce((sum, user) => sum + (user.investedMoney || 0), 0);

                // Calculate revenue growth rate
                const revenueGrowth = prev24Revenue > 0 
                    ? Math.min(((last24Revenue - prev24Revenue) / prev24Revenue) * 100, 100) 
                    : (last24Revenue > 0 ? 100 : 0);
                setRevenueGrowthRate(revenueGrowth.toFixed(1));

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
                        fetch(`https://dev-api.nifty10.com/bid/market?Date=${formattedDate}&marketId=${marketId}&userId=${userId}`)
                            .then(response => response.json())
                    );

                    const marketData = await Promise.all(apiRequests);
                    
                    // Flatten the data if necessary
                    const bids = marketData.flat(); // Assuming each API returns an array

                    const last24Hours = new Date(now);
                    last24Hours.setHours(last24Hours.getHours() - 24);

                    const last48Hours = new Date(now);
                    last48Hours.setHours(last48Hours.getHours() - 48);

                    // Current 24 Hours Spent
                    const currentSpent = bids
                        .filter(bid => 
                            new Date(bid.createdDate) >= last24Hours &&
                            !bid.freeBid &&
                            bid.active
                        )
                        .reduce((sum, bid) => sum + (parseFloat(bid.bidName) * (bid.bidSlots - bid.totalAvailableBidCount)), 0);

                    // Previous 24 Hours Spent
                    const previousSpent = bids
                        .filter(bid => 
                            new Date(bid.createdDate) >= last48Hours &&
                            new Date(bid.createdDate) < last24Hours &&
                            !bid.freeBid &&
                            bid.active
                        )
                        .reduce((sum, bid) => sum + (parseFloat(bid.bidName) * (bid.bidSlots - bid.totalAvailableBidCount)), 0);

                    // Calculate Growth Rate
                    let growth = previousSpent === 0 && currentSpent === 0 
                        ? 0 
                        : previousSpent > 0 
                            ? Math.min(((currentSpent - previousSpent) / previousSpent) * 100, 100) 
                            : 0;

                    setGrowthRate(parseFloat(growth.toFixed(2)));
                    setTotalSpent(currentSpent);

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
                growthRate= {growthRate}
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
                    growthRate={revenueGrowthRate}
                    duration="Last 24hrs"
                />
                <Card
                    key="totalSpent"
                    title="Total Spent (Last 24 Hrs)"
                    color="Bank"
                    image="./total-spent.png"
                    data={totalSpent.toLocaleString()} // Format for better readability
                    duration="Last 24hrs"
                    growthRate={growthRate}
                />
            </div>
            < BoxGraph />
        </div>
    );
};

export default Dashboard;
