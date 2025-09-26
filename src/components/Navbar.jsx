import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import toastService from '../services/toastService';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    authService.logout();
    toastService.success('Đăng xuất thành công!');
    navigate('/login');
  };

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

        {/* User Info & Logout */}
        <div className="user-section" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'white',
            fontSize: '0.9rem'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem'
            }}>
              {currentUser?.avatar ? '👤' : '👤'}
            </div>
            <div>
            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>
              {currentUser?.fullname || 'User'}
            </div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
            }}
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
