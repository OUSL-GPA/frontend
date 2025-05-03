import React, { useContext, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./Dashboard.css";
import OUSLCard from "../OUSLCard";
import defaultProfile from "../../assets/default-Profile.png";
import { AuthContext } from "../../context/AuthContext";
import { IoNotifications } from "react-icons/io5";
import { FaQuestion } from "react-icons/fa";



const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [gpa, setGPA] = useState(null);
  const [gpaLoading, setGpaLoading] = useState(true);
  const [profilePicture, setProfilePicture] = useState(defaultProfile);

  const userId = user?.id;

  const handleLogout = () => {
    localStorage.removeItem("studentToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("user");
    toast.success("Logged out successfully!");
    navigate("/sign");
  };

  const openLogoutConfirm = () => setShowLogoutConfirm(true);
  const closeLogoutConfirm = () => setShowLogoutConfirm(false);
  const navigateToProfile = () => navigate("/profile");

  const fetchGPA = useCallback(async () => {
    setGpaLoading(true);
    try {
      const response = await axios.get(`/api/gpa/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setGPA(response.data.gpa);
    } catch (err) {
      setGPA(null);
      console.error("Failed to fetch GPA:", err);
    } finally {
      setGpaLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const token = localStorage.getItem("studentToken");
        if (!token || !userId) return;

        const response = await axios.get("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success && response.data.data.profilePicture) {
          setProfilePicture(response.data.data.profilePicture);
        }
      } catch (err) {
        console.error("Failed to fetch profile picture:", err);
      }
    };

    if (userId) {
      fetchGPA();
      fetchProfilePicture();
    }
  }, [userId, fetchGPA]);

  const getClassification = (gpaValue) => {
    if (gpaValue === null || gpaValue === undefined) return null;
    if (gpaValue >= 3.7) return "first";
    if (gpaValue >= 3.3) return "upper";
    if (gpaValue >= 2.7) return "lower";
    if (gpaValue >= 2.0) return "general";
    return "below";
  };

  return (
    <motion.div
      className="dashboard-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            className="logout-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLogoutConfirm}
          >
            <motion.div
              className="logout-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Confirm Logout</h3>
              <p>Are you sure you want to logout?</p>
              <div className="logout-modal-buttons">
                <motion.button
                  className="confirm-btn"
                  onClick={handleLogout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Yes, Logout
                </motion.button>
                <motion.button
                  className="cancel-btn"
                  onClick={closeLogoutConfirm}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  No, Stay Logged In
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="dashboard-header">
        <OUSLCard />
        <div className="header-right">
          <IoNotifications className="notify-button" onClick={() => navigate("/discussions")} />
          <div className="profile-log">
            <div className="profile-section">
              <motion.div
                className="profile-image-container"
                onClick={navigateToProfile}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="profile-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultProfile;
                  }}
                />
              </motion.div>
              <div className="profile-info">
                {user && (
                  <>
                    <h2 className="profile-name">{user.name}</h2>
                    <p className="profile-id">ID: {user.studentId}</p>
                  </>
                )}
              </div>
            </div>
            <motion.button
              onClick={openLogoutConfirm}
              className="logout-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="logout-icon">→</span> Logout
            </motion.button>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {user && (
          <div className="user-info">
            <div className="left-side">
              <h2>Welcome {user.name.split(" ")[0]}!</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{user.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Student ID:</span>
                  <span className="info-value">{user.studentId}</span>
                </div>
              </div>
            </div>

            <div className="right-side">
              <div className="gpa-display-container">
                <div className="gpa-header">
                  <h3>Your Current GPA</h3>
                  <button
                    onClick={fetchGPA}
                    className="refresh-gpa-btn"
                    disabled={gpaLoading}
                  >
                    {gpaLoading ? "Refreshing..." : "Refresh"}
                  </button>
                </div>
                <div
                  className="gpa-value"
                  data-classification={getClassification(gpa)}
                >
                  {gpaLoading ? (
                    <div className="gpa-loading"><div className="loading-spinner"></div>Calculating...</div>
                  ) : gpa !== null ? (
                    <>
                      <span className="gpa-number">{gpa}</span>
                      <span className="gpa-scale">/ 4.0</span>
                    </>
                  ) : (
                    <div className="gpa-error">
                      0.0<span className="gpa-scale">/ 4.0</span>
                    </div>
                  )}
                </div>
                {gpa !== null && !gpaLoading && (
                  <div
                    className="gpa-message"
                    data-classification={getClassification(gpa)}
                  >
                    {gpa >= 3.7
                      ? "1st Class - Excellent work! Keep it up!"
                      : gpa >= 3.3
                        ? "2nd Upper Class - Good performance!"
                        : gpa >= 2.7
                          ? "2nd Lower Class - You're doing well."
                          : gpa >= 2.0
                            ? "General - Let's work on improving this together."
                            : "Below General - More effort needed."}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="dashboard-cards">
          <motion.div
            className="dashboard-card"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/gpa/${userId}`)}
          >
            <div className="card-icon">📚</div>
            <h3>Add Course</h3>
            <p>Add new courses to your record</p>
          </motion.div>

          <motion.div
            className="dashboard-card"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/my-courses/${userId}`)}
          >
            <div className="card-icon">📊</div>
            <h3>Grades</h3>
            <p>Check your academic progress</p>
          </motion.div>

          <motion.div
            className="dashboard-card"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/my-courses/${userId}/eligibility`)}
          >
            <div className="card-icon">🧮</div>
            <h3>Degree Award</h3>
            <p>Courses needed to get eligible for certificate</p>
          </motion.div>

          <motion.div
            className="dashboard-card"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/credit-summary")}
          >
            <div className="card-icon">📱</div>
            <h3>Credit Summery</h3>
            <p>
              Credit management and summarize
            </p>
          </motion.div>
        </div>
      </div>
      <a
        href="https://wa.link/96p9lr"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaQuestion className="help-button"/>
      </a>
    </motion.div>
  );
};

export default Dashboard;
