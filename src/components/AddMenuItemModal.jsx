import React, { useState, useEffect } from 'react';
import dataService from '../services/dataService';
import Modal from './Modal';
import toastService from '../services/toastService';
import MultiSelectGrid from './MultiSelectGrid';

const AddMenuItemModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: ''
  });
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load ingredients khi modal mở
  useEffect(() => {
    if (isOpen) {
      setIngredients(dataService.getIngredients());
      setFormData({ name: '' });
      setSelectedIngredients({});
      setSearchTerm('');
    }
  }, [isOpen]);

  // Filter ingredients based on search
  // const filteredIngredients = ingredients.filter(ingredient =>
  //   ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  // Get selected ingredients list
  const selectedIngredientsList = Object.entries(selectedIngredients)
    .filter(([_, data]) => data) // Chỉ cần data tồn tại, không cần amount
    .map(([ingredientId, data]) => ({
      id: ingredientId,
      ...ingredients.find(ing => ing.id === parseInt(ingredientId)),
      amount: data.amount || '',
      unit: data.unit
    }));

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toastService.warning('Vui lòng nhập tên món!');
      return;
    }

    // Check if at least one ingredient is selected and has amount
    const hasValidIngredients = selectedIngredientsList.some(ing => ing.amount && ing.amount.trim() !== '');
    if (!hasValidIngredients) {
      toastService.warning('Vui lòng chọn ít nhất một nguyên liệu và nhập khối lượng!');
      return;
    }

    setIsLoading(true);
    try {
      // Create new menu item with default values
      const newMenuItem = await dataService.addMenuItem({
        name: formData.name,
        description: '',
        category: 'Đồ uống'
      });
      
      // Create recipe with selected ingredients that have amount
      const recipe = {};
      selectedIngredientsList
        .filter(ingredient => ingredient.amount && ingredient.amount.trim() !== '')
        .forEach(ingredient => {
          recipe[ingredient.id] = {
            amount: ingredient.amount,
            unit: ingredient.unit
          };
        });

      // Save recipe
      await dataService.updateRecipe(newMenuItem.id, recipe);
      
      toastService.success('Đã tạo món mới thành công!');
      onSave();
      onClose();
    } catch (error) {
      toastService.error('Có lỗi xảy ra khi tạo món mới!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xlarge">
      <div style={{ 
        padding: '0', 
        height: '100%',
        maxHeight: '80vh',
        display: 'flex', 
        flexDirection: 'column',
        background: '#f8fafc',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>

        {/* Header */}
        <div style={{ 
          padding: '0.5rem 1rem', 
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          color: 'white',
          borderRadius: '12px 12px 0 0',
          flexShrink: 0
        }}>
          <h2 style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            textAlign: 'center',
            margin: 0
          }}>
            ✨ Tạo Món Mới
          </h2>
        </div>

        {/* Form Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Basic Info Section */}
          <div style={{ 
            padding: '0.75rem 1rem', 
            background: 'white',
            borderBottom: '1px solid #e2e8f0',
            flexShrink: 0
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.75rem', 
                fontWeight: '600', 
                color: '#374151',
                marginBottom: '0.25rem'
              }}>
                Tên món
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.375rem 0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                  background: '#f8fafc'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4f46e5';
                  e.target.style.background = 'white';
                  e.target.style.boxShadow = '0 0 0 2px rgba(79, 70, 229, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.background = '#f8fafc';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Nhập tên món..."
                required
              />
            </div>
          </div>

          {/* Ingredients Selection - MultiSelectGrid */}
          <div style={{ 
            flex: 1, 
            padding: '0.75rem',
            background: 'white',
            minHeight: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ flex: 1, minHeight: 0 }}>
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
                className="flex-1"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ 
            padding: '0.5rem 1rem', 
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
                padding: '0.375rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                background: 'white',
                color: '#6b7280',
                fontSize: '0.75rem',
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
                padding: '0.375rem 0.75rem',
                border: 'none',
                borderRadius: '4px',
                background: !selectedIngredientsList.some(ing => ing.amount && ing.amount.trim() !== '') ? '#9ca3af' : '#4f46e5',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: !selectedIngredientsList.some(ing => ing.amount && ing.amount.trim() !== '') ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: selectedIngredientsList.some(ing => ing.amount && ing.amount.trim() !== '') ? '0 2px 4px -1px rgba(79, 70, 229, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (selectedIngredientsList.some(ing => ing.amount && ing.amount.trim() !== '')) {
                  e.target.style.background = '#3730a3';
                  e.target.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedIngredientsList.some(ing => ing.amount && ing.amount.trim() !== '')) {
                  e.target.style.background = '#4f46e5';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
              disabled={isLoading || !selectedIngredientsList.some(ing => ing.amount && ing.amount.trim() !== '')}
            >
              {isLoading ? 'Đang tạo...' : `Tạo món (${selectedIngredientsList.filter(ing => ing.amount && ing.amount.trim() !== '').length})`}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddMenuItemModal;
