import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import "./MyGrades.css";

const MyGrades = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

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
    if (!window.confirm("Are you sure you want to delete this course?")) {
      return;
    }

    try {
      await axios.delete(`/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      // Filter out the deleted course instead of refetching
      setCourses(courses.filter(course => course._id !== courseId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete course");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const safeCourses = Array.isArray(courses) ? courses : [];

  return (
    <div className="my-courses-container">
      <h1>My Courses</h1>
      
      {safeCourses.length === 0 ? (
        <p>No courses found. Add some courses to see them here.</p>
      ) : (
        <div className="courses-by-level">
          {[4, 5, 6].map((level) => {
            const levelCourses = safeCourses.filter(course => course.level === level);
            
            return levelCourses.length > 0 && (
              <div key={level} className="level-section">
                <h2>Level {level}</h2>
                
                <div className="course-type-section">
                  {["compulsory", "elective"].map((type) => {
                    const typeCourses = levelCourses.filter(course => course.courseType === type);
                    
                    return typeCourses.length > 0 && (
                      <div key={type} className="course-type-group">
                        <h3>{type.charAt(0).toUpperCase() + type.slice(1)} Courses</h3>
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
                                <td>{course.credits || 'N/A'}</td>
                                <td>{course.grade || 'N/A'}</td>
                                <td>
                                  <button 
                                    onClick={() => handleDeleteCourse(course._id)}
                                    className="delete-btn"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyGrades;