import React, { useState, useEffect } from "react";
import "./ProfileCard.css";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaGift,
  FaWallet,
} from "react-icons/fa";
import { RiBankLine, RiMoneyRupeeCircleFill } from "react-icons/ri";

const ProfileCard = ({ selectedUser: userId, setActiveTab }) => {
  const [users, setUsers] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bidsCount, setBidsCount] = useState(0);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          "https://prod-api.nifty10.com/nif/user/list/user?size=1000"
        );
        const data = await response.json();

        if (data?.data?.content) {
          setUsers(data.data.content);
        } else {
          setError("Invalid API response");
        }
      } catch (error) {
        setError("Error fetching users. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter user data after users are loaded
  useEffect(() => {
    if (users.length > 0 && userId) {
      const filteredUser = users.find((user) => String(user.userId) === String(userId));
      setUserData(filteredUser || null);

      if (filteredUser) {
        fetchBids(userId);
      }
    }
    
  }, [users, userId]);

  // Fetch placed bids and filter today's bids
  const fetchBids = async (userId) => {
    try {
      const response = await fetch(
        `https://prod-api.nifty10.com/user/bid/getPlaceBid?userId=${userId}`
      );
      const result = await response.json();
  
      // Check if response contains valid data
      if (!result?.data || !Array.isArray(result.data)) {
        setBidsCount(0);
        return;
      }
  
      const bids = result.data; // Extract bid data
      const now = new Date();
      const formattedDate = now.toLocaleDateString("en-CA"); // YYYY-MM-DD
  
      // Filter bids with matching date
      const filteredBids = bids.filter((bid) => 
        bid.createdDate.startsWith(formattedDate)
      );
  
      setBidsCount(filteredBids.length); // Update count
    } catch (error) {
      console.error("Error fetching bids:", error);
      setBidsCount(0);
    }
  };
  
  


  if (loading) return <p>Loading user data...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!userData) return <p className="error">User not found</p>;
  if (!userId) return <p>No user selected</p>;

  return (
    <div className="profile-container">
      {/* Header */}
      <button className="profile-back-btn" onClick={() => setActiveTab("users-info")}>Back</button>
      <div className="profile-header">
        <FaUser className="profile-avatar" />
        <div>
          <h2 className="user-name">{userData?.name || "NA"}</h2>
          <p className="user-type">{userData?.userType || "NA"}</p>
        </div>
        <div className={`status-button ${userData?.isActive ? "active" : "inactive"}`}>
          {userData?.isActive ? "Active" : "Inactive"}
        </div>
      </div>

      {/* Main Content */}
      <div className="profile-content">
        {/* Left Side */}
        <div className="profile-left">
          {/* Personal Information */}
          <div className="profile-section">
            <h3>Personal Information</h3>
            <p><FaPhone className="icon" /> {userData?.mobileNo || "NA"}</p>
            <p><FaEnvelope className="icon" /> {userData?.email || "NA"}</p>
            <p><FaGift className="icon" /> Referral Code: {userData?.referralCode || "NA"}</p>
            <p>
              <FaCalendarAlt className="icon" /> Joined:{" "}
              {userData?.createdDate
                ? new Date(userData.createdDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : "NA"}
            </p>

          </div>

          {/* Statistics */}
          <div className="profile-section">
            <h3>Statistics</h3>
            <div className="statistics-container">
              <div className="stat-card">
                <RiMoneyRupeeCircleFill className="card-icon" />
                <h4>Invested Money</h4>
                <p>₹{userData?.investedMoney ?? 0.00}</p>
              </div>
              <div className="stat-card">
                <FaWallet className="card-icon" />
                <h4>Points</h4>
                <p>{userData?.points ? userData.points.toFixed(2) : 0.00}</p>
              </div>
              <div className="stat-card">
                <RiMoneyRupeeCircleFill className="card-icon" />
                <h4>Earned Money</h4>
                <p>₹{userData?.earnedMoney ? userData.earnedMoney.toFixed(2) : 0.00}</p>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="profile-section">
            <h3>Bank Details</h3>
            <p><RiBankLine className="icon" /> {userData?.bankName || "NA"}</p>
            <p>Branch: {userData?.branch || "NA"}</p>
            <p>Account No: {userData?.accountNumber || "NA"}</p>
            <p>IFSC Code: {userData?.ifscCode || "NA"}</p>
          </div>
        </div>

        {/* Right Side: Placed Bids Today */}
        <div className="bids-card">
          <h3>Today's Bids</h3>
          <p className="bids-count">{bidsCount}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
