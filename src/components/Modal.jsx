import React from 'react';

const Modal = ({ isOpen, onClose, title, children, size = 'medium' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    small: 'max-w-xs',
    medium: 'max-w-sm',
    large: 'max-w-md',
    xlarge: 'max-w-lg'
  };

  const sizeStyles = {
    small: { width: '300px', maxWidth: '90vw' },
    medium: { width: '400px', maxWidth: '90vw' },
    large: { width: '500px', maxWidth: '90vw' },
    xlarge: { width: '600px', maxWidth: '90vw' },
    compact: { width: '33vw', maxWidth: '400px', minWidth: '300px' }
  };

  return (
    <div 
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div 
        className={`modal-content ${sizeClasses[size]}`}
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          ...sizeStyles[size],
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f9fafb'
        }}>
          <h2 className="font-bold" style={{ margin: 0, color: '#1f2937', fontSize: '1.1rem' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '0.25rem',
              minWidth: 'auto',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem'
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{
          padding: '1.25rem',
          overflowY: 'auto',
          flex: 1
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
