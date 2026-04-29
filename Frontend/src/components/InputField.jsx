import { useState } from 'react';

const InputField = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  name,
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{
        display: 'block',
        fontSize: '11px',
        fontWeight: 500,
        color: error ? '#e24b4a' : '#aaa',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        marginBottom: '6px',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {label}
      </label>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        borderBottom: `1.5px solid ${error ? '#e24b4a' : focused ? '#111' : '#e0ddd8'}`,
        paddingBottom: '8px',
        transition: 'border-color 0.2s',
      }}>
        <input
          type={inputType}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            border: 'none',
            background: 'transparent',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
            color: '#1a1a1a',
            outline: 'none',
            width: '100%',
            fontWeight: 400,
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              color: '#bbb',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {showPassword ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}
      </div>

      {error && (
        <p style={{
          color: '#e24b4a',
          fontSize: '11px',
          marginTop: '4px',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;
