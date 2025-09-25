import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav style={{
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
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 2rem',
        height: '60px'
      }}>
        {/* Logo */}
        <Link 
          to="/" 
          style={{
            textDecoration: 'none',
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#3498db',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem'
          }}>
            🍹
          </div>
          <span>Ingredients Tool</span>
        </Link>

        {/* Navigation Links */}
        <div style={{
          display: 'flex',
          gap: '0.5rem'
        }}>
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              color: isActive('/') ? '#3498db' : 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              transition: 'all 0.3s ease',
              backgroundColor: isActive('/') ? 'rgba(52, 152, 219, 0.1)' : 'transparent',
              fontWeight: isActive('/') ? '600' : '400'
            }}
          >
            🏠 Trang Chủ
          </Link>
          <Link
            to="/inventory"
            style={{
              textDecoration: 'none',
              color: isActive('/inventory') ? '#3498db' : 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              transition: 'all 0.3s ease',
              backgroundColor: isActive('/inventory') ? 'rgba(52, 152, 219, 0.1)' : 'transparent',
              fontWeight: isActive('/inventory') ? '600' : '400'
            }}
          >
            📊 Kiểm Kê
          </Link>
          <Link
            to="/recipes"
            style={{
              textDecoration: 'none',
              color: isActive('/recipes') ? '#3498db' : 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              transition: 'all 0.3s ease',
              backgroundColor: isActive('/recipes') ? 'rgba(52, 152, 219, 0.1)' : 'transparent',
              fontWeight: isActive('/recipes') ? '600' : '400'
            }}
          >
            📝 Công Thức
          </Link>
          <Link
            to="/ingredients"
            style={{
              textDecoration: 'none',
              color: isActive('/ingredients') ? '#3498db' : 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              transition: 'all 0.3s ease',
              backgroundColor: isActive('/ingredients') ? 'rgba(52, 152, 219, 0.1)' : 'transparent',
              fontWeight: isActive('/ingredients') ? '600' : '400'
            }}
          >
            🥤 Nguyên Liệu
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
