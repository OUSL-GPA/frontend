import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./MyGrades.css";
import { IoReturnUpBack } from "react-icons/io5";

const MyGrades = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const [editGrade, setEditGrade] = useState(null);
  const [newGrade, setNewGrade] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const navigate = useNavigate();

  const gradeOptions = [
    "A+",
    "A",
    "A-",
    "B+",
    "B",
    "B-",
    "C+",
    "C",
    "C-",
    "D+",
    "D",
    "D-",
    "F",
  ];

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`/api/courses/${user.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCourses(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error);
      setCourses([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user.id]);

  const handleDeleteCourse = async (courseId) => {
    if (!courseId) return;
    try {
      await axios.delete(`/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      // Filter out the deleted course instead of refetching
      setCourses(courses.filter((course) => course._id !== courseId));
      setIsModalOpen(false); // Close the modal after delete
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
          course._id === courseId ? { ...course, grade: newGrade } : course
        )
      );
      setEditGrade(null);
      setNewGrade("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update grade");
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const safeCourses = Array.isArray(courses) ? courses : [];

  return (
    <div className="my-courses-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <IoReturnUpBack />
      </button>
      <h1>My Courses</h1>

      {safeCourses.length === 0 ? (
        <p>No courses found. Add some courses to see them here.</p>
      ) : (
        <div className="courses-by-level">
          {[3, 4, 5, 6].map((level) => {
            const levelCourses = safeCourses.filter(
              (course) => course.level === level
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
                              {type.charAt(0).toUpperCase() + type.slice(1)}{" "}
                              Courses
                            </h3>
                            <table>
                              <thead>
                                <tr>
                                  <th>Course Code</th>
                                  <th>Course Name</th>
                                  <th>Credits</th>
                                  <th>Grade</th>
                                  <th>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {typeCourses.map((course) => (
                                  <tr key={course._id}>
                                    <td>{course.courseCode}</td>
                                    <td>{course.courseName}</td>
                                    <td>{course.credits || "N/A"}</td>
                                    <td>
                                      {editGrade === course._id ? (
                                        <>
                                          <select
                                            value={newGrade}
                                            onChange={(e) =>
                                              setNewGrade(e.target.value)
                                            }
                                          >
                                            <option value="">Select Grade</option>
                                            {gradeOptions.map((grade) => (
                                              <option key={grade} value={grade}>
                                                {grade}
                                              </option>
                                            ))}
                                          </select>
                                          <button
                                            className="action-edit-save-btn"
                                            onClick={() =>
                                              handleUpdateGrade(course._id)
                                            }
                                          >
                                            Save
                                          </button>
                                          <button
                                            className="action-edit-cancel-btn"
                                            onClick={() => setEditGrade(null)}
                                          >
                                            Cancel
                                          </button>
                                        </>
                                      ) : (
                                        <span>{course.grade || "N/A"} </span>
                                      )}
                                    </td>
                                    <td>
                                      {editGrade === course._id ? null : (
                                        <button
                                          className="action-btn-edit"
                                          onClick={() => {
                                            setEditGrade(course._id);
                                            setNewGrade(course.grade || "");
                                          }}
                                        >
                                          Edit
                                        </button>
                                      )}
                                      <button
                                        onClick={() => openDeleteModal(course._id)}
                                        className="action-btn-delete"
                                      >
                                        Delete
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
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

      {/* Delete Confirmation Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete Course</h3>
            <p>Are you sure you want to delete this course?</p>
            <div className="modal-buttons">
              <button
                className="confirm-btn"
                onClick={() => handleDeleteCourse(courseToDelete)}
              >
                Delete
              </button>
              <button className="cancel-btn" onClick={closeModal}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyGrades;
