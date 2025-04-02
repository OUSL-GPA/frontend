import React from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
// import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard/Dashboard";
import Sign from "./components/Sign/Sign";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./components/Profile/Profile";
import GPAPage from './components/GPAPage/GPAPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div className="App">
      {/* <Navbar /> */}
      <Routes>
        <Route path="/sign" element={<Sign />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
        <Route path="/" element={<Sign />} />
        <Route path="/profile" element={<Profile />} />
        <Route 
          path="/gpa/:userId" 
          element={
            <ProtectedRoute>
              <GPAPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
      <ToastContainer />
    </div>
  );
}

export default App;
