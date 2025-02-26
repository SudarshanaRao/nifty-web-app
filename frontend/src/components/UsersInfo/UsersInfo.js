import React, { useEffect, useState } from "react";
import './UsersInfo.css'

const UsersInfo = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("https://dev-api.nifty10.com/nif/user/list/activeUser")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched data:", data);
        if (Array.isArray(data)) {
          setUsers(data);
        } else if (data && typeof data === "object") {
          console.log("Data object keys:", Object.keys(data));
          const usersArray = Object.values(data).find((val) => Array.isArray(val));

          if (usersArray) {
            setUsers(usersArray);
          } else {
            throw new Error("No user list found in API response");
          }
        } else {
          throw new Error("API did not return expected data");
        }
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setError(error);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="users-info__loading">Loading...</div>;
  }

  if (error) {
    return <div className="users-info__error">Error: {error.message}</div>;
  }

  return (
    <div className="users-info__container">
      <h2 className="users-info__title">Users List</h2>
      <div className="users-info__table-wrapper">
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
            {users.map((user, index) => (
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
      </div>
    </div>
  );
};

export default UsersInfo;
