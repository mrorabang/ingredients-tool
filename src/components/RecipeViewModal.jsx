import React from 'react';
import Modal from './Modal';

const RecipeViewModal = ({ 
  isOpen, 
  onClose, 
  menuItem, 
  ingredients, 
  recipe 
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`👁️ ${menuItem?.name || ''}`}
      size="compact"
    >
      <div className="fade-in">
        {/* Thông tin món */}
        <div className="mb-2" style={{ 
          padding: '0.5rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          fontSize: '0.8rem'
        }}>
          <div className="flex-between">
            <span className="font-semibold">{menuItem?.name}</span>
          </div>
        </div>

        {/* Công thức */}
        <div className="mb-2">
          <h4 className="font-bold mb-1" style={{ color: '#555', fontSize: '0.9rem' }}>
            📦 Công thức nguyên liệu
          </h4>
          {recipe && Object.keys(recipe).length > 0 ? (
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {Object.keys(recipe).map(ingredientId => {
                const ingredient = ingredients.find(ing => ing.id == ingredientId);
                const recipeData = recipe[ingredientId];
                const amount = typeof recipeData === 'object' ? recipeData.amount : recipeData;
                const unit = typeof recipeData === 'object' ? recipeData.unit : ingredient?.unit || '';
                return (
                  <div key={ingredientId} style={{
                    padding: '0.5rem',
                    backgroundColor: 'white',
                    border: '1px solid #e9ecef',
                    borderRadius: '4px',
                    marginBottom: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="font-semibold text-xs" style={{ color: '#333' }}>
                        {ingredient?.name || 'Unknown'}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-primary">
                      {amount} {unit}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center" style={{ padding: '0.5rem' }}>
              <p className="text-muted text-xs">
                Chưa có công thức cho món này
              </p>
            </div>
          )}
        </div>

        {/* Nút đóng */}
        <div className="flex justify-center" style={{ 
          paddingTop: '0.5rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ minWidth: '80px' }}
          >
            ❌ Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RecipeViewModal;
