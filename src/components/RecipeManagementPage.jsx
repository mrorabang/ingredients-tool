import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import dataService from '../services/dataService';
import RecipeEditModal from './RecipeEditModal';
import RecipeViewModal from './RecipeViewModal';
import AddMenuItemModal from './AddMenuItemModal';
import toastService from '../services/toastService';
import Spinner from './Spinner';

const RecipeManagementPage = () => {
  // Sử dụng DataContext thay vì load dữ liệu riêng
  const { menuItems, ingredients, recipes, isLoading, updateAllData } = useData();
  
  // State để theo dõi món đang được xem chi tiết
  const [viewingItem, setViewingItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // const [isSaving, setIsSaving] = useState(false);

  // Hàm xem công thức
  const startViewing = (itemId) => {
    setViewingItem(itemId);
    setIsViewModalOpen(true);
  };

  // Hàm bắt đầu chỉnh sửa công thức
  const startEditing = (itemId) => {
    setEditingItem(itemId);
    setIsEditModalOpen(true);
    setViewingItem(null);
  };

  // Hàm lưu công thức từ modal
  const handleSaveRecipe = async (newRecipe) => {
    try {
      await dataService.updateRecipe(editingItem, newRecipe);
      // Refresh data after saving
      updateAllData();
      setEditingItem(null);
      setIsEditModalOpen(false);
      toastService.success('Đã lưu công thức thành công!');
    } catch (error) {
      console.error('Lỗi khi lưu công thức:', error);
      toastService.error('Có lỗi xảy ra khi lưu công thức!');
    }
  };


  // Hàm đóng modal chỉnh sửa
  const handleCloseEditModal = () => {
    setEditingItem(null);
    setIsEditModalOpen(false);
  };

  // Hàm đóng modal xem
  const handleCloseViewModal = () => {
    setViewingItem(null);
    setIsViewModalOpen(false);
  };

  // Hàm mở modal tạo món mới
  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  // Hàm đóng modal tạo món mới
  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  // Hàm xử lý sau khi tạo món mới thành công
  const handleAddSuccess = async () => {
    // Refresh data
    updateAllData();
  };

  // Debug logging
  console.log('RecipeManagementPage render:');
  console.log('- menuItems:', menuItems.length);
  console.log('- ingredients:', ingredients.length);
  console.log('- recipes:', Object.keys(recipes).length);
  console.log('- isLoading:', isLoading);
  console.log('- menuItems sample:', menuItems.slice(0, 3));
  console.log('- recipes sample:', Object.keys(recipes).slice(0, 3));

  // Show spinner while loading data
  if (isLoading) {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <Spinner text="Đang tải dữ liệu công thức..." />
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      {/* Header */}
      <div className="card text-center fade-in" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        marginBottom: '2rem'
      }}>
        <h1 className="text-xl" style={{ 
          marginBottom: '0.5rem',
          fontSize: '2.5rem',
          fontWeight: 'bold'
        }}>
          📝 Công Thức Nguyên Liệu
        </h1>
        <p className="text-lg" style={{ opacity: 0.9, marginBottom: '1rem' }}>
          Quản lý và chỉnh sửa công thức cho từng món đồ uống
        </p>
        
        <button 
          onClick={handleOpenAddModal}
          className="btn btn-success"
          style={{ 
            fontSize: '1rem',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            fontWeight: 'bold'
          }}
        >
          ➕ Tạo Món Mới
        </button>
      </div>
    
      
      {/* Danh sách món */}
      <div className="card fade-in" style={{ marginBottom: '3rem' }}>
        <h2 className="text-lg font-bold mb-3 text-center">🍹 Danh Sách Món</h2>
        {menuItems.length === 0 ? (
          <div className="text-center" style={{ padding: '2rem', color: '#666' }}>
            <p>Không có món nào được tìm thấy.</p>
            <p>Hãy thử tạo món mới hoặc kiểm tra kết nối dữ liệu.</p>
          </div>
        ) : (
          <div className="grid grid-2" style={{ gap: '1rem' }}>
            {menuItems.map(item => (
            <div key={item.id} className="card" style={{
              padding: '1rem',
              backgroundColor: viewingItem === item.id ? '#e3f2fd' : '#f8f9fa',
              border: viewingItem === item.id ? '2px solid #3498db' : '2px solid #e9ecef',
              transition: 'all 0.3s ease'
            }}>
              <div className="flex-between mb-2">
                <div>
                  <h3 className="font-bold" style={{ color: '#333', fontSize: '1.1rem' }}>
                    {item.name}
                  </h3>
                </div>
                <div className="badge badge-primary">
                  {Object.keys(recipes[item.id] || {}).length} nguyên liệu
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => startViewing(item.id)}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                >
                   Xem
                </button>
                <button 
                  onClick={() => startEditing(item.id)}
                  className="btn btn-success btn-sm"
                  style={{ flex: 1 }}
                >
                   Chỉnh Sửa
                </button>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>


      {/* Tóm tắt công thức */}
      <div style={{ 
        backgroundColor: '#e9ecef', 
        padding: '1.5rem', 
        borderRadius: '8px'
      }}>
        <h3 style={{ color: '#555', marginBottom: '1rem' }}>Tóm Tắt Tất Cả Công Thức</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          {menuItems.map(item => (
            <div key={item.id} style={{
              backgroundColor: 'white',
              padding: '1rem',
              borderRadius: '6px',
              border: '1px solid #dee2e6'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>{item.name}</h4>
              {Object.keys(recipes[item.id] || {}).map(ingredientId => {
                const ingredient = ingredients.find(ing => ing.id === parseInt(ingredientId));
                const recipeData = recipes[item.id][ingredientId];
                const amount = typeof recipeData === 'object' ? recipeData.amount : recipeData;
                const unit = typeof recipeData === 'object' ? recipeData.unit : ingredient?.unit;
                return (
                  <div key={ingredientId} style={{ fontSize: '0.8rem', color: '#666' }}>
                    • {ingredient?.name}: {amount} {unit}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Recipe View Modal */}
      <RecipeViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        menuItem={menuItems.find(item => item.id === viewingItem)}
        ingredients={ingredients}
        recipe={recipes[viewingItem]}
      />

      {/* Recipe Edit Modal */}
      <RecipeEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        menuItem={menuItems.find(item => item.id === editingItem)}
        ingredients={ingredients}
        currentRecipe={recipes[editingItem]}
        onSave={handleSaveRecipe}
      />

      <AddMenuItemModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSave={handleAddSuccess}
      />
    </div>
  );
};

export default RecipeManagementPage;
