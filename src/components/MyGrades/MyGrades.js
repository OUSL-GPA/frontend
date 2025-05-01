import React, { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./MyGrades.css";
import { IoReturnUpBack } from "react-icons/io5";
import { FaCalculator } from "react-icons/fa";

const MyGrades = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const [editGrade, setEditGrade] = useState(null);
  const [newGrade, setNewGrade] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [showPending, setShowPending] = useState(false);
  const [gpa, setGpa] = useState(null);
  const navigate = useNavigate();

  const gradeOptions = [
    "A+", "A", "A-", "B+", "B", "B-", 
    "C+", "C", "C-", "D+", "D", "E", "F", 
    "Resit", "Repeat", "Pending"
  ];

  const statusColors = {
    'Pass': '#4CAF50',
    'Resit': '#FF9800',
    'Repeat': '#F44336',
    'Pending': '#9E9E9E',
    'Eligible': '#2196F3',
    'Failed': '#F44336'
  };

  const fetchCourses = useCallback(async () => {
    try {
      const response = await axios.get(`/api/courses/${user.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCourses(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch courses");
      setCourses([]);
      setLoading(false);
    }
  }, [user.id]);

  const fetchGPA = useCallback(async () => {
    try {
      const response = await axios.get(`/api/gpa/latest/${user.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setGpa(response.data);
    } catch (err) {
      console.error("Error fetching GPA:", err);
    }
  }, [user.id]);

  useEffect(() => {
    fetchCourses();
    fetchGPA();
  }, [fetchCourses, fetchGPA]);

  const handleDeleteCourse = async (courseId) => {
    if (!courseId) return;
    try {
      await axios.delete(`/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCourses(courses.filter((course) => course._id !== courseId));
      setIsModalOpen(false);
      fetchGPA();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete course");
    }
  };

  const handleUpdateGrade = async (courseId) => {
    try {
      const response = await axios.put(
        `/api/courses/${courseId}/update-grade`,
        { grade: newGrade },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      
      setCourses(
        courses.map((course) =>
          course._id === courseId ? { 
            ...course, 
            grade: newGrade,
            progressStatus: response.data.data.progressStatus,
            attempts: response.data.data.attempts || course.attempts,
            eligibilityLeft: response.data.data.eligibilityLeft || course.eligibilityLeft
          } : course
        )
      );
      setEditGrade(null);
      setNewGrade("");
      fetchGPA();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update grade");
    }
  };

  const handleUpdateCourseType = async (courseId, newType) => {
    try {
      await axios.put(
        `/api/courses/${courseId}/update-type`,
        { courseType: newType },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setCourses(
        courses.map((course) =>
          course._id === courseId ? { ...course, courseType: newType } : course
        )
      );
      fetchGPA();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update course type");
    }
  };

  const calculateGPA = async () => {
    try {
      const response = await axios.get(`/api/gpa/${user.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setGpa(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to calculate GPA");
    }
  };

  const openDeleteModal = (courseId) => {
    setCourseToDelete(courseId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCourseToDelete(null);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const safeCourses = Array.isArray(courses) ? courses : [];

  return (
    <div className="my-courses-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <IoReturnUpBack />
      </button>
      <h1>My Courses</h1>

      <div className="gpa-display">
        {gpa && (
          <div className="gpa-box">
            <h3>Current GPA: <span className="gpa-value">{gpa.gpa || "Not calculated"}</span></h3>
            <p>Based on {gpa.coursesIncluded} of {gpa.totalCourses} courses</p>
            <p>Total Credits: {gpa.totalCredits}</p>
            <button className="calculate-btn" onClick={calculateGPA}>
              <FaCalculator /> Recalculate GPA
            </button>
          </div>
        )}
      </div>

      <div className="filter-controls">
        <label className="toggle-pending">
          <input
            type="checkbox"
            checked={showPending}
            onChange={() => setShowPending(!showPending)}
          />
          Show Pending Courses
        </label>
      </div>

      {safeCourses.length === 0 ? (
        <p className="no-courses-message">No courses found. Add some courses to see them here.</p>
      ) : (
        <div className="courses-by-level">
          {[3, 4, 5, 6].map((level) => {
            const levelCourses = safeCourses.filter(
              (course) => course.level === level && 
                         (showPending || course.grade !== 'Pending')
            );

            return (
              levelCourses.length > 0 && (
                <div key={level} className="level-section">
                  <h2>Level {level}</h2>

                  <div className="course-type-section">
                    {["compulsory", "elective"].map((type) => {
                      const typeCourses = levelCourses.filter(
                        (course) => course.courseType === type
                      );

                      return (
                        typeCourses.length > 0 && (
                          <div key={type} className="course-type-group">
                            <h3>
                              {type.charAt(0).toUpperCase() + type.slice(1)} Courses
                              {type === 'compulsory' && level >= 4 && 
                               <span className="gpa-note"> (Included in GPA)</span>}
                            </h3>
                            <div className="table-responsive">
                              <table>
                                <thead>
                                  <tr>
                                    <th>Course Code</th>
                                    <th>Course Name</th>
                                    <th>Credits</th>
                                    <th>Status</th>
                                    <th>Grade</th>
                                    <th>Attempts</th>
                                    <th>Eligibility Left</th>
                                    <th className="action-column">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {typeCourses.map((course) => (
                                    <tr 
                                      key={course._id} 
                                      className={`course-row ${course.grade === 'Pending' ? 'pending-course' : ''}`}
                                    >
                                      <td className="course-code">{course.courseCode}</td>
                                      <td className="course-name">{course.courseName}</td>
                                      <td className="course-credits">{course.credits || "N/A"}</td>
                                      <td className="course-status">
                                        <span 
                                          className="status-badge"
                                          style={{ backgroundColor: statusColors[course.progressStatus] || '#9E9E9E' }}
                                        >
                                          {course.progressStatus || "N/A"}
                                        </span>
                                      </td>
                                      <td className="course-grade">
                                        {editGrade === course._id ? (
                                          <div className="grade-edit-container">
                                            <select
                                              value={newGrade}
                                              onChange={(e) => setNewGrade(e.target.value)}
                                              className="grade-select"
                                            >
                                              <option value="">Select Grade</option>
                                              {gradeOptions.map((grade) => (
                                                <option key={grade} value={grade}>
                                                  {grade}
                                                </option>
                                              ))}
                                            </select>
                                            <div className="grade-edit-buttons">
                                              <button
                                                className="action-edit-save-btn"
                                                onClick={() => handleUpdateGrade(course._id)}
                                                disabled={!newGrade}
                                              >
                                                Save
                                              </button>
                                              <button
                                                className="action-edit-cancel-btn"
                                                onClick={() => setEditGrade(null)}
                                              >
                                                Cancel
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <span className={`grade-display ${course.grade === 'Pending' ? 'pending-grade' : ''}`}>
                                            {course.grade || "Pending"}
                                          </span>
                                        )}
                                      </td>
                                      <td className="course-attempts">{course.attempts || "0"}</td>
                                      <td className="course-eligibility">{course.eligibilityLeft || "0"}</td>
                                      <td className="course-actions">
                                        {editGrade === course._id ? null : (
                                          <>
                                            <button
                                              className="action-btn-edit"
                                              onClick={() => {
                                                setEditGrade(course._id);
                                                setNewGrade(course.grade || "");
                                              }}
                                            >
                                              Edit
                                            </button>
                                            <button
                                              onClick={() => openDeleteModal(course._id)}
                                              className="action-btn-delete"
                                            >
                                              Delete
                                            </button>
                                            {course.courseType === "compulsory" ? (
                                              <button
                                                className="action-btn-set-elective"
                                                onClick={() => handleUpdateCourseType(course._id, "elective")}
                                              >
                                                Set Elective
                                              </button>
                                            ) : (
                                              <button
                                                className="action-btn-set-compulsory"
                                                onClick={() => handleUpdateCourseType(course._id, "compulsory")}
                                              >
                                                Set Compulsory
                                              </button>
                                            )}
                                          </>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )
                      );
                    })}
                  </div>
                </div>
              )
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this course? This action cannot be undone.</p>
            <div className="modal-buttons">
              <button
                className="confirm-btn"
                onClick={() => handleDeleteCourse(courseToDelete)}
              >
                Delete
              </button>
              <button className="cancel-btn" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyGrades;