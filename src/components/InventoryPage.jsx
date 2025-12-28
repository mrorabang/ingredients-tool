import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import dataService from '../services/dataService';
import excelService from '../services/excelService';
import toastService from '../services/toastService';
import Spinner from './Spinner';
import MultiSelectGrid from './MultiSelectGrid';

const InventoryPage = () => {
  // Sử dụng DataContext thay vì load dữ liệu riêng
  const { menuItems, ingredients, recipes, isLoading } = useData();
  
  // State để lưu dữ liệu
  const [salesCount, setSalesCount] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState({});
  const [isExporting, setIsExporting] = useState(false);


  // Function xuất Excel theo thứ tự cố định
  const handleExportSimple = () => {
    setIsExporting(true);
    try {
      // Tính tổng nguyên liệu đã sử dụng
      const usedIngredients = calculateUsedIngredients();
      const result = excelService.exportSimpleInventory(usedIngredients, ingredients);
      
      if (result.success) {
        toastService.success(result.message);
      } else {
        toastService.error(result.message);
      }
    } catch (error) {
      toastService.error('Có lỗi xảy ra khi xuất file Excel!');
    } finally {
      setIsExporting(false);
    }
  };

  // Load dữ liệu bán hàng khi component mount
  useEffect(() => {
    const todaySales = dataService.getSalesByDate(currentDate);
    setSalesCount(todaySales);
  }, [currentDate]);

  // Sync selectedItems với salesCount
  useEffect(() => {
    const newSelectedItems = {};
    Object.keys(salesCount).forEach(itemId => {
      if (salesCount[itemId] > 0) {
        const item = menuItems.find(item => item.id === parseInt(itemId));
        if (item) {
          newSelectedItems[itemId] = {
            amount: salesCount[itemId].toString(),
            unit: 'ly'
          };
        }
      }
    });
    setSelectedItems(newSelectedItems);
  }, [salesCount, menuItems]);

  // Hàm cập nhật số lượng bán
  const updateSalesCount = (itemId, count) => {
    const newCount = Math.max(0, count); // Đảm bảo không âm
    setSalesCount(prev => {
      const updated = {
        ...prev,
        [itemId]: newCount
      };
      // Lưu vào localStorage
      dataService.updateSales(currentDate, updated);
      return updated;
    });
  };

  // Hàm tính tổng nguyên liệu đã sử dụng
  const calculateUsedIngredients = () => {
    const usedIngredients = {};
    
    Object.keys(salesCount).forEach(itemId => {
      const count = salesCount[itemId];
      if (count > 0 && recipes[itemId]) {
        Object.keys(recipes[itemId]).forEach(ingredientId => {
          const recipeIngredient = recipes[itemId][ingredientId];
          const baseAmount = typeof recipeIngredient === 'object'
            ? parseFloat(recipeIngredient?.amount)
            : parseFloat(recipeIngredient);

          const safeBaseAmount = Number.isFinite(baseAmount) ? baseAmount : 0;
          const amount = safeBaseAmount * count;
          usedIngredients[ingredientId] = (usedIngredients[ingredientId] || 0) + amount;
        });
      }
    });
    
    return usedIngredients;
  };

  const usedIngredients = calculateUsedIngredients();

  // Show spinner while loading data
  if (isLoading) {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <Spinner text="Đang tải dữ liệu kho hàng..." />
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
          📊 Kiểm Kê Nguyên Liệu
        </h1>
        <p className="text-lg" style={{ opacity: 0.9 }}>
          Theo dõi số lượng bán hàng và tính toán nguyên liệu đã sử dụng
        </p>
      </div>
      
      {/* Date Selector */}
      <div className="card text-center fade-in" style={{ marginBottom: '2rem' }}>
        <div className="form-group">
          <label className="form-label text-lg">
            📅 Chọn ngày kiểm kê
          </label>
          <input
            type="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            className="form-control"
            style={{ maxWidth: '300px', margin: '0 auto' }}
          />
        </div>
      </div>

      
      {/* Menu Items - MultiSelectGrid */}
      <div className="card fade-in" style={{ marginBottom: '3rem' }}>
        <h2 className="text-lg font-bold mb-3 text-center">🍹 Kiểm Kê Số Lượng Bán</h2>
        {menuItems.length === 0 ? (
          <div className="text-center" style={{ padding: '2rem', color: '#666' }}>
            <p>Không có món nào được tìm thấy.</p>
            <p>Hãy kiểm tra kết nối dữ liệu hoặc tạo món mới.</p>
          </div>
        ) : (
          <div style={{ padding: '1rem' }}>
            <MultiSelectGrid
              items={menuItems.map(item => ({ ...item, unit: 'ly' }))}
              selectedItems={selectedItems}
              onSelectionChange={(itemId, data) => {
                setSelectedItems(prev => ({
                  ...prev,
                  [itemId]: data
                }));
                // Update sales count only if amount exists
                if (data && data.amount) {
                  updateSalesCount(itemId, parseInt(data.amount) || 1);
                }
              }}
              onAmountChange={(itemId, amount) => {
                setSelectedItems(prev => ({
                  ...prev,
                  [itemId]: {
                    ...prev[itemId],
                    amount: amount
                  }
                }));
                // Update sales count
                updateSalesCount(itemId, parseInt(amount) || 1);
              }}
              onRemove={(itemId) => {
                setSelectedItems(prev => {
                  const newSelected = { ...prev };
                  delete newSelected[itemId];
                  return newSelected;
                });
                // Update sales count to 0
                updateSalesCount(itemId, 0);
              }}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              leftTitle="Danh Sách Món"
              rightTitle="Số Lượng Đã Bán"
              placeholder="Tìm kiếm món..."
              showAmountInput={true}
              showSearch={true}
            />
          </div>
        )}
      </div>

      {/* Tổng kết nguyên liệu đã sử dụng */}
      <div className="card fade-in" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 className="text-lg font-bold mb-0 text-center" >Tổng Nguyên Liệu Đã Sử Dụng</h2>
          <button
            className="btn btn-success"
            onClick={handleExportSimple}
            disabled={isExporting || Object.keys(usedIngredients).length === 0}
            style={{ 
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap',
              minWidth: 'fit-content',
              opacity: (isExporting || Object.keys(usedIngredients).length === 0) ? 0.6 : 1,
              cursor: (isExporting || Object.keys(usedIngredients).length === 0) ? 'not-allowed' : 'pointer'
            }}
          >
           Tải xuống Excel
          </button>
        </div>
        {Object.keys(usedIngredients).length > 0 ? (
          <div className="grid grid-3" style={{ gap: '1rem' }}>
            {Object.keys(usedIngredients).map(ingredientId => {
              // Tìm ingredient theo id (so sánh string với string)
              const ingredient = ingredients.find(ing => 
                ing.id === ingredientId || 
                ing.id === parseInt(ingredientId).toString() ||
                ing.ingredientId === parseInt(ingredientId)
              );
              return (
                <div key={ingredientId} className="card" style={{
                  padding: '1rem',
                  backgroundColor: '#f8f9fa',
                  border: '2px solid #e9ecef'
                }}>
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">
                      {Number.isFinite(usedIngredients[ingredientId]) ? usedIngredients[ingredientId] : 0}
                    </div>
                    <div className="text-sm text-muted">
                      {ingredient?.unit || ''}
                    </div>
                    <div className="font-semibold" style={{ color: '#333' }}>
                      {ingredient?.name || `Ingredient ${ingredientId}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center" style={{ padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}></div>
            <p className="text-muted text-lg">
              Chưa có món nào được bán hôm nay
            </p>
          </div>
        )}
      </div>

      {/* Tổng doanh thu */}
      <div className="card fade-in" style={{ 
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        color: 'white',
        border: 'none',
        textAlign: 'center'
      }}>
        <h3 className="text-lg font-bold mb-2">📊 Tổng Số Lượng</h3>
        <div className="text-xl font-bold" style={{ fontSize: '2rem' }}>
          {Object.keys(salesCount).reduce((total, itemId) => {
            return total + (salesCount[itemId] || 0);
          }, 0)} ly
        </div>
        <div className="text-sm" style={{ opacity: 0.9, marginTop: '0.5rem' }}>
          Ngày {new Date(currentDate).toLocaleDateString('vi-VN')}
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
