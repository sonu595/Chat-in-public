// pages/ResetPassword.jsx
import { useState, useEffect } from 'react';
import { profileApi } from '../lib/api';

const ResetPassword = ({ onNavigateToLogin }) => {
  const [token, setToken] = useState('');
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setMessage({ text: 'Invalid reset link. No token provided.', type: 'error' });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setMessage({ text: '', type: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setMessage({ text: 'Invalid reset link. Token missing.', type: 'error' });
      return;
    }

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await profileApi.resetPassword(token, formData.newPassword);
      setIsSuccess(true);
      setMessage({ text: 'Password reset successfully!', type: 'success' });
      
      setTimeout(() => {
        onNavigateToLogin?.();
      }, 2000);
    } catch (err) {
      console.error(err);
      setMessage({ 
        text: err.response?.data?.message || 'Failed to reset password. Link may be expired.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f3ef',
      fontFamily: "'DM Sans', sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        background: '#fff',
        borderRadius: '24px',
        padding: '40px 32px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      }}>
        {/* Title */}
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '24px',
          fontWeight: 400,
          color: '#111',
          marginBottom: '8px',
        }}>
          {isSuccess ? 'Password Reset!' : 'Reset Password'}
        </h1>
        <p style={{
          fontSize: '13px',
          color: '#aaa',
          marginBottom: '32px',
        }}>
          {isSuccess 
            ? 'Your password has been changed successfully.' 
            : 'Enter your new password below.'}
        </p>

        {/* Message */}
        {message.text && (
          <div style={{
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '24px',
            background: message.type === 'success' ? '#e8f5e9' : '#ffebee',
            color: message.type === 'success' ? '#2e7d32' : '#c62828',
            fontSize: '13px',
            textAlign: 'center',
          }}>
            {message.text}
          </div>
        )}

        {!isSuccess && token && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 500,
                color: '#aaa',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                marginBottom: '6px',
              }}>
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${errors.newPassword ? '#c62828' : '#e8e6e1'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: "'DM Sans', sans-serif",
                  outline: 'none',
                }}
              />
              {errors.newPassword && (
                <p style={{ color: '#c62828', fontSize: '11px', marginTop: '4px' }}>
                  {errors.newPassword}
                </p>
              )}
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 500,
                color: '#aaa',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                marginBottom: '6px',
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${errors.confirmPassword ? '#c62828' : '#e8e6e1'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: "'DM Sans', sans-serif",
                  outline: 'none',
                }}
              />
              {errors.confirmPassword && (
                <p style={{ color: '#c62828', fontSize: '11px', marginTop: '4px' }}>
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: '#111',
                color: '#fff',
                padding: '14px',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {isSuccess && (
          <button
            onClick={onNavigateToLogin}
            style={{
              width: '100%',
              background: '#111',
              color: '#fff',
              padding: '14px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Go to Login
          </button>
        )}

        {!token && !isSuccess && (
          <button
            onClick={onNavigateToLogin}
            style={{
              width: '100%',
              background: '#111',
              color: '#fff',
              padding: '14px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;