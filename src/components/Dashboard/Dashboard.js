import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Dashboard.css";
import OUSLCard from "../OUSLCard";
import defaultProfile from "../../assets/default-Profile.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userData"));
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("studentToken");
    localStorage.removeItem("userData");
    toast.success("Logged out successfully!");
    navigate("/sign");
  };

  const openLogoutConfirm = () => setShowLogoutConfirm(true);
  const closeLogoutConfirm = () => setShowLogoutConfirm(false);
  const navigateToProfile = () => navigate("/profile");

  return (
    <motion.div
      className="dashboard-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logout Confirmation Modal */}
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
          <div className="profile-section">
            <motion.div
              className="profile-image-container"
              onClick={navigateToProfile}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src={defaultProfile}
                alt="Profile"
                className="profile-image"
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

      <div className="dashboard-content">
        {user && (
          <div className="user-info">
            <h2>Welcome back, {user.name.split(' ')[0]}!</h2>
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
        )}

        <div className="dashboard-cards">
          <motion.div
            className="dashboard-card"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/courses")}
          >
            <div className="card-icon">📚</div>
            <h3>Courses</h3>
            <p>View your enrolled courses</p>
          </motion.div>

          <motion.div
            className="dashboard-card"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/grades")}
          >
            <div className="card-icon">📊</div>
            <h3>Grades</h3>
            <p>Check your academic progress</p>
          </motion.div>

          <motion.div
            className="dashboard-card"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/schedule")}
          >
            <div className="card-icon">🗓️</div>
            <h3>Schedule</h3>
            <p>View your class timetable</p>
          </motion.div>

          <motion.div
            className="dashboard-card"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/gpa-calculator")}
          >
            <div className="card-icon">🧮</div>
            <h3>GPA Calculator</h3>
            <p>Calculate your semester GPA</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;