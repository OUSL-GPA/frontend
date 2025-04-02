import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaArrowLeft } from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    img: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profilePicture, setProfilePicture] = useState('');
  const [imageLoading, setImageLoading] = useState(false);

  // Cloudinary configuration
  const CLOUD_NAME = 'djsqx9cyy'; // REPLACE THIS
  const UPLOAD_PRESET = 'upload'; // REPLACE THIS

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('studentToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setUserData(response.data.data);
          setProfilePicture(response.data.data.profilePicture || '/default-profile.png');
          setFormData({
            name: response.data.data.name,
            email: response.data.data.email,
            studentId: response.data.data.studentId
          });
        } else {
          throw new Error(response.data.message || 'Failed to fetch profile data');
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch profile data');
        toast.error(err.response?.data?.message || err.message || 'Failed to fetch profile data');
        
        if (err.response?.status === 401) {
          localStorage.removeItem('studentToken');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePicture') {
      setFormData({...formData, img: files[0]});
      if (files[0]) {
        setProfilePicture(URL.createObjectURL(files[0]));
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('studentToken');
      
      // First upload the image if it exists
      let imageUrl = userData?.profilePicture;
      if (formData.img) {
        setImageLoading(true);
        
        const imageFormData = new FormData();
        imageFormData.append('file', formData.img);
        imageFormData.append('upload_preset', UPLOAD_PRESET);
        
        try {
          const uploadRes = await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            imageFormData

            
          );
          console.log(uploadRes.data.url);

          imageUrl = uploadRes.data.url;

        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          toast.error('Failed to upload profile picture. Please try again.');
          setImageLoading(false);
          return;
        } finally {
          setImageLoading(false);
        }
      }

      // Then update the user data
      const updatedData = {
        name: formData.name,
        email: formData.email,
        studentId: formData.studentId,
        profilePicture: imageUrl
      };

      const response = await axios.put('/api/auth/update', updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setUserData(response.data.data);
        setProfilePicture(response.data.data.profilePicture || '/default-profile.png');
        toast.success('Profile updated successfully!');
        setEditMode(false);
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update profile');
      toast.error(err.response?.data?.message || err.message || 'Failed to update profile');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button className="back-button" onClick={handleBack}>
          <FaArrowLeft className="back-icon" /> Back
        </button>
        <h1>{formData.name}'s Profile</h1>
        {!editMode && (
          <button 
            className="edit-btn"
            onClick={() => setEditMode(true)}
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="profile-content">
        <div className="profile-picture-section">
          <img 
            src={profilePicture} 
            alt="Profile" 
            className="profile-picture" 
          />
          {editMode && (
            <>
              <label htmlFor="profilePictureUpload" className="upload-btn">
                {imageLoading ? 'Uploading...' : 'Change Profile Picture'}
              </label>
              <input 
                type="file" 
                id="profilePictureUpload" 
                name="profilePicture"
                accept="image/*" 
                onChange={handleInputChange} 
                style={{ display: 'none' }} 
                disabled={imageLoading}
              />
            </>
          )}
        </div>

        {editMode ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={imageLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={imageLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="studentId">Student ID</label>
              <input
                type="text"
                id="studentId"
                name="studentId"
                value={formData.studentId}
                disabled
                required
              />
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="save-btn"
                disabled={imageLoading}
              >
                {imageLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => {
                  setEditMode(false);
                  setFormData({
                    name: userData.name,
                    email: userData.email,
                    studentId: userData.studentId
                  });
                  setProfilePicture(userData.profilePicture || '/default-profile.png');
                }}
                disabled={imageLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <div className="info-item">
              <span className="info-label">Name:</span>
              <span className="info-value">{userData?.name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{userData?.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Student ID:</span>
              <span className="info-value">{userData?.studentId}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Member Since:</span>
              <span className="info-value">
                {new Date(userData?.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;