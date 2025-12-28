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
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: 'white',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem'
    }}>
      {/* Logo */}
      <Link 
        to="/" 
        style={{
          textDecoration: 'none',
          color: '#2c3e50',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        Logo
      </Link>

      {/* Navigation Links */}
      <div style={{
        display: 'flex',
        gap: '2rem',
        alignItems: 'center'
      }}>
        <Link
          to="/"
          style={{
            textDecoration: 'none',
            color: isActive('/') ? '#3498db' : '#2c3e50',
            fontWeight: isActive('/') ? '600' : '400',
            fontSize: '1rem',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            transition: 'all 0.3s ease',
            backgroundColor: isActive('/') ? 'rgba(52, 152, 219, 0.1)' : 'transparent'
          }}
        >
          Trang Chủ
        </Link>
        <Link
          to="/inventory"
          style={{
            textDecoration: 'none',
            color: isActive('/inventory') ? '#3498db' : '#2c3e50',
            fontWeight: isActive('/inventory') ? '600' : '400',
            fontSize: '1rem',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            transition: 'all 0.3s ease',
            backgroundColor: isActive('/inventory') ? 'rgba(52, 152, 219, 0.1)' : 'transparent'
          }}
        >
          Kiểm Kê
        </Link>
        <Link
          to="/recipes"
          style={{
            textDecoration: 'none',
            color: isActive('/recipes') ? '#3498db' : '#2c3e50',
            fontWeight: isActive('/recipes') ? '600' : '400',
            fontSize: '1rem',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            transition: 'all 0.3s ease',
            backgroundColor: isActive('/recipes') ? 'rgba(52, 152, 219, 0.1)' : 'transparent'
          }}
        >
          Công Thức
        </Link>
        <Link
          to="/ingredients"
          style={{
            textDecoration: 'none',
            color: isActive('/ingredients') ? '#3498db' : '#2c3e50',
            fontWeight: isActive('/ingredients') ? '600' : '400',
            fontSize: '1rem',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            transition: 'all 0.3s ease',
            backgroundColor: isActive('/ingredients') ? 'rgba(52, 152, 219, 0.1)' : 'transparent'
          }}
        >
          Nguyên Liệu
        </Link>
      </div>

      {/* Profile Badge */}
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'rgba(52, 152, 219, 0.1)',
            border: '1px solid rgba(52, 152, 219, 0.3)',
            borderRadius: '25px',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontSize: '0.9rem',
            color: '#2c3e50'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(52, 152, 219, 0.2)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(52, 152, 219, 0.1)';
          }}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundImage: currentUser?.avatar 
              ? `url(https://res.cloudinary.com/dqa9zqx8d/image/upload/w_64,h_64,c_fill,f_auto,q_auto/${currentUser.avatar})`
              : 'none',
            backgroundColor: currentUser?.avatar ? 'transparent' : 'rgba(52, 152, 219, 0.8)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            color: 'white',
            border: '2px solid rgba(52, 152, 219, 0.3)'
          }}>
            {!currentUser?.avatar && '👤'}
          </div>
          <div style={{
            fontWeight: '500',
            fontSize: '0.9rem'
          }}>
            {currentUser?.fullname || 'User'}
          </div>
          <div style={{
            fontSize: '0.7rem',
            color: '#666',
            transition: 'transform 0.3s ease',
            transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }}>
            ▼
          </div>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            background: 'white',
            borderRadius: '12px',
            padding: '0.5rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.1)',
            minWidth: '220px',
            marginTop: '0.5rem',
            zIndex: 1001
          }}>
            <div style={{
              padding: '0.75rem',
              borderBottom: '1px solid rgba(0,0,0,0.1)',
              marginBottom: '0.5rem'
            }}>
              <div style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#2c3e50',
                marginBottom: '0.25rem'
              }}>
                {currentUser?.fullname || 'User'}
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: '#666'
              }}>
                {currentUser?.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(231, 76, 60, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              🚪 Đăng xuất
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;