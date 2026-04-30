// pages/ChangePassword.jsx
import { useState } from 'react';
import { profileApi } from '../lib/api';

const defaultTheme = {
  pageBackground: '#f5f3ef',
  surface: '#ffffff',
  subtle: '#faf7f2',
  border: '#e8e0d6',
  accent: '#111111',
  accentText: '#ffffff',
  muted: '#8d8479',
  text: '#111111',
};

const ChangePassword = ({ theme = defaultTheme, onNavigateToDashboard, onSuccess }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setMessage({ text: '', type: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
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
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await profileApi.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      
      setMessage({ text: 'Password changed successfully!', type: 'success' });
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      setTimeout(() => {
        onSuccess?.();
        onNavigateToDashboard?.();
      }, 1500);
    } catch (err) {
      console.error(err);
      setMessage({ 
        text: err.response?.data?.message || 'Failed to change password', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-page" style={{
      minHeight: '100vh',
      background: theme.pageBackground,
      fontFamily: "'DM Sans', sans-serif",
      color: theme.text,
    }}>
      {/* Header */}
      <div className="change-password-header" style={{
        background: theme.surface,
        borderBottom: `1px solid ${theme.border}`,
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
      }}>
        <button
          onClick={onNavigateToDashboard}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: theme.text,
            fontSize: '14px',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back
        </button>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '20px',
          fontWeight: 400,
          margin: '0 auto',
          color: theme.text,
        }}>
          Change Password
        </h1>
        <div style={{ width: '70px' }} />
      </div>

      {/* Form */}
      <div className="change-password-content" style={{
        maxWidth: '400px',
        margin: '60px auto',
        padding: '0 24px',
      }}>
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

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 500,
              color: theme.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              marginBottom: '6px',
            }}>
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${errors.currentPassword ? '#c62828' : theme.border}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: "'DM Sans', sans-serif",
                outline: 'none',
                background: theme.surface,
                color: theme.text,
              }}
            />
            {errors.currentPassword && (
              <p style={{ color: '#c62828', fontSize: '11px', marginTop: '4px' }}>
                {errors.currentPassword}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 500,
              color: theme.muted,
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
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${errors.newPassword ? '#c62828' : theme.border}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: "'DM Sans', sans-serif",
                outline: 'none',
                background: theme.surface,
                color: theme.text,
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
              color: theme.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              marginBottom: '6px',
            }}>
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${errors.confirmPassword ? '#c62828' : theme.border}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: "'DM Sans', sans-serif",
                outline: 'none',
                background: theme.surface,
                color: theme.text,
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
              background: theme.accent,
              color: theme.accentText,
              padding: '14px',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .change-password-header {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 12px;
            padding: 16px !important;
          }
          .change-password-content {
            margin: 28px auto !important;
            padding: 0 16px 24px !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ChangePassword;
