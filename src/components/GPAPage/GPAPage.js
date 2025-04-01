import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './GPAPage.css';

const GPAPage = () => {
  const [courses, setCourses] = useState([]);
  const [gpa, setGpa] = useState(0);
  const [lastCalculated, setLastCalculated] = useState(null);
  const [calculatedCourses, setCalculatedCourses] = useState([]);
  const [activeLevel, setActiveLevel] = useState(4);
  const [activeType, setActiveType] = useState('compulsory');
  const navigate = useNavigate();

  // Form state for new course
  const [newCourse, setNewCourse] = useState({
    courseCode: '',
    courseName: '',
    grade: 'A',
    courseType: 'compulsory'
  });

  // Fetch courses and current GPA on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, gpaRes] = await Promise.all([
          axios.get('/api/courses', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }),
          axios.get('/api/courses/current', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
        ]);

        setCourses(coursesRes.data);
        setGpa(gpaRes.data.gpa || 0);
        setCalculatedCourses(gpaRes.data.calculatedCourses || []);
        setLastCalculated(gpaRes.data.lastCalculated || null);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchData();
  }, [navigate]);

  // Handle input changes for new course
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourse(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add a new course
  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/courses', {
        ...newCourse,
        level: activeLevel,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setCourses([...courses, response.data]);
      setNewCourse({
        courseCode: '',
        courseName: '',
        grade: 'A',
        courseType: activeType
      });
    } catch (error) {
      console.error('Error adding course:', error);
      alert(error.response?.data?.error || 'Failed to add course');
    }
  };

  // Calculate GPA
  const handleCalculateGPA = async () => {
    try {
      const response = await axios.post('/api/courses/calculate', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setGpa(response.data.gpa);
      setLastCalculated(response.data.lastCalculated);
      // You might want to refetch courses to update the calculated status
    } catch (error) {
      console.error('Error calculating GPA:', error);
      alert('Failed to calculate GPA');
    }
  };

  // Filter courses by level and type
  const filteredCourses = courses.filter(course => 
    course.level === activeLevel && course.courseType === activeType
  );

  return (
    <div className="gpa-container">
      <h1>GPA Calculator</h1>
      
      <div className="gpa-display">
        <h2>Current GPA: {gpa}</h2>
        {lastCalculated && (
          <p>Last calculated: {new Date(lastCalculated).toLocaleString()}</p>
        )}
      </div>

      <div className="level-tabs">
        {[4, 5, 6].map(level => (
          <button
            key={level}
            className={`level-tab ${activeLevel === level ? 'active' : ''}`}
            onClick={() => setActiveLevel(level)}
          >
            Level {level}
          </button>
        ))}
      </div>

      <div className="course-type-tabs">
        {['compulsory', 'elective'].map(type => (
          <button
            key={type}
            className={`type-tab ${activeType === type ? 'active' : ''}`}
            onClick={() => setActiveType(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <div className="course-form">
        <h3>Add New Course (Level {activeLevel} - {activeType})</h3>
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
            </select>
          </div>
          <input type="hidden" name="courseType" value={activeType} />
          <button type="submit" className="add-btn">Add Course</button>
        </form>
      </div>

      <div className="courses-list">
        <h3>Courses (Level {activeLevel} - {activeType})</h3>
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
                <th>Included in GPA</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map(course => (
                <tr key={course._id}>
                  <td>{course.courseCode}</td>
                  <td>{course.courseName}</td>
                  <td>{course.credits}</td>
                  <td>{course.grade}</td>
                  <td>
                    {calculatedCourses.some(c => c._id === course._id) ? 'Yes' : 'No'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="calculate-section">
        <button onClick={handleCalculateGPA} className="calculate-btn">
          Calculate GPA
        </button>
      </div>
    </div>
  );
};

export default GPAPage;