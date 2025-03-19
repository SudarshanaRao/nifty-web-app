import React, { useEffect, useState } from "react";
import "./UsersInfo.css";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const UsersInfo = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayedUsersData, setDisplayedUsersData] = useState([]);
  const usersPerPage = 10;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        "https://dev-api.nifty10.com/nif/user/list/user?size=1000"
      );
      const data = await response.json();

      console.log("Fetched Users:", data);

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

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredUsers(users.filter(user => user.userType === "CUSTOMER"));
    } else {
      const filtered = users
        .filter(user => user.userType === "CUSTOMER") // Exclude admins
        .filter(user =>
          (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (user.mobileNo && String(user.mobileNo).toLowerCase().includes(searchQuery.toLowerCase()))
        );
      setFilteredUsers(filtered);
      setCurrentPage(0);
    }
  }, [searchQuery, users]);

  const changeActiveStatus = async (id, name, prevStatus) => {
    try {
      const newStatus = !prevStatus; // Toggle status

      const response = await axios.post(
        "https://dev-api.nifty10.com/nif/user/user/updateUser",
        { userId: id, name: name, isActive: newStatus },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Update Response:", response.data);

      if (response.status === 200) {
        toast.success("Active Status changed successfully!");

        // Update users locally instead of re-fetching
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.userId === id ? { ...user, name: user.name || name, isActive: newStatus } : user
          )
        );
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error changing status. Please try again.");
    }
  };

  const onClickStatus = (id, name, prevStatus) => {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger"
      },
      buttonsStyling: false
    });

    swalWithBootstrapButtons.fire({
      title: "Are you sure?",
      text: "You want to change the Active Status",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        changeActiveStatus(id, name, prevStatus);
        swalWithBootstrapButtons.fire({
          title: "Changed!",
          text: "Active Status changed Successfully",
          icon: "success"
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        swalWithBootstrapButtons.fire({
          title: "Cancelled",
          text: "Active Status not changed!",
          icon: "error"
        });
      }
    });
  };

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  useEffect(() => {
    const startIndex = currentPage * usersPerPage;
    setDisplayedUsersData(filteredUsers.slice(startIndex, startIndex + usersPerPage));
  }, [filteredUsers, currentPage]);

  return (
    <div className="users-info__container">
      <ToastContainer position="top-right" style={{ marginTop: "65px" }} />
      <div className="top-container">
        <div className="users-search-wrapper">
          <div className="users-search-box">
            <i className="fas fa-search"></i>
            <input 
              type="text"
              className="users-search-input"
              placeholder="Search by Name, Email, or Mobile Number..."
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
                      <th>Wallet</th>
                      <th>Earned Money</th>
                      <th>Is Active</th>
                      
                    </tr>
                  </thead>
                  <tbody>
                    {displayedUsersData.map((user, index) => (
                      <tr key={index} className="users-info__row">
                        <td className="users-info__name">{user.name || "N/A"}</td>
                        <td>{user.mobileNo || "N/A"}</td>
                        <td>{user.email || "N/A"}</td>
                        <td>{user.createdDate ? new Date(user.createdDate).toLocaleDateString() : "N/A"}</td>
                        <td>₹{user.investedMoney?.toLocaleString("en-IN") || "0"}</td>
                        <td>{user.points !== null && user.points !== undefined ? user.points.toFixed(2) : "0.00"}</td>
                        <td>₹{user.earnedMoney?.toLocaleString("en-IN") || "0"}</td>
                        <td 
                          onClick={() => onClickStatus(user.userId, user.name, user.isActive)} 
                          className="users-info__status"
                        >
                          {user.isActive ? '✅ Active' : '❌ Inactive'}
                        </td>
                        
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
