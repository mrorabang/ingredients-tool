import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import toastService from '../services/toastService';
import MultiSelectGrid from './MultiSelectGrid';

const RecipeEditModal = ({ 
  isOpen, 
  onClose, 
  menuItem, 
  ingredients, 
  currentRecipe, 
  onSave 
}) => {
  const [selectedIngredients, setSelectedIngredients] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load ingredients khi modal mở
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      // Khởi tạo selectedIngredients từ currentRecipe
      const initialSelected = {};
      if (currentRecipe) {
        console.log('Loading currentRecipe:', currentRecipe);
        Object.entries(currentRecipe).forEach(([ingredientId, data]) => {
          console.log(`Ingredient ${ingredientId}:`, data);
          // Xử lý cả trường hợp data là object {amount, unit} hoặc chỉ là số
          const amount = typeof data === 'object' ? data.amount : data;
          const unit = typeof data === 'object' ? data.unit : ingredients.find(ing => ing.id === parseInt(ingredientId))?.unit || 'g';
          
          initialSelected[ingredientId] = {
            amount: amount || '',
            unit: unit || 'g'
          };
        });
      }
      console.log('Initial selected ingredients:', initialSelected);
      setSelectedIngredients(initialSelected);
    }
  }, [isOpen, currentRecipe, ingredients]);

  // Get selected ingredients list for validation
  const selectedIngredientsList = Object.entries(selectedIngredients)
    .filter(([_, data]) => data)
    .map(([ingredientId, data]) => ({
      id: ingredientId,
      ...ingredients.find(ing => ing.id === parseInt(ingredientId)),
      amount: data.amount || '',
      unit: data.unit
    }));

  // Handle form submission
  const handleSubmit = async () => {
    // Check if at least one ingredient is selected and has amount
    const hasValidIngredients = selectedIngredientsList.some(ing => ing.amount && String(ing.amount).trim() !== '');
    if (!hasValidIngredients) {
      toastService.warning('Vui lòng chọn ít nhất một nguyên liệu và nhập khối lượng!');
      return;
    }

    setIsLoading(true);
    try {
      // Create recipe with selected ingredients that have amount
      const recipe = {};
      selectedIngredientsList
        .filter(ingredient => ingredient.amount && String(ingredient.amount).trim() !== '')
        .forEach(ingredient => {
          recipe[ingredient.id] = {
            amount: ingredient.amount,
            unit: ingredient.unit
          };
        });

      onSave(recipe);
      onClose();
    } catch (error) {
      console.error('Lỗi khi lưu công thức:', error);
      toastService.error('Có lỗi xảy ra khi lưu công thức!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xlarge">
      <div style={{ 
        padding: '0', 
        height: '70vh', 
        maxHeight: '600px',
        display: 'flex', 
        flexDirection: 'column',
        background: '#f8fafc',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '1rem 1.5rem', 
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          color: 'white',
          borderRadius: '12px 12px 0 0',
          flexShrink: 0
        }}>
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            textAlign: 'center',
            margin: 0
          }}>
            ✏️ Chỉnh Sửa Công Thức
          </h2>
        </div>

        {/* Form Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Basic Info Section */}
          <div style={{ 
            padding: '1rem 1.5rem', 
            background: 'white',
            borderBottom: '1px solid #e2e8f0',
            flexShrink: 0
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.8rem', 
                fontWeight: '600', 
                color: '#374151',
                marginBottom: '0.375rem'
              }}>
                Món: {menuItem?.name || ''}
              </label>
            </div>
          </div>

          {/* Ingredients Selection - MultiSelectGrid */}
          <div style={{ 
            flex: 1, 
            padding: '1rem',
            background: 'white',
            minHeight: 0,
            overflow: 'hidden'
          }}>
            <MultiSelectGrid
              items={ingredients}
              selectedItems={selectedIngredients}
              onSelectionChange={(itemId, data) => {
                setSelectedIngredients(prev => ({
                  ...prev,
                  [itemId]: data
                }));
              }}
              onAmountChange={(itemId, amount) => {
                setSelectedIngredients(prev => ({
                  ...prev,
                  [itemId]: {
                    ...prev[itemId],
                    amount: amount
                  }
                }));
              }}
              onRemove={(itemId) => {
                setSelectedIngredients(prev => {
                  const newSelected = { ...prev };
                  delete newSelected[itemId];
                  return newSelected;
                });
              }}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              leftTitle="Danh Sách Nguyên Liệu"
              rightTitle="Nhập Khối Lượng"
              placeholder="Tìm kiếm nguyên liệu..."
              showAmountInput={true}
              showSearch={true}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ 
            padding: '0.75rem 1rem', 
            background: 'white',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            gap: '0.5rem',
            justifyContent: 'flex-end',
            flexShrink: 0
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: 'white',
                color: '#6b7280',
                fontSize: '0.8rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#9ca3af';
                e.target.style.color = '#374151';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.color = '#6b7280';
              }}
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '6px',
                background: !selectedIngredientsList.some(ing => ing.amount && String(ing.amount).trim() !== '') ? '#9ca3af' : '#4f46e5',
                color: 'white',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: !selectedIngredientsList.some(ing => ing.amount && String(ing.amount).trim() !== '') ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: selectedIngredientsList.some(ing => ing.amount && String(ing.amount).trim() !== '') ? '0 2px 4px -1px rgba(79, 70, 229, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (selectedIngredientsList.some(ing => ing.amount && String(ing.amount).trim() !== '')) {
                  e.target.style.background = '#3730a3';
                  e.target.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedIngredientsList.some(ing => ing.amount && String(ing.amount).trim() !== '')) {
                  e.target.style.background = '#4f46e5';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
              disabled={isLoading || !selectedIngredientsList.some(ing => ing.amount && String(ing.amount).trim() !== '')}
            >
              {isLoading ? 'Đang lưu...' : `Lưu công thức (${selectedIngredientsList.filter(ing => ing.amount && String(ing.amount).trim() !== '').length})`}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default RecipeEditModal;