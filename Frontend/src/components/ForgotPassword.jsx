// pages/ForgotPassword.jsx
import { useState } from 'react';
import { profileApi } from '../lib/api';

const ForgotPassword = ({ onNavigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage({ text: 'Email is required', type: 'error' });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setMessage({ text: 'Please enter a valid email', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await profileApi.forgotPassword(email);
      setEmailSent(true);
      setMessage({ 
        text: 'Password reset link sent to your email!', 
        type: 'success' 
      });
    } catch (err) {
      console.error(err);
      setMessage({ 
        text: err.response?.data?.message || 'Failed to send reset link', 
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
        {/* Back Button */}
        <button
          onClick={onNavigateToLogin}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#aaa',
            fontSize: '13px',
            marginBottom: '32px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to Login
        </button>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '28px',
          fontWeight: 400,
          color: '#111',
          marginBottom: '8px',
        }}>
          Forgot Password?
        </h1>
        <p style={{
          fontSize: '13px',
          color: '#aaa',
          marginBottom: '32px',
        }}>
          Enter your email and we'll send you a link to reset your password.
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

        {!emailSent ? (
          <form onSubmit={handleSubmit}>
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
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e8e6e1',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: "'DM Sans', sans-serif",
                  outline: 'none',
                }}
              />
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
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
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

export default ForgotPassword;