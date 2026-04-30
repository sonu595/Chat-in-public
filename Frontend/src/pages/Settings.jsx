const Settings = ({
  theme,
  currentThemeKey,
  themeOptions,
  onThemeChange,
  onNavigateToDashboard,
  onNavigateToChangePassword,
}) => {
  return (
    <div className="settings-page" style={{
      minHeight: '100vh',
      background: theme.pageBackground,
      fontFamily: "'DM Sans', sans-serif",
      color: theme.text,
    }}>
      <div className="settings-header" style={{
        background: theme.surface,
        borderBottom: `1px solid ${theme.border}`,
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
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
          Back to Chat
        </button>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '22px',
          fontWeight: 400,
          margin: 0,
        }}>
          Settings
        </h1>
        <div className="settings-header-spacer" style={{ width: '110px' }} />
      </div>

      <div className="settings-content" style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '32px 24px 40px',
        display: 'grid',
        gap: '24px',
      }}>
        <section style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '24px',
          padding: '24px',
          boxShadow: `0 16px 40px ${theme.shadow}`,
        }}>
          <h2 style={{
            margin: '0 0 8px',
            fontFamily: "'Playfair Display', serif",
            fontSize: '24px',
            fontWeight: 400,
          }}>
            Theme
          </h2>
          <p style={{
            margin: '0 0 20px',
            fontSize: '14px',
            color: theme.muted,
          }}>
            Choose one of the 3 UI colors for your chat app.
          </p>

          <div className="settings-theme-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
          }}>
            {Object.entries(themeOptions).map(([themeKey, option]) => {
              const isActive = currentThemeKey === themeKey;

              return (
                <button
                  key={themeKey}
                  type="button"
                  onClick={() => onThemeChange(themeKey)}
                  style={{
                    padding: '18px',
                    borderRadius: '20px',
                    border: `2px solid ${isActive ? option.accent : option.border}`,
                    background: option.surface,
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxShadow: isActive ? `0 12px 24px ${option.shadow}` : 'none',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '14px',
                  }}>
                    <span style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: option.accent,
                      display: 'inline-block',
                    }} />
                    <span style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: option.subtle,
                      display: 'inline-block',
                      border: `1px solid ${option.border}`,
                    }} />
                    <span style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: option.pageBackground,
                      display: 'inline-block',
                      border: `1px solid ${option.border}`,
                    }} />
                  </div>
                  <p style={{
                    margin: '0 0 6px',
                    fontWeight: 600,
                    fontSize: '15px',
                    color: option.text,
                  }}>
                    {option.label}
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: '12px',
                    color: option.muted,
                  }}>
                    {isActive ? 'Currently active' : 'Tap to apply'}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '24px',
          padding: '24px',
          boxShadow: `0 16px 40px ${theme.shadow}`,
        }}>
          <h2 style={{
            margin: '0 0 8px',
            fontFamily: "'Playfair Display', serif",
            fontSize: '24px',
            fontWeight: 400,
          }}>
            Security
          </h2>
          <p style={{
            margin: '0 0 18px',
            fontSize: '14px',
            color: theme.muted,
          }}>
            Password change option ab settings page ke andar hai.
          </p>

          <button
            type="button"
            onClick={onNavigateToChangePassword}
            style={{
              background: theme.accent,
              color: theme.accentText,
              border: 'none',
              borderRadius: '16px',
              padding: '14px 18px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Change Password
          </button>
        </section>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .settings-header {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 12px;
            padding: 16px !important;
          }
          .settings-header-spacer {
            display: none;
          }
          .settings-content {
            padding: 20px 16px 28px !important;
          }
          .settings-theme-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Settings;
