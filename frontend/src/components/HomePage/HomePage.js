import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./HomePage.css";
import Company from "../Company/Company";
import MarketStatus from "../MarketStatus/MarketStatus";
import UsersInfo from "../UsersInfo/UsersInfo";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { toast } from "react-toastify";
import Results from "../Results/Results";
import AllMarkets from "../AllMarkets/AllMarkets";
import Dashboard from "../Dashboard/Dashboard";
import BidsCreation from "../BidsCreation/BidsCreation"
import axios from "axios";
import HolidayConfig from "../HolidayConfig/HolidayConfig";

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("dashboard"); // Default tab is "markets"
  const [result, setResult] = useState(false);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [announcement, setAnnouncement] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMsgDropdownOpen, setIsMsgDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
        try {
            const response = await axios.get("http://localhost:4000/get/notifications");
            const filteredNotifications = (response.data.data || [])
                .filter(notif => notif.title === "Notification")
                .map(notif => ({
                    ...notif,
                    formattedTimestamp: new Date(notif.createdTimestamp).toLocaleDateString("en-GB") + " " +
                        new Date(notif.createdTimestamp).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                        })
                }));

                const filteredMessages = (response.data.data || [])
                .filter(notif => notif.title === "Message")
                .map(notif => ({
                    ...notif,
                    formattedTimestamp: new Date(notif.createdTimestamp).toLocaleDateString("en-GB") + " " +
                        new Date(notif.createdTimestamp).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                        })
                }));

                const filteredAnnouncements = (response.data.data || [])
                .filter(notif => notif.title === "Announcement")
                .map(notif => ({
                    ...notif,
                    formattedTimestamp: new Date(notif.createdTimestamp).toLocaleDateString("en-GB") + " " +
                        new Date(notif.createdTimestamp).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                        })
                }));

            setNotifications(filteredNotifications);
            setMessages(filteredMessages)
            setAnnouncement(filteredAnnouncements)
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    fetchNotifications();
}, []);

const toggleMsgDropdown = () => {
  setIsMsgDropdownOpen(!isMsgDropdownOpen);
  setIsDropdownOpen(false); // Close notifications when opening messages
  setIsSettingsOpen(false);
};
const toggleSettingsDropdown = () => {
  setIsSettingsOpen(!isSettingsOpen);
  setIsDropdownOpen(false);
  setIsMsgDropdownOpen(false);
};

const toggleNotificationDropdown = () => {
  setIsDropdownOpen(!isDropdownOpen);
  setIsMsgDropdownOpen(false); // Close messages when opening notifications
  setIsSettingsOpen(false);
};

const NotificationUnreadCount = notifications.filter((notif) => !notif.active).length;
const MsgUnreadCount = messages.filter((msg) => !msg.active).length;
const AnnouncementUnreadCount = announcement.filter((ann) => !ann.active).length;

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isOtpVerfied");
    if (!isAuthenticated) {
      toast.error("You need to Verify Otp!", { position: "top-center" });
      navigate("/otp");
      return;
    }
    const loginCheck = localStorage.getItem("userToken");
    const otpCheck = localStorage.getItem("isOtpVerfied");
    console.log(result)
    if (loginCheck && otpCheck) {
      setResult(true);
    }
  }, [navigate, result]);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("isOtpVerfied");
    window.location.href = "/login";
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />
      case "markets":
        return <AllMarkets />;
      case "companies":
        return <Company />;
      case "market-status":
        return <MarketStatus />;
      case "users-info":
        return <UsersInfo />;
      case "results":
        return <Results />;
      case "bids-creation":
        return <BidsCreation />
      case "holiday-config":
        return <HolidayConfig />
      default:
        return <Dashboard />; // Default to Markets if no tab is selected
    }
  };

  return (
    <>
      <div className={`app-container sidebar-expanded`}>
        {/* Sidebar */}
        <div className={`sidebar expanded`}>
          <div className="sidebar-header">
            <img src="Nifty10-logo.png" alt="logo" className="logo" />
            <span className="visible">Nifty10</span>
          </div>
          <div className="sidebar-menu">
            <ul>
              <li onClick={() => setActiveTab("dashboard")} className={activeTab === "dashboard" ? "active" : ""}>
                <Link to="#">
                <i class="fa-solid fa-user-tie"></i>
                  <span className="visible">Dashboard</span>
                </Link>
              </li>
              <li onClick={() => setActiveTab("markets")} className={activeTab === "markets" ? "active" : ""}>
                <Link to="#">
                  <i className="fas fa-chart-line"></i>
                  <span className="visible">All Markets</span>
                </Link>
              </li>
              <li onClick={() => setActiveTab("companies")} className={activeTab === "companies" ? "active" : ""}>
                <Link to="#">
                  <i className="fas fa-building"></i>
                  <span className="visible">All Companies</span>
                </Link>
              </li>
              <li onClick={() => setActiveTab("holiday-config")} className={activeTab === "holiday-config" ? "active" : ""}>
                <Link to="#">
                  <i class="fa-solid fa-calendar-check"></i>
                  <span className="visible">Holiday Config</span>
                </Link>
              </li>
              <li onClick={() => setActiveTab("bids-creation")} className={activeTab === "bids-creation" ? "active" : ""}>
                <Link to="#">
                  <i className="fas fa-clipboard"></i>
                  <span className="visible">Bids Creation</span>
                </Link>
              </li>
              <li onClick={() => setActiveTab("market-status")} className={activeTab === "market-status" ? "active" : ""}>
                <Link to="#">
                  <i className="fas fa-folder-open"></i>
                  <span className="visible">Market Status</span>
                </Link>
              </li>
              <li onClick={() => setActiveTab("results")} className={activeTab === "results" ? "active" : ""}>
                <Link to="#">
                  <i className="fas fa-clock"></i>
                  <span className="visible">Results</span>
                </Link>
              </li>
              <li onClick={() => setActiveTab("users-info")} className={activeTab === "users-info" ? "active" : ""}>
                <Link to="#">
                  <i className="fas fa-users"></i>
                  <span className="visible">Users Info</span>
                </Link>
              </li>
              <li onClick={() => setActiveTab("bids-update")} className={activeTab === "bids-update" ? "active" : ""}>
                <Link to="#">
                  <i className="fas fa-cogs"></i>
                  <span className="visible">Bids Update</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div id="mainContent" className="main-content">
          <header id="headerContent">
          <div className="search-wrapper">
            <div className="social-icons">
            <div className="notification-wrapper">
              <i className="fas fa-megaphone"> 
              <img src="/megaphone.png" alt="megaphone" className="social-icon-megaphone" />
              {AnnouncementUnreadCount > 0 && <span className="notification-count">{AnnouncementUnreadCount}</span>}
              </i>
              {/* Message Icon */}
              <i className="fas fa-envelope" onClick={toggleMsgDropdown}>
                {MsgUnreadCount > 0 && <span className="notification-count">{MsgUnreadCount}</span>}
              </i>

              {isMsgDropdownOpen && (
                <div className="notification-dropdown msg-dropdown">
                  {messages.length > 0 ? (
                    messages.map((msg) => (
                      <div key={msg.id} className={`notification-item ${msg.active ? "read" : "unread"}`}>
                        <p>{msg.notification}</p>
                        <span className="timestamp">{msg.formattedTimestamp}</span>
                      </div>
                    ))
                  ) : (
                    <p className="no-notifications">No new messages</p>
                  )}
                </div>
              )}

              {/* Notification Icon */}
              <i className="fas fa-bell" onClick={toggleNotificationDropdown}>
                {NotificationUnreadCount > 0 && <span className="notification-count">{NotificationUnreadCount}</span>}
              </i>

              {isDropdownOpen && (
                <div className="notification-dropdown">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div key={notif.id} className={`notification-item ${notif.active ? "read" : "unread"}`}>
                        <p>{notif.notification}</p>
                        <span className="timestamp">{notif.formattedTimestamp}</span>
                      </div>
                    ))
                  ) : (
                    <p className="no-notifications">No new notifications</p>
                  )}
                </div>
              )}

              {/* Settings Icon */}
              <i
                className={`fa-solid fa-user-gear settings-icon ${isSettingsOpen ? "rotate" : ""}`}
                onClick={toggleSettingsDropdown}
              ></i>

              {isSettingsOpen && (
                <div className="settings-dropdown">
                  <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
              )}
            </div>

            </div>
            {/* <button onClick={handleLogout} className="btn logout">Logout</button> */}
          </div>
          </header>
        </div>
      </div>
      <main id="renderContainer" className="markets-container">
        {renderContent()}
      </main>
    </>
  );
};
export default HomePage;
