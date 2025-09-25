import React from 'react';

const Spinner = ({ text = 'Đang tải...', className = '' }) => {
  return (
    <div 
      className={`d-flex align-items-center justify-content-center ${className}`}
      style={{ 
        padding: '3rem',
        textAlign: 'center',
        minHeight: '200px'
      }}
    >
      <div 
        style={{ 
          fontSize: '1.1rem',
          fontWeight: '500',
          color: '#6b7280',
          background: '#f8f9fa',
          padding: '1rem 2rem',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}
      >
        {text}
      </div>
    </div>
  );
};

export default Spinner;
