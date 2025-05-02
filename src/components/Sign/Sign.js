import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Sign.css';
import OUSLCard from '../OUSLCard';
import { AuthContext } from '../../context/AuthContext';

const Sign = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: ''
  });
  const [error, setError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const { dispatch } = useContext(AuthContext);

  const handleChange = (e) => {
    // Automatically add 'S' prefix for student ID if it's not there
    if (e.target.name === 'studentId') {
      let value = e.target.value.replace(/[^0-9]/g, '');
      if (value && !value.startsWith('S')) {
        value = `S${value}`;
      }
      setFormData({ ...formData, [e.target.name]: value });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const validateForm = () => {
    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && !validateForm()) {
      return;
    }

    try {
      dispatch({ type: "LOGIN_START" });

      if (isLogin) {
        const response = await axios.post('/api/auth/login', {
          email: formData.email,
          password: formData.password
        });
        
        // Check if user is verified
        if (!response.data.user.isVerified) {
          throw new Error('Please verify your email first. Check your inbox or spam.');
        }
        
        dispatch({ type: "LOGIN_SUCCESS", payload: response.data.user });
        localStorage.setItem('studentToken', response.data.token);
        
        toast.success('Login successful! Redirecting...', {
          position: "top-right",
          autoClose: 2000,
        });

        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        // Registration flow
        await axios.post('/api/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          studentId: formData.studentId
        });
        
        toast.success('Verification email sent! Please check your email to complete registration.', {
          position: "top-right",
          autoClose: 5000,
        });
        
        // Clear form and switch to login view
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          studentId: ''
        });
        setIsLogin(true);
      }
    } catch (err) {
      dispatch({ type: "LOGIN_FAILURE", payload: err.response?.data?.message || err.message || 'Something went wrong' });
      setError(err.response?.data?.message || err.message || 'Something went wrong');
      toast.error(err.response?.data?.message || err.message || 'Something went wrong', {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const toggleForm = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setIsLogin(!isLogin);
      setError('');
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  return (
    <div className="sign-container">
      <ToastContainer />
      <OUSLCard className="signin-card" />
      
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
                <>
                  <motion.div
                    className="form-group"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </motion.div>

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
                      value={formData.studentId}
                      onChange={handleChange}
                      placeholder='Numbers only'
                      required
                      pattern="S\d+"
                      title="Student ID must start with 'S' followed by numbers"
                    />
                  </motion.div>
                </>
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

              {!isLogin && (
                <>
                  <motion.div
                    className="form-group"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </motion.div>
                </>
              )}

              <motion.button
                type="submit"
                className="submit-btn"
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.02 }}
                transition={{ delay: isLogin ? 0.3 : 0.6 }}
              >
                {isLogin ? 'Sign In' : 'Sign Up'}
              </motion.button>
            </form>

            {isLogin && (
              <motion.div
                className="forgot-password"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {/* <button 
                  type="button" 
                  disabled
                  className="text-link"
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot Password?
                </button> */}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Sign;