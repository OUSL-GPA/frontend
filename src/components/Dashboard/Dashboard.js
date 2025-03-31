import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Added AnimatePresence here
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('userData'));
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('userData');
    toast.success('Logged out successfully!');
    navigate('/sign');
  };

  const openLogoutConfirm = () => {
    setShowLogoutConfirm(true);
  };

  const closeLogoutConfirm = () => {
    setShowLogoutConfirm(false);
  };

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
            onClick={closeLogoutConfirm} // Close when clicking overlay
          >
            <motion.div
              className="logout-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()} // Prevent overlay close when clicking modal
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
        <h1>Welcome to Your Dashboard</h1>
        <motion.button 
          onClick={openLogoutConfirm} 
          className="logout-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Logout
        </motion.button>
      </div>

      <div className="dashboard-content">
        {user && (
          <div className="user-info">
            <h2>User Information</h2>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Student ID:</strong> {user.studentId}</p>
          </div>
        )}

<div className="dashboard-cards">
          <motion.div 
            className="dashboard-card"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <h3>Courses</h3>
            <p>View your enrolled courses</p>
          </motion.div>

          <motion.div 
            className="dashboard-card"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <h3>Grades</h3>
            <p>Check your academic progress</p>
          </motion.div>

          <motion.div 
            className="dashboard-card"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <h3>Schedule</h3>
            <p>View your class timetable</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;