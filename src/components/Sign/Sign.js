import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Sign.css';
import OUSLCard from '../OUSLCard';
import { AuthContext } from '../../context/AuthContext'; // Adjust the path as needed

const Sign = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    studentId: ''
  });
  const [error, setError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const { dispatch } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      dispatch({ type: "LOGIN_START" });

      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await axios.post(endpoint, payload);
      
      if (isLogin) {
        dispatch({ type: "LOGIN_SUCCESS", payload: response.data.user });
        localStorage.setItem('studentToken', response.data.token);
        
        toast.success('Login successful! Redirecting...', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        toast.success('Registration successful! Please login.', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        // After registration, switch to login form
        setTimeout(() => {
          setIsLogin(true);
          setFormData({
            name: '',
            email: '',
            password: '',
            studentId: ''
          });
        }, 1000);
      }
      
    } catch (err) {
      dispatch({ type: "LOGIN_FAILURE", payload: err.response?.data?.message || 'Something went wrong' });
      setError(err.response?.data?.message || 'Something went wrong');
      toast.error(err.response?.data?.message || 'Something went wrong', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const toggleForm = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setIsLogin(!isLogin);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  return (
    <div className="sign-container">
      <ToastContainer />
      <OUSLCard />
      <motion.div 
        className="sign-form"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="form-header">
          <motion.button
            className={`toggle-btn ${isLogin ? 'active' : ''}`}
            onClick={toggleForm}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign In
          </motion.button>
          <motion.button
            className={`toggle-btn ${!isLogin ? 'active' : ''}`}
            onClick={toggleForm}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign Up
          </motion.button>
        </div>

        <AnimatePresence mode='wait'>
          <motion.div
            key={isLogin ? 'login' : 'register'}
            initial={{ x: isLogin ? -100 : 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isLogin ? 100 : -100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {error && (
              <motion.div 
                className="error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <motion.div
                  className="form-group"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label>User Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </motion.div>
              )}

              {!isLogin && (
                <motion.div
                  className="form-group"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label>Student ID</label>
                  <input
                    type="text"
                    name="studentId"
                    value={`S${formData.studentId.replace(/[^0-9]/g, '')}`}
                    onChange={handleChange}
                    required
                  />
                </motion.div>
              )}

              <motion.div
                className="form-group"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isLogin ? 0.1 : 0.3 }}
              >
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </motion.div>

              <motion.div
                className="form-group"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isLogin ? 0.2 : 0.4 }}
              >
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
              </motion.div>

              <motion.button
                type="submit"
                className="submit-btn"
                whileTap={{ scale: 0.98 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isLogin ? 0.2 : 0.3 }}
              >
                {isLogin ? 'Sign In' : 'Sign Up'}
              </motion.button>
            </form>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Sign;