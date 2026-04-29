const AuthCard = ({ children, title, subtitle, showLogo = false, showBack = false, onBack }) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#e8e6e1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Playfair+Display:wght@400;500&display=swap" rel="stylesheet" />

      <div style={{
        width: '100%',
        maxWidth: '380px',
        borderRadius: '32px',
        overflow: 'hidden',
        boxShadow: '0 28px 64px rgba(0,0,0,0.20), 0 4px 16px rgba(0,0,0,0.08)',
      }}>
        {/* Dark Header */}
        <div style={{
          background: '#111111',
          height: showLogo ? '200px' : '160px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Geometric Pattern */}
          <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.18 }}
            viewBox="0 0 380 200"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
          >
            <circle cx="30" cy="30" r="45" fill="white" opacity="0.5" />
            <rect x="70" y="5" width="55" height="55" rx="8" fill="white" opacity="0.3" transform="rotate(15 97 32)" />
            <polygon points="220,0 290,0 255,60" fill="white" opacity="0.35" />
            <rect x="300" y="20" width="50" height="50" rx="6" fill="white" opacity="0.25" transform="rotate(-10 325 45)" />
            <circle cx="360" cy="30" r="55" fill="white" opacity="0.2" />
            <circle cx="340" cy="170" r="65" fill="white" opacity="0.25" />
            <rect x="0" y="130" width="70" height="70" rx="10" fill="white" opacity="0.2" transform="rotate(-8 35 165)" />
            <polygon points="130,150 185,135 165,195 110,200" fill="white" opacity="0.3" />
            <circle cx="210" cy="185" r="30" fill="white" opacity="0.2" />
            <rect x="170" y="50" width="40" height="40" rx="5" fill="white" opacity="0.15" transform="rotate(25 190 70)" />
          </svg>

          {/* Back button */}
          {showBack && (
            <button
              onClick={onBack}
              style={{
                position: 'absolute',
                top: '18px',
                left: '18px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </button>
          )}

          {/* Title in header (signup style) or Logo (login style) */}
          {showBack && title && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#fff',
              fontFamily: "'Playfair Display', serif",
              fontSize: '24px',
              fontWeight: 400,
              letterSpacing: '0.3px',
              whiteSpace: 'nowrap',
            }}>
              {title}
            </div>
          )}

          {showLogo && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: '#fff',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect x="4" y="4" width="24" height="24" rx="6" fill="#111" />
                  <rect x="9" y="9" width="14" height="14" rx="4" fill="white" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* White Body — overlaps header with big top-left curve */}
        <div style={{
          background: '#ffffff',
          borderTopLeftRadius: '36px',
          borderTopRightRadius: '0px',
          marginTop: '-36px',
          padding: '36px 32px 32px',
          position: 'relative',
          zIndex: 2,
        }}>
          {/* Title for login (shown inside body) */}
          {!showBack && title && (
            <>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '28px',
                fontWeight: 400,
                color: '#111',
                marginBottom: subtitle ? '6px' : '24px',
                letterSpacing: '-0.3px',
              }}>
                {title}
              </h2>
              {subtitle && (
                <p style={{
                  fontSize: '13px',
                  color: '#aaa',
                  marginBottom: '28px',
                  fontWeight: 300,
                }}>
                  {subtitle}
                </p>
              )}
            </>
          )}

          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthCard;
