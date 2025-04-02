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
import { Analytics } from "@vercel/analytics/react"
import ProfileCard from "../ProfileCard/ProfileCard";

const HomePage = () => {
  const [activeTab, setActiveTab] = useState(); // Default tab is "markets"
  const [result, setResult] = useState(false);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMsgDropdownOpen, setIsMsgDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth <= 768);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth <= 768);
    };
  
    handleResize(); // Call immediately to set the initial state
  
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  

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
            setAnnouncements(filteredAnnouncements)
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
  setIsAnnouncementOpen(false);
};
const toggleSettingsDropdown = () => {
  setIsSettingsOpen(!isSettingsOpen);
  setIsDropdownOpen(false);
  setIsMsgDropdownOpen(false);
  setIsAnnouncementOpen(false);
};

const toggleNotificationDropdown = () => {
  setIsDropdownOpen(!isDropdownOpen);
  setIsMsgDropdownOpen(false); // Close messages when opening notifications
  setIsSettingsOpen(false);
  setIsAnnouncementOpen(false);
};

const toggleAnnouncement = () => {
  setIsAnnouncementOpen(!isAnnouncementOpen);
  setIsDropdownOpen(false);
  setIsMsgDropdownOpen(false);
  setIsSettingsOpen(false);
}

const NotificationUnreadCount = notifications.filter((notif) => notif.active).length;
const MsgUnreadCount = messages.filter((msg) => msg.active).length;
const AnnouncementUnreadCount = announcements.filter((ann) => ann.active).length;

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
        return <UsersInfo setActiveTab={setActiveTab} setSelectedUser={setSelectedUser} />;
      case "results":
        return <Results />;
      case "bids-creation":
        return <BidsCreation />
      case "holiday-config":
        return <HolidayConfig />
      case "profile-card":
        return <ProfileCard selectedUser={selectedUser.userId} setActiveTab={setActiveTab}/>;
      default:
        return <ProfileCard />; // Default to Markets if no tab is selected
    }
  };

  return (
    <>
      <div className={`app-container ${isCollapsed ? "sidebar-collapsed" : "sidebar-expanded"}`}>
      {/* Sidebar */}
      <div className={`sidebar ${isCollapsed ? "collapsed" : "expanded"}`}>
        <div className="sidebar-header">
          <img src="Nifty10-logo.png" alt="logo" className="logo" onClick={() => setIsCollapsed((prev) => !prev)}/>
          {!isCollapsed && <span className="visible">Nifty10</span>}
        </div>
        <div className="sidebar-menu">
          <ul>
            <li onClick={() => setActiveTab("dashboard")} className={activeTab === "dashboard" ? "active" : ""}>
              <Link to="#">
                <i className="fa-solid fa-user-tie"></i>
                {!isCollapsed && <span className="visible">Dashboard</span>}
              </Link>
            </li>
            <li onClick={() => setActiveTab("markets")} className={activeTab === "markets" ? "active" : ""}>
              <Link to="#">
                <i className="fas fa-chart-line"></i>
                {!isCollapsed && <span className="visible">All Markets</span>}
              </Link>
            </li>
            <li onClick={() => setActiveTab("companies")} className={activeTab === "companies" ? "active" : ""}>
              <Link to="#">
                <i className="fas fa-building"></i>
                {!isCollapsed && <span className="visible">All Companies</span>}
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
                  {!isCollapsed && <span className="visible">Bids Creation</span>}
                </Link>
              </li>
              <li onClick={() => setActiveTab("market-status")} className={activeTab === "market-status" ? "active" : ""}>
                <Link to="#">
                  <i className="fas fa-folder-open"></i>
                  {!isCollapsed && <span className="visible">Market Status</span> }
                </Link>
              </li>
              <li onClick={() => setActiveTab("results")} className={activeTab === "results" ? "active" : ""}>
                <Link to="#">
                  <i className="fas fa-clock"></i>
                  {!isCollapsed && <span className="visible">Results</span> }
                </Link>
              </li>
              <li onClick={() => setActiveTab("users-info")} className={activeTab === "users-info" ? "active" : ""}>
                <Link to="#">
                  <i className="fas fa-users"></i>
                  {!isCollapsed && <span className="visible">Users Info</span>}
                </Link>
              </li>
              <li onClick={() => setActiveTab("admin-settings")} className={activeTab === "admin-settings" ? "active admin-settings" : "admin-settings"}>
                  <Link to="#">
                    <i className="fa-solid fa-user-gear settings-icon"></i>
                    {!isCollapsed && <span className="visible">Admin</span>}
                  </Link>
                </li>
              
              {/* <li onClick={() => setActiveTab("bids-update")} className={activeTab === "bids-update" ? "active" : ""}>
                <Link to="#">
                  <i className="fas fa-cogs"></i>
                  {!isCollapsed && <span className="visible">Bids Update</span>}
                </Link>
              </li> */}
            </ul>
          </div>
        </div>
        <div id="mobile-header" className="mobile-header">
          <header id="header" className='header'>
          <div className="search-wrapper">
            <div className="social-icons">
            <img src="Nifty10-logo.png" alt="logo" className="logo" onClick={() => setIsCollapsed((prev) => !prev)}/>
            <div className="notification-wrapper">
              <i className="fas fa-megaphone" onClick={toggleAnnouncement}> 
              <img src="/megaphone.png" alt="megaphone" className="social-icon-megaphone" />
              {AnnouncementUnreadCount > 0 && <span className="notification-count">{AnnouncementUnreadCount}</span>}
              </i>
              {isAnnouncementOpen && (
                <div className="announcement-popup">
                  <button className="close-btn" onClick={() => setIsAnnouncementOpen(false)}>✖</button>
                <div className="announcement-text-wrapper">  
                  <div className="announcement-icon-wrapper">
                    <img src="/megaphone.png" alt="megaphone" className="announcement-icon" />
                    <div className="waves"></div>
                  </div>

                  {announcements.filter(announcement => announcement.active).length > 0 ? (
                    <ul className="announcement-list">
                      {announcements
                        .filter(announcement => announcement.active) 
                        .map((announcement) => (
                          <li key={announcement.id} className="announcement-text">
                            {announcement.notification}
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p className="no-notifications">No new messages</p>
                  )}
                  </div>
                </div>
              )}

              {/* Message Icon */}
              <i className="fas fa-envelope" onClick={toggleMsgDropdown}>
                {MsgUnreadCount > 0 && <span className="notification-count">{MsgUnreadCount}</span>}
              </i>

              {isMsgDropdownOpen && (
                <div className="notification-dropdown msg-dropdown">
                  {messages.filter(msg => msg.active).length > 0 ? (
                    messages
                      .filter(msg => msg.active)
                      .map((msg) => (
                        <div key={msg.id} className="notification-item">
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
                  {notifications.filter((notif) => notif.active).length > 0 ? (
                    notifications
                      .filter((notif) => notif.active)
                      .map((notif) => (
                        <div key={notif.id} className="notification-item read">
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

        {/* Main Content */}
        <div id="mainContent" className="main-content">
          <header id="headerContent" className={`header-content ${isCollapsed ? "collapsed-header-content" : "expanded-header-content"}`}>
          <div className="search-wrapper">
            <div className="social-icons">
            <div className="notification-wrapper">
              <i className="fas fa-megaphone" onClick={toggleAnnouncement}> 
              <img src="/megaphone.png" alt="megaphone" className="social-icon-megaphone" />
              {AnnouncementUnreadCount > 0 && <span className="notification-count">{AnnouncementUnreadCount}</span>}
              </i>
              {isAnnouncementOpen && (
                <div className="announcement-popup">
                  <button className="close-btn" onClick={() => setIsAnnouncementOpen(false)}>✖</button>
                <div className="announcement-text-wrapper">  
                  <div className="announcement-icon-wrapper">
                    <img src="/megaphone.png" alt="megaphone" className="announcement-icon" />
                    <div className="waves"></div>
                  </div>

                  {announcements.filter(announcement => announcement.active).length > 0 ? (
                    <ul className="announcement-list">
                      {announcements
                        .filter(announcement => announcement.active) 
                        .map((announcement) => (
                          <li key={announcement.id} className="announcement-text">
                            {announcement.notification}
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p className="no-notifications">No new messages</p>
                  )}
                  </div>
                </div>
              )}






              {/* Message Icon */}
              <i className="fas fa-envelope" onClick={toggleMsgDropdown}>
                {MsgUnreadCount > 0 && <span className="notification-count">{MsgUnreadCount}</span>}
              </i>

              {isMsgDropdownOpen && (
                <div className="notification-dropdown msg-dropdown">
                  {messages.filter(msg => msg.active).length > 0 ? (
                    messages
                      .filter(msg => msg.active)
                      .map((msg) => (
                        <div key={msg.id} className="notification-item">
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
                  {notifications.filter((notif) => notif.active).length > 0 ? (
                    notifications
                      .filter((notif) => notif.active)
                      .map((notif) => (
                        <div key={notif.id} className="notification-item read">
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
      <main id="renderContainer" className={`markets-container ${isCollapsed ? "collapsed-content" : "expanded-content"}`}>
        {renderContent()}
        <Analytics />
      </main>
    </>
  );
};
export default HomePage;
