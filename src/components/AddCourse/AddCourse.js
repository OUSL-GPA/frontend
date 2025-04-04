import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AddCourse.css";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoReturnUpBack } from "react-icons/io5";

const AddCourse = () => {
  const [courses, setCourses] = useState([]);
  const [activeLevel, setActiveLevel] = useState(3);
  const [activeType, setActiveType] = useState("compulsory");
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const userId = user.id;

  // Form state for new course
  const [newCourse, setNewCourse] = useState({
    courseCode: "",
    courseName: "",
    grade: "A",
    courseType: activeType,
  });

  // Handle input changes for new course
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourse((prev) => ({
      ...prev,
      [name]: value,
      courseType: activeType, // Ensure courseType is always set to the active type
      level: activeLevel, // Ensure level is always set to the active level
    }));
  };

  // Add a new course
  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `/api/courses/${userId}`,
        {
          ...newCourse,
          courseType: activeType,
          level: activeLevel,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setCourses([...courses, response.data]);
      setNewCourse({
        courseCode: "",
        courseName: "",
        grade: "A",
        courseType: activeType,
      });
      toast.success("Successfully course added", {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setActiveLevel(3); // Reset to default level
      setActiveType("compulsory"); // Reset to default type
    } catch (error) {
      console.error("Error adding course:", error);
      toast.error(error.response?.data?.error || "Failed to add course", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setActiveLevel(3); // Reset to default level
      setActiveType("compulsory"); // Reset to default type
    }
  };

 
  // Filter courses by level and type
  const filteredCourses = courses.filter(
    (course) => course.level === activeLevel && course.courseType === activeType
  );

  return (
    <div className="course-container">
       <button className="back-btn" onClick={() => navigate(-1)}><IoReturnUpBack/></button>
      <h1>Add Course & Grades</h1>
     

      <div className="level-tabs">
        {[3, 4, 5, 6].map((level) => (
          <button
            key={level}
            className={`level-tab ${activeLevel === level ? "active" : ""}`}
            onClick={() => setActiveLevel(level)}
          >
            Level {level}
          </button>
        ))}
      </div>

      <div className="course-type-tabs">
        {["compulsory", "elective"].map((type) => (
          <button
            key={type}
            className={`type-tab ${activeType === type ? "active" : ""}`}
            onClick={() => setActiveType(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <div className="course-form">
        <h3>
          Add New Course (Level {activeLevel} - {activeType})
          <span> imporant!</span>
        </h3>
        <form onSubmit={handleAddCourse}>
          <div className="form-group">
            <label>Course Code:</label>
            <input
              type="text"
              name="courseCode"
              value={newCourse.courseCode}
              onChange={handleInputChange}
              placeholder="e.g., EEX4375"
              required
              pattern="[A-Za-z]{3}\d{4}"
              title="Course code must be 3 letters followed by 4 digits"
            />
          </div>
          <div className="form-group">
            <label>Course Name:</label>
            <input
              type="text"
              name="courseName"
              value={newCourse.courseName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Grade:</label>
            <select
              name="grade"
              value={newCourse.grade}
              onChange={handleInputChange}
              required
            >
              <option value="A+">A+</option>
              <option value="A">A</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B">B</option>
              <option value="B-">B-</option>
              <option value="C+">C+</option>
              <option value="C">C</option>
              <option value="C-">C-</option>
              <option value="D+">D+</option>
              <option value="D">D</option>
              <option value="E">E</option>
              <option value="F">F</option>
              <option value="W">Resit</option>
              <option value="I">Repeat</option>
            </select>
          </div>
          <input type="hidden" name="courseType" value={activeType} />
          <button type="submit" className="add-btn">
            Add Course
          </button>
        </form>
      </div>

      <div className="courses-list">
        <h3>
          Courses (Level {activeLevel} - {activeType})
        </h3>
        {filteredCourses.length === 0 ? (
          <p>No courses added yet</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Credits</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course) => (
                <tr key={course._id}>
                  <td>{course.courseCode}</td>
                  <td>{course.courseName}</td>
                  <td>{course.credits}</td>
                  <td>{course.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AddCourse;
