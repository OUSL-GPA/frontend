import React from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
// import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard/Dashboard";
import Sign from "./components/Sign/Sign";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./components/Profile/Profile";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddCourse from "./components/AddCourse/AddCourse";
import MyGrades from "./components/MyGrades/MyGrades";
import Footer from "./components/Footer/Footer";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/sign" element={<Sign />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
        <Route path="/" element={<Sign />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-courses/:userId" element={<MyGrades />} />
        <Route 
          path="/gpa/:userId" 
          element={
            <ProtectedRoute>
              <AddCourse />
            </ProtectedRoute>
          } 
        />
      </Routes>
      
      <ToastContainer />
      <Footer />
    </div>
  );
}

export default App;
