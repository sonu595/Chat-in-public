import { useState } from 'react';
import AuthCard from '../components/AuthCard';
import InputField from '../components/InputField';
import { authApi } from '../lib/api';

const VerifyOtp = ({ signupData, onNavigateToLogin, onRegistrationSuccess }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const email = signupData?.email || '';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!signupData) {
      setError("Signup session missing. Please sign up again.");
      return;
    }

    if (!otp) {
      setError("OTP is required");
      return;
    }

    try {
      setLoading(true);

      await authApi.verifyOtp(email, otp);

      await authApi.register({
        name: signupData.name,
        email: signupData.email,
        password: signupData.password
      });

      onRegistrationSuccess?.();

    } catch (err) {
      console.error(err);

      if (err.response) {
        setError(err.response.data.message || "OTP verification failed");
      } else {
        setError("Server error");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Verify OTP" showBack onBack={onNavigateToLogin}>
      <form onSubmit={handleSubmit}>

        <p style={{
          fontSize: '13px',
          color: '#888',
          marginBottom: '10px'
        }}>
          OTP sent to {email || 'your email'}
        </p>

        <InputField
          label="Enter OTP"
          name="otp"
          value={otp}
          onChange={(e) => {
            setOtp(e.target.value);
            setError('');
          }}
          error={error}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            background: '#111',
            color: '#fff',
            borderRadius: '10px',
            padding: '15px',
            cursor: 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

      </form>
    </AuthCard>
  );
};

export default VerifyOtp;
