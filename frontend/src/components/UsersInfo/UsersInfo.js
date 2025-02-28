import React, { useEffect, useState } from "react";
import "./UsersInfo.css";
const UsersInfo = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    fetch("https://dev-api.nifty10.com/nif/user/list/activeUser")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
          setFilteredUsers(data);
        } else if (data && typeof data === "object") {
          const usersArray = Object.values(data).find((val) => Array.isArray(val));
          if (usersArray) {
            setUsers(usersArray);
            setFilteredUsers(usersArray);
          } else {
            throw new Error("No user list found in API response");
          }
        } else {
          throw new Error("API did not return expected data");
        }
      })
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const filtered = users.filter((user) =>
      (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);
  if (loading) {
    return <div className="users-info__loading">Loading...</div>;
  }

  if (error) {
    return <div className="users-info__error">Error: {error.message}</div>;
  }

  return (
    <div className="users-info__container">
      <div className="top-container">
        <div className="users-search-wrapper">
              <div className="users-search-box">
                <i className="fas fa-search"></i>
                <input 
                  type="text"
                  className="users-search-input"
                  placeholder="Search by Name or Email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
        </div>
        <h2 className="users-info__title">Users List</h2>
      
      </div>
      <div className="users-info__table-wrapper">
        {filteredUsers.length === 0 ? (
          <div className="users-info__error">Sorry, no data found..!</div>
        ) : (
          <table className="users-info__table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile No</th>
                <th>Email</th>
                <th>Created Date</th>
                <th>Invested Money</th>
                <th>Points</th>
                <th>Is Active</th>
                <th>Earned Money</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={index} className="users-info__row">
                  <td>{user.name || "N/A"}</td>
                  <td>{user.mobileNo || "N/A"}</td>
                  <td>{user.email || "N/A"}</td>
                  <td>{user.createdDate ? new Date(user.createdDate).toLocaleDateString() : "N/A"}</td>
                  <td>₹{user.investedMoney?.toLocaleString("en-IN") || "0"}</td>
                  <td>{user.points !== null && user.points !== undefined ? user.points.toFixed(2) : "0.00"}</td>
                  <td className="users-info__status">{user.isActive ? "✅" : "❌"}</td>
                  <td>₹{user.earnedMoney?.toLocaleString("en-IN") || "0"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UsersInfo;
