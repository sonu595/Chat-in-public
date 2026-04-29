import { useState } from 'react';
import AuthCard from '../components/AuthCard';
import InputField from '../components/InputField';
import { authApi } from '../lib/api';

const Login = ({ onNavigateToSignup, onLoginSuccess, notice }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      const res = await authApi.login({
        email: formData.email,
        password: formData.password
      });

      onLoginSuccess?.(res.token);

    } catch (err) {
      console.error(err);

      if (err.response) {
        setErrors({
          general: err.response.data.message || "Invalid credentials"
        });
      } else {
        setErrors({
          general: "Server error"
        });
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Login" showLogo>
      <form onSubmit={handleSubmit}>

        {notice && (
          <p style={{ color: '#5f564c', marginBottom: '10px', fontSize: '13px' }}>
            {notice}
          </p>
        )}

        {errors.general && (
          <p style={{ color: 'red', marginBottom: '10px' }}>
            {errors.general}
          </p>
        )}

        <InputField
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />

        <InputField
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            background: '#111',
            color: '#fff',
            padding: '15px',
            cursor: 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          fontSize: '13px',
          color: '#aaa',
        }}>
          Don't have an account?{' '}
          <a
            href="#"
            onClick={e => { e.preventDefault(); onNavigateToSignup?.(); }}
            style={{ color: '#111', textDecoration: 'none', fontWeight: 500 }}
          >
            Sign Up
          </a>
        </div>

      </form>
    </AuthCard>
  );
};

export default Login;
