import React, { useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./Dashboard.css";
import OUSLCard from "../OUSLCard";
import defaultProfile from "../../assets/default-Profile.png";
import { AuthContext } from "../../context/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const response = await axios.get(`/api/courses/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCourses(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.response?.data?.error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch GPA
  const fetchGPA = async () => {
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
  };

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const token = localStorage.getItem("studentToken");
        if (!token || !userId) return;

        const response = await axios.get('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success && response.data.data.profilePicture) {
          setProfilePicture(response.data.data.profilePicture);
        }
      } catch (err) {
        console.error('Failed to fetch profile picture:', err);
        // Keep the default profile picture if there's an error
      }
    };

    
    if (userId) {
      fetchCourses();
      fetchGPA();
      fetchProfilePicture();
    }
  }, [userId]);

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (error) return <div className="error-screen">Error: {error}</div>;

  // Function to determine GPA color based on value
  const getGpaColor = (gpaValue) => {
    if (gpaValue === null || gpaValue === undefined) return "#666";
    if (gpaValue >= 3.5) return "#2ecc71"; // Green for high GPA
    if (gpaValue >= 2.5) return "#f39c12"; // Orange for medium GPA
    return "#e74c3c"; // Red for low GPA
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
            {/* Enhanced GPA Display */}
            <div className="gpa-display-container">
              <div className="gpa-header">
                <h3>Your Current GPA</h3>
                <button 
                  onClick={fetchGPA} 
                  className="refresh-gpa-btn"
                  disabled={gpaLoading}
                >
                  {gpaLoading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
              <div 
                className="gpa-value"
                style={{ color: getGpaColor(gpa) }}
              >
                {gpaLoading ? (
                  <div className="gpa-loading">Calculating...</div>
                ) : gpa !== null ? (
                  <>
                    <span className="gpa-number">{gpa}</span>
                    <span className="gpa-scale">/ 4.0</span>
                  </>
                ) : (
                  <div className="gpa-error">0.0<span className="gpa-scale">/ 4.0</span></div>
                )}
              </div>
              {gpa !== null && !gpaLoading && (
                <div className="gpa-message">
                  {gpa >= 3.5 ? "Excellent work! Keep it up!" :
                   gpa >= 2.5 ? "Good progress! You're doing well." :
                   "Let's work on improving this together."}
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
            className="dashboard-card disabled-card"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {toast.info("This feature is coming soon!")}}
          >
            <div className="card-icon">🧮</div>
            <h3>GPA Calculator</h3>
            <p>Calculate and track your semester GPA</p>
          </motion.div>

          <motion.div
            className="dashboard-card disabled-card"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {toast.info("This feature is coming soon!")}}
          >
            <div className="card-icon">🗓️</div>
            <h3>Schedule</h3>
            <p>View your class timetable</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;