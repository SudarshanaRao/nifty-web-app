import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import "./HomePage.css";
import Markets from "../Market/Markets";
import Company from '../Company/Company'
import MarketStatus from "../MarketStatus/MarketStatus";
import UsersInfo from "../UsersInfo/UsersInfo";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { toast } from "react-toastify";



const HomePage = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState(""); // Default tab
  const [result, setResult] = useState(false);
  const navigate = useNavigate();

  const userVerification = () => {
    const loginCheck = localStorage.getItem("userToken");
    const otpCheck = localStorage.getItem("isOtpVerfied");
    if (loginCheck && otpCheck) {
      setResult(true);
    }
  }

  useEffect(() => {
      const isAuthenticated = localStorage.getItem("isOtpVerfied"); // Check if user is logged in
      if (!isAuthenticated) {
        toast.error("You need to Verify Otp!", { position: "top-center" });
        navigate("/otp");
        return;
      }
      userVerification();
    }, [navigate]);

  const handleNavbar = () => {
    if (window.innerWidth < 800) return;
    setSidebarExpanded(!sidebarExpanded);
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken"); 
    localStorage.removeItem("isOtpVerfied"); 
    window.location.href = "/login"; 
    console.log(result);
    
};


  const renderContent = () => {
    switch (activeTab) {
      case "markets":
        return <Markets />;
      case "companies":
        return <Company />;
      // case "bids-creation":
      //   return <BidsCreation />;
      case "market-status":
        return <MarketStatus />;
      // case "results":
      //   return <Results />;
      case "users-info":
        return <UsersInfo />;
      // case "bids-update":
      //   return <BidsUpdate />;
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
          {/* <h3 className="brand"> */}
            <img src="Nifty10-logo.png" alt="logo" className="logo" onClick={handleNavbar} />
            <span className={sidebarExpanded ? "visible" : "hidden"}>Nifty10</span>
          {/* </h3> */}
        </div>
        <div className="sidebar-menu">
          <ul>
            <li onClick={() => setActiveTab("markets")}>
              <Link to="#">
                <i className="fas fa-users"></i>
                <span className={sidebarExpanded ? "visible" : "hidden"}>All Markets</span>
              </Link>
            </li>
            <li onClick={() => setActiveTab("companies")}>
              <Link to="#">
                <i className="fas fa-users"></i>
                <span className={sidebarExpanded ? "visible" : "hidden"}>All Companies</span>
              </Link>
            </li>
            <li onClick={() => setActiveTab("market-bids")}>
              <Link to="#">
                <i className="fas fa-list"></i>
                <span className={sidebarExpanded ? "visible" : "hidden"}>Market Bids</span>
              </Link>
            </li>
            <li onClick={() => setActiveTab("bids-creation")}>
              <Link to="#">
                <i className="fas fa-clipboard"></i>
                <span className={sidebarExpanded ? "visible" : "hidden"}>Bids Creation</span>
              </Link>
            </li>
            <li onClick={() => setActiveTab("market-status")}>
              <Link to="#">
                <i className="fas fa-folder-open"></i>
                <span className={sidebarExpanded ? "visible" : "hidden"}>Market Status</span>
              </Link>
            </li>
            <li onClick={() => setActiveTab("results")}>
              <Link to="#">
                <i className="fas fa-clock"></i>
                <span className={sidebarExpanded ? "visible" : "hidden"}>Results</span>
              </Link>
            </li>
            <li onClick={() => setActiveTab("users-info")}>
              <Link to="#">
                <i className="fas fa-address-book"></i>
                <span className={sidebarExpanded ? "visible" : "hidden"}>Users Info</span>
              </Link>
            </li>
            <li onClick={() => setActiveTab("bids-update")}>
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
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input className="search-input" type="search" placeholder="Search" />
            </div>
            <div className="social-icons">
              <i className="fas fa-bell"></i>
              <i className="fas fa-envelope"></i>
              <i className="fa-solid fa-user-tie"></i>
            </div>
            <button onClick={handleLogout} className="btn logout">Logout</button>
          </div>
        </header>
        
        {/* Render Active Tab Content Below Header */}
        
      </div>

    </div>
    <main id="renderContainer" className="markets-container">
    {renderContent()}
  </main>
  </>
  );
};

export default HomePage;
