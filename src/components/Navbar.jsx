import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import toastService from '../services/toastService';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    authService.logout();
    toastService.success('Đăng xuất thành công!');
    navigate('/login');
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  return (
    <nav className="navbar" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      backgroundColor: '#2c3e50',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      padding: '0',
      margin: '0'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '50px'
      }}>
        {/* Logo */}
        <Link 
          to="/" 
          style={{
            textDecoration: 'none',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>Kiểm Kho</span>
        </Link>

        {/* Navigation Links */}
        <div className="navbar-nav" style={{
          display: 'flex',
          gap: '0.5rem'
        }}>
          <Link
            to="/"
            className="nav-link"
            style={{
              textDecoration: 'none',
              color: isActive('/') ? '#3498db' : 'white',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              transition: 'all 0.3s ease',
              backgroundColor: isActive('/') ? 'rgba(52, 152, 219, 0.1)' : 'transparent',
              fontWeight: isActive('/') ? '600' : '400',
              fontSize: '0.9rem'
            }}
          >
            Trang Chủ
          </Link>
          <Link
            to="/inventory"
            className="nav-link"
            style={{
              textDecoration: 'none',
              color: isActive('/inventory') ? '#3498db' : 'white',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              transition: 'all 0.3s ease',
              backgroundColor: isActive('/inventory') ? 'rgba(52, 152, 219, 0.1)' : 'transparent',
              fontWeight: isActive('/inventory') ? '600' : '400',
              fontSize: '0.9rem'
            }}
          >
            Kiểm Kê
          </Link>
          <Link
            to="/recipes"
            style={{
              textDecoration: 'none',
              color: isActive('/recipes') ? '#3498db' : 'white',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              transition: 'all 0.3s ease',
              backgroundColor: isActive('/recipes') ? 'rgba(52, 152, 219, 0.1)' : 'transparent',
              fontWeight: isActive('/recipes') ? '600' : '400',
              fontSize: '0.9rem'
            }}
          >
            Công Thức
          </Link>
          <Link
            to="/ingredients"
            className="nav-link"
            style={{
              textDecoration: 'none',
              color: isActive('/ingredients') ? '#3498db' : 'white',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              transition: 'all 0.3s ease',
              backgroundColor: isActive('/ingredients') ? 'rgba(52, 152, 219, 0.1)' : 'transparent',
              fontWeight: isActive('/ingredients') ? '600' : '400',
              fontSize: '0.9rem'
            }}
          >
            Nguyên Liệu
          </Link>
        </div>

        {/* User Dropdown */}
        <div className="user-section" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          position: 'relative'
        }} ref={dropdownRef}>
          {/* User Badge */}
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '20px',
              padding: '0.25rem 0.5rem',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Avatar */}
            <div 
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                overflow: 'hidden',
                backgroundImage: currentUser?.avatar ? `url(https://res.cloudinary.com/dqa9zqx8d/image/upload/w_64,h_64,c_fill,f_auto,q_auto/${currentUser.avatar})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                position: 'relative'
              }}
            >
              {/* Fallback icon - chỉ hiển thị khi không có avatar */}
              {!currentUser?.avatar && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '1rem'
                }}>
                  👤
                </div>
              )}
            </div>
            
            {/* User Name */}
            <div style={{ 
              color: 'white',
              fontWeight: '600', 
              fontSize: '0.85rem',
              whiteSpace: 'nowrap'
            }}>
              {currentUser?.fullname || 'User'}
            </div>

            {/* Dropdown Arrow */}
            <div style={{
              color: 'white',
              fontSize: '0.8rem',
              transition: 'transform 0.3s ease',
              transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
            }}>
              ▼
            </div>
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              marginTop: '0.5rem',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              minWidth: '200px',
              zIndex: 1000,
              overflow: 'hidden'
            }}>
              {/* User Info */}
              <div style={{
                padding: '1rem',
                borderBottom: '1px solid rgba(0,0,0,0.1)',
                background: 'rgba(0,0,0,0.02)'
              }}>
                <div style={{
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  color: '#2c3e50',
                  marginBottom: '0.25rem'
                }}>
                  {currentUser?.fullname || 'User'}
                </div>
                {/* <div style={{
                  fontSize: '0.8rem',
                  color: '#6c757d'
                }}>
                  {currentUser?.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}
                </div> */}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'none',
                  border: 'none',
                  color: '#dc3545',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  justifyContent: 'flex-start'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                 Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>

    </nav>
  );
};

export default Navbar;
