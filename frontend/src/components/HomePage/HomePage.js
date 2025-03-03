import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./HomePage.css";
import Markets from "../Market/Markets";
import Company from "../Company/Company";
import MarketStatus from "../MarketStatus/MarketStatus";
import UsersInfo from "../UsersInfo/UsersInfo";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { toast } from "react-toastify";

const HomePage = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState("markets"); // Default tab is "markets"
  const [result, setResult] = useState(false);
  const navigate = useNavigate();

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

  const handleNavbar = () => {
    if (window.innerWidth < 800) return;
    setSidebarExpanded(!sidebarExpanded);
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("isOtpVerfied");
    window.location.href = "/login";
  };

  const renderContent = () => {
    switch (activeTab) {
      case "markets":
        return <Markets />;
      case "companies":
        return <Company />;
      case "market-status":
        return <MarketStatus />;
      case "users-info":
        return <UsersInfo />;
      default:
        return <Markets />; // Default to Markets if no tab is selected
    }
  };

  return (
    <>
      <div className={`app-container ${sidebarExpanded ? "sidebar-expanded" : "sidebar-collapsed"}`}>
        {/* Sidebar */}
        <div className={`sidebar ${sidebarExpanded ? "expanded" : "collapsed"}`}>
          <div className="sidebar-header">
            <img src="Nifty10-logo.png" alt="logo" className="logo" onClick={handleNavbar} />
            <span className={sidebarExpanded ? "visible" : "hidden"}>Nifty10</span>
          </div>
          <div className="sidebar-menu">
            <ul>
              <li onClick={() => setActiveTab("markets")} className={activeTab === "markets" ? "active" : ""}>
                <Link to="#">
                  <i className="fas fa-chart-line"></i>
                  <span className={sidebarExpanded ? "visible" : "hidden"}>All Markets</span>
                </Link>
              </li>
              <li onClick={() => setActiveTab("companies")} className={activeTab === "companies" ? "active" : ""}>
                <Link to="#">
                  <i className="fas fa-building"></i>
                  <span className={sidebarExpanded ? "visible" : "hidden"}>All Companies</span>
                </Link>
              </li>
              <li onClick={() => setActiveTab("market-bids")} className={activeTab === "market-bids" ? "active" : ""}>
                <Link to="#">
                  <i className="fas fa-list"></i>
                  <span className={sidebarExpanded ? "visible" : "hidden"}>Market Bids</span>
                </Link>
              </li>
              <li onClick={() => setActiveTab("bids-creation")} className={activeTab === "bids-creation" ? "active" : ""}>
                <Link to="#">
                  <i className="fas fa-clipboard"></i>
                  <span className={sidebarExpanded ? "visible" : "hidden"}>Bids Creation</span>
                </Link>
              </li>
              <li onClick={() => setActiveTab("market-status")} className={activeTab === "market-status" ? "active" : ""}>
                <Link to="#">
                  <i className="fas fa-folder-open"></i>
                  <span className={sidebarExpanded ? "visible" : "hidden"}>Market Status</span>
                </Link>
              </li>
              <li onClick={() => setActiveTab("results")} className={activeTab === "results" ? "active" : ""}>
                <Link to="#">
                  <i className="fas fa-clock"></i>
                  <span className={sidebarExpanded ? "visible" : "hidden"}>Results</span>
                </Link>
              </li>
              <li onClick={() => setActiveTab("users-info")} className={activeTab === "users-info" ? "active" : ""}>
                <Link to="#">
                  <i className="fas fa-users"></i>
                  <span className={sidebarExpanded ? "visible" : "hidden"}>Users Info</span>
                </Link>
              </li>
              <li onClick={() => setActiveTab("bids-update")} className={activeTab === "bids-update" ? "active" : ""}>
                <Link to="#">
                  <i className="fas fa-cogs"></i>
                  <span className={sidebarExpanded ? "visible" : "hidden"}>Bids Update</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div id="mainContent" className="main-content">
          <header id="headerContent">
            <div className="search-wrapper">
              {/* <div className="search-box">
                <i className="fas fa-search"></i>
                <input className="search-input" type="search" placeholder="Search" />
              </div> */}
              <div className="social-icons">
                <i className="fas fa-bell"></i>
                <i className="fas fa-envelope"></i>
                <i className="fa-solid fa-user-tie"></i>
              </div>
              <button onClick={handleLogout} className="btn logout">Logout</button>
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
