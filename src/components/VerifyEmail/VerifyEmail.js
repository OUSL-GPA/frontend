import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../../context/AuthContext';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();
    const { dispatch } = useContext(AuthContext);

    useEffect(() => {
        const verifyToken = async () => {
            const token = searchParams.get('token');
            
            if (!token) {
                toast.error('No verification token provided');
                setIsLoading(false);
                navigate('/sign');
                return;
            }

            try {
                const response = await axios.post(`/api/auth/verifyEmail?token=${token}`);
                
                // If verification is successful
                dispatch({ type: "LOGIN_SUCCESS", payload: response.data.user });
                localStorage.setItem('studentToken', response.data.token);
                
                setIsSuccess(true);
                toast.success('Email verified successfully! Redirecting...', {
                    position: "top-right",
                    autoClose: 2000,
                });

                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
            } catch (err) {
                toast.error(err.response?.data?.message || 'Verification failed', {
                    position: "top-right",
                    autoClose: 5000,
                });
                console.log(err);
                navigate('/sign');
            } finally {
                setIsLoading(false);
            }
        };

        verifyToken();
    }, [searchParams, navigate, dispatch]);

    return (
        <div className="verify-email-container">
            {isLoading ? (
                <div className="loading-spinner">Verifying your email...</div>
            ) : isSuccess ? (
                <div className="success-message">
                    <h2>Email Verified Successfully!</h2>
                    <p>You will be redirected shortly.</p>
                </div>
            ) : (
                <div className="error-message">
                    <h2>Verification Failed</h2>
                    <p>Please try registering again.</p>
                </div>
            )}
        </div>
    );
};

export default VerifyEmail;