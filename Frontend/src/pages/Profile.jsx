// pages/Profile.jsx
import { useState, useEffect } from 'react';
import { profileApi, session } from '../lib/api';

const defaultTheme = {
  pageBackground: '#f5f3ef',
  surface: '#ffffff',
  subtle: '#faf7f2',
  border: '#e8e0d6',
  accent: '#111111',
  accentText: '#ffffff',
  muted: '#8d8479',
  text: '#111111',
  shadow: 'rgba(24, 18, 12, 0.08)',
};

const Profile = ({ theme = defaultTheme, user, onUserUpdated, onNavigateToDashboard }) => {
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    avatarUrl: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchMessage, setSearchMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setMessage({ text: '', type: '' });
  };

  const validateProfileForm = () => {
    const nextErrors = {};
    const trimmedName = formData.name.trim();
    const trimmedBio = formData.bio.trim();

    if (!trimmedName) {
      nextErrors.name = 'Name is required';
    } else if (trimmedName.length < 2) {
      nextErrors.name = 'Name must be at least 2 characters';
    } else if (trimmedName.length > 50) {
      nextErrors.name = 'Name must be less than 50 characters';
    }

    if (trimmedBio.length > 200) {
      nextErrors.bio = 'Bio must be less than 200 characters';
    }

    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateProfileForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    setMessage({ text: '', type: '' });

    try {
      const payload = {
        name: formData.name.trim(),
        bio: formData.bio.trim(),
      };

      const updated = await profileApi.update({
        ...payload,
        avatarUrl: formData.avatarUrl,
      });
      
      onUserUpdated?.(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      setFormData(prev => ({
        ...prev,
        name: updated.name || payload.name,
        bio: updated.bio || '',
        avatarUrl: updated.avatarUrl || '',
      }));
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setMessage({ 
        text: err.response?.data?.message || 'Failed to update profile', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchProfiles = async (e) => {
    e.preventDefault();
    const query = searchName.trim().toLowerCase();

    if (!query) {
      setSearchResults([]);
      setSearchMessage('Enter a name to search');
      return;
    }

    setSearchLoading(true);
    setSearchMessage('');

    try {
      const users = await profileApi.listUsers();
      const filteredUsers = users.filter((profile) =>
        profile.name?.toLowerCase().includes(query)
      );

      setSearchResults(filteredUsers);
      setSearchMessage(
        filteredUsers.length === 0 ? 'No profile found with this name' : ''
      );
    } catch (err) {
      console.error(err);
      setSearchResults([]);
      setSearchMessage('Failed to search profiles');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleLogout = () => {
    session.clear();
    window.location.reload();
  };

  return (
    <div className="profile-page" style={{
      minHeight: '100vh',
      background: theme.pageBackground,
      fontFamily: "'DM Sans', sans-serif",
      color: theme.text,
    }}>
      {/* Header */}
      <div className="profile-header" style={{
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
          fontSize: '20px',
          fontWeight: 400,
          margin: 0,
          color: theme.text,
        }}>
          Profile
        </h1>
        <div style={{ width: '100px' }} />
      </div>

      {/* Main Content */}
      <div className="profile-main" style={{
        maxWidth: '500px',
        margin: '0 auto',
        padding: '32px 24px',
      }}>
        {/* Avatar */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px',
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            background: theme.accent,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: theme.accentText,
            fontSize: '36px',
            fontWeight: 500,
          }}>
            {formData.name?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <p style={{
            fontSize: '13px',
            color: '#aaa',
            margin: 0,
          }}>
            {user?.email}
          </p>
        </div>

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

        {/* Form */}
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
              Name
            </label>
            {isEditing ? (
              <>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${errors.name ? '#c62828' : theme.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: "'DM Sans', sans-serif",
                    outline: 'none',
                    background: theme.surface,
                    color: theme.text,
                  }}
                />
                {errors.name && (
                  <p style={{ color: '#c62828', fontSize: '11px', marginTop: '6px', marginBottom: 0 }}>
                    {errors.name}
                  </p>
                )}
              </>
            ) : (
              <p style={{
                padding: '12px 0',
                fontSize: '14px',
                color: theme.text,
                borderBottom: `1px solid ${theme.border}`,
              }}>
                {user?.name || '-'}
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
              Bio
            </label>
            {isEditing ? (
              <>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Tell something about yourself..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${errors.bio ? '#c62828' : theme.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: "'DM Sans', sans-serif",
                    outline: 'none',
                    resize: 'vertical',
                    background: theme.surface,
                    color: theme.text,
                  }}
                />
                {errors.bio && (
                  <p style={{ color: '#c62828', fontSize: '11px', marginTop: '6px', marginBottom: 0 }}>
                    {errors.bio}
                  </p>
                )}
              </>
            ) : (
              <p style={{
                padding: '12px 0',
                fontSize: '14px',
                color: user?.bio ? theme.text : theme.muted,
                borderBottom: `1px solid ${theme.border}`,
              }}>
                {user?.bio || 'No bio added yet'}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="profile-actions" style={{
            display: 'flex',
            gap: '12px',
            marginTop: '24px',
          }}>
            {isEditing ? (
              <>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    background: theme.accent,
                    color: theme.accentText,
                    padding: '12px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                    fontSize: '14px',
                  }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user?.name || '',
                      bio: user?.bio || '',
                      avatarUrl: user?.avatarUrl || '',
                    });
                    setErrors({});
                    setMessage({ text: '', type: '' });
                  }}
                  style={{
                    flex: 1,
                    background: theme.surface,
                    color: theme.text,
                    padding: '12px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  style={{
                    flex: 1,
                    background: theme.accent,
                    color: theme.accentText,
                    padding: '12px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Edit Profile
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    background: '#fff',
                    color: '#c62828',
                    padding: '12px',
                    border: '1px solid #ffcdd2',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </form>

        <div style={{
          marginTop: '40px',
          paddingTop: '28px',
          borderTop: `1px solid ${theme.border}`,
        }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '22px',
            fontWeight: 400,
            color: theme.text,
            margin: '0 0 8px',
          }}>
            Search Profiles
          </h2>
          <p style={{
            fontSize: '13px',
            color: theme.muted,
            margin: '0 0 18px',
          }}>
            Search other users by name. Profile image UI me show nahi hogi.
          </p>

          <form className="profile-search-form" onSubmit={handleSearchProfiles} style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '18px',
          }}>
            <input
              type="text"
              value={searchName}
              onChange={(e) => {
                setSearchName(e.target.value);
                setSearchMessage('');
              }}
              placeholder="Enter user name"
              style={{
                flex: 1,
                padding: '12px',
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: "'DM Sans', sans-serif",
                outline: 'none',
                background: theme.surface,
                color: theme.text,
              }}
            />
            <button
              type="submit"
              disabled={searchLoading}
              style={{
                background: theme.accent,
                color: theme.accentText,
                padding: '12px 18px',
                border: 'none',
                borderRadius: '8px',
                cursor: searchLoading ? 'not-allowed' : 'pointer',
                opacity: searchLoading ? 0.6 : 1,
                fontSize: '14px',
                whiteSpace: 'nowrap',
              }}
            >
              {searchLoading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {searchMessage && (
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              background: theme.subtle,
              color: theme.muted,
              fontSize: '13px',
            }}>
              {searchMessage}
            </div>
          )}

          {searchResults.length > 0 && (
            <div style={{
              display: 'grid',
              gap: '12px',
            }}>
              {searchResults.map((profile) => (
                <div
                  key={profile.id}
                  style={{
                    padding: '16px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '12px',
                    background: theme.surface,
                  }}
                >
                  <p style={{
                    margin: '0 0 6px',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: theme.text,
                  }}>
                    {profile.name || 'Unnamed User'}
                  </p>
                  <p style={{
                    margin: '0 0 8px',
                    fontSize: '13px',
                    color: theme.muted,
                    wordBreak: 'break-word',
                  }}>
                    {profile.email}
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: '13px',
                    color: theme.muted,
                  }}>
                    {profile.bio?.trim() ? profile.bio : 'No bio available'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .profile-header {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 12px;
            padding: 16px !important;
          }
          .profile-main {
            max-width: 100% !important;
            padding: 22px 16px 28px !important;
          }
          .profile-actions,
          .profile-search-form {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;
