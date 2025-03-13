import React, { useEffect, useState } from "react";
import "./UsersInfo.css";

const UsersInfo = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const usersPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          "https://dev-api.nifty10.com/nif/user/list/user?size=1000"
        );
        const data = await response.json();

        if (data?.data?.content) {
          setUsers(data.data.content);
          setFilteredUsers(data.data.content);
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

  useEffect(() => {
    if (!searchQuery) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          (user.name &&
            user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (user.email &&
            user.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredUsers(filtered);
      setCurrentPage(0);
    }
  }, [searchQuery, users]);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = currentPage * usersPerPage;
  const displayedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

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
      {loading ? (
        <div className="users-info__loading">Loading users...</div>
      ) : error ? (
        <div className="users-info__error">{error}</div>
      ) : (
      
        <div className="users-info__table-wrapper">
          
          {filteredUsers.length === 0 ? (
            <div className="users-info__error">Sorry, no data found..!</div>
          ) : (
            <>
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
                  {displayedUsers.map((user, index) => (
                    <tr key={index} className="users-info__row">
                      <td>{user.name || "N/A"}</td>
                      <td>{user.mobileNo || "N/A"}</td>
                      <td>{user.email || "N/A"}</td>
                      <td>{user.createdDate ? new Date(user.createdDate).toLocaleDateString() : "N/A"}</td>
                      <td>₹{user.investedMoney?.toLocaleString("en-IN") || "0"}</td>
                      <td>{user.points !== null && user.points !== undefined ? user.points.toFixed(2) : "0.00"}</td>
                      <td className="users-info__status">{user.isActive ? '✅ Active' : '❌ Inactive'}</td>
                      <td>₹{user.earnedMoney?.toLocaleString("en-IN") || "0"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pagination-container">
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                  disabled={currentPage === 0}
                >
                  ⬅ Prev
                </button>
                <span className="pagination-info">Page {currentPage + 1} of {totalPages}</span>
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                  disabled={currentPage >= totalPages - 1}
                >
                  Next ➡
                </button>
              </div>
            </>
            
          )}
          
        </div>
        
      )}
      </div>
    </div>
  );
};

export default UsersInfo;
