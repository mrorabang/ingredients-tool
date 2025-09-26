import React, { useState, useEffect } from 'react';
import dataService from '../services/dataService';
import toastService from '../services/toastService';
import Modal from './Modal';
import Spinner from './Spinner';

const IngredientsPage = () => {
  // Lấy dữ liệu từ service
  const [ingredients, setIngredients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [formData, setFormData] = useState({ name: '', unit: '' });
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Load dữ liệu khi component mount
  useEffect(() => {
    const loadIngredients = async () => {
      setIsDataLoading(true);
      try {
        // Đảm bảo dataService đã được khởi tạo
        if (!dataService.isInitialized) {
          await dataService.init();
        }
        setIngredients(dataService.getIngredients());
      } catch (error) {
        setIngredients([]);
      } finally {
        setIsDataLoading(false);
      }
    };
    
    loadIngredients();
  }, []);

  // Hàm mở modal thêm mới
  const openAddModal = () => {
    setEditingIngredient(null);
    setFormData({ name: '', unit: '' });
    setIsModalOpen(true);
  };

  // Hàm mở modal chỉnh sửa
  const openEditModal = (ingredient) => {
    setEditingIngredient(ingredient);
    setFormData({ name: ingredient.name, unit: ingredient.unit });
    setIsModalOpen(true);
  };

  // Hàm đóng modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingIngredient(null);
    setFormData({ name: '', unit: '' });
  };

  // Hàm xử lý thay đổi form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Hàm lưu nguyên liệu
  const handleSave = () => {
    if (!formData.name.trim() || !formData.unit.trim()) {
      toastService.warning('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (editingIngredient) {
      // Cập nhật nguyên liệu
      dataService.updateIngredient(editingIngredient.id, formData);
      setIngredients(dataService.getIngredients());
      toastService.success('Đã cập nhật nguyên liệu thành công!');
    } else {
      // Thêm nguyên liệu mới
      dataService.addIngredient(formData);
      setIngredients(dataService.getIngredients());
      toastService.success('Đã thêm nguyên liệu mới thành công!');
    }
    
    closeModal();
  };

  // Hàm xóa nguyên liệu
  const handleDelete = async (ingredientId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nguyên liệu này? Hành động này sẽ xóa nguyên liệu khỏi tất cả công thức.')) {
      try {
        await dataService.deleteIngredient(ingredientId);
        setIngredients(dataService.getIngredients());
        toastService.success('Đã xóa nguyên liệu thành công!');
      } catch (error) {
        toastService.error('Có lỗi xảy ra khi xóa nguyên liệu!');
      }
    }
  };

  // Show spinner while loading data
  if (isDataLoading) {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <Spinner text="Đang tải danh sách nguyên liệu..." />
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
          🥤 Quản Lý Nguyên Liệu
        </h1>
        <p className="text-lg" style={{ opacity: 0.9 }}>
          Thêm, sửa, xóa nguyên liệu và đơn vị đo
        </p>
      </div>

      {/* Thống kê */}
      <div className="card fade-in" style={{ marginBottom: '2rem' }}>
        <div className="grid grid-4 text-center">
          <div>
            <div className="text-lg font-bold text-primary">{ingredients.length}</div>
            <div className="text-sm text-muted">Tổng nguyên liệu</div>
          </div>
          <div>
            <div className="text-lg font-bold text-success">
              {[...new Set(ingredients.map(ing => ing.unit))].length}
            </div>
            <div className="text-sm text-muted">Đơn vị đo</div>
          </div>
          <div>
            <div className="text-lg font-bold text-warning">
              {ingredients.filter(ing => ing.unit === 'g').length}
            </div>
            <div className="text-sm text-muted">Theo gram</div>
          </div>
          <div>
            <div className="text-lg font-bold text-danger">
              {ingredients.filter(ing => ing.unit === 'ml').length}
            </div>
            <div className="text-sm text-muted">Theo ml</div>
          </div>
        </div>
      </div>

      {/* Nút thêm mới */}
      <div className="card fade-in" style={{ marginBottom: '2rem' }}>
        <div className="flex-between">
          <h2 className="text-lg font-bold">📋 Danh Sách Nguyên Liệu</h2>
          <button
            onClick={openAddModal}
            className="btn btn-success"
          >
            ➕ Thêm Nguyên Liệu
          </button>
        </div>
      </div>

      {/* Danh sách nguyên liệu */}
      <div className="card fade-in">
        {ingredients.length > 0 ? (
          <div className="grid grid-3" style={{ gap: '1rem' }}>
            {ingredients.map(ingredient => (
              <div key={ingredient.id} className="card" style={{
                padding: '1rem',
                backgroundColor: '#f8f9fa',
                border: '2px solid #e9ecef',
                transition: 'all 0.3s ease'
              }}>
                <div className="text-center mb-2">
                  <div className="font-bold text-lg" style={{ color: '#333' }}>
                    {ingredient.name}
                  </div>
                  <div className="badge badge-primary">
                    {ingredient.unit}
                  </div>
                </div>
                
                <div className="flex gap-1 justify-center">
                  <button
                    onClick={() => openEditModal(ingredient)}
                    className="btn btn-warning btn-sm"
                    style={{ flex: 1 }}
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(ingredient.id)}
                    className="btn btn-danger btn-sm"
                    style={{ flex: 1 }}
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center" style={{ padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🥤</div>
            <p className="text-muted text-lg">
              Chưa có nguyên liệu nào
            </p>
            <button
              onClick={openAddModal}
              className="btn btn-primary mt-2"
            >
              ➕ Thêm Nguyên Liệu Đầu Tiên
            </button>
          </div>
        )}
      </div>

      {/* Modal thêm/sửa nguyên liệu */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingIngredient ? `✏️ Sửa Nguyên Liệu` : `➕ Thêm Nguyên Liệu Mới`}
        size="small"
      >
        <div className="fade-in">
          <div className="form-group mb-3">
            <label className="form-label">Tên nguyên liệu</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Ví dụ: Cà phê, Sữa tươi, Đường..."
            />
          </div>

          <div className="form-group mb-3">
            <label className="form-label">Đơn vị đo</label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
              className="form-control"
            >
              <option value="">Chọn đơn vị đo</option>
              <option value="g">Gram (g)</option>
              <option value="ml">Milliliter (ml)</option>
              <option value="quả">Quả</option>
              <option value="ly">Ly</option>
              <option value="muỗng">Muỗng</option>
              <option value="gói">Gói</option>
              <option value="kg">Kilogram (kg)</option>
              <option value="l">Liter (l)</option>
              <option value="cái">Cái</option>
              <option value="miếng">Miếng</option>
            </select>
          </div>

          <div className="flex gap-2 justify-center" style={{ 
            paddingTop: '0.5rem',
            borderTop: '1px solid #e5e7eb'
          }}>
            <button
              onClick={handleSave}
              className="btn btn-success btn-sm"
              style={{ minWidth: '80px' }}
            >
              💾 Lưu
            </button>
            <button
              onClick={closeModal}
              className="btn btn-secondary btn-sm"
              style={{ minWidth: '80px' }}
            >
              ❌ Hủy
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default IngredientsPage;
