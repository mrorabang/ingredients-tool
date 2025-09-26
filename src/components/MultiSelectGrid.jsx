import React from 'react';

const MultiSelectGrid = ({
  items = [],
  selectedItems = {},
  onSelectionChange,
  onAmountChange,
  onRemove,
  searchTerm = '',
  onSearchChange,
  leftTitle = 'Danh Sách',
  rightTitle = 'Đã Chọn',
  placeholder = 'Tìm kiếm...',
  showAmountInput = true,
  showSearch = true,
  className = ''
}) => {
  // Filter items based on search
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected items list
  const selectedItemsList = Object.entries(selectedItems)
    .filter(([_, data]) => data)
    .map(([itemId, data]) => {
      // Tìm ingredient theo id (so sánh string với string)
      const item = items.find(ing => 
        ing.id === itemId || 
        ing.id === parseInt(itemId).toString() ||
        ing.id === parseInt(itemId)
      );
      return {
        id: itemId,
        ...item,
        amount: data.amount || '',
        unit: data.unit
      };
    });

  // Handle item selection
  const handleItemSelect = (itemId) => {
    // Tìm ingredient theo id (so sánh string với string)
    const item = items.find(ing => 
      ing.id === itemId || 
      ing.id === parseInt(itemId).toString() ||
      ing.id === parseInt(itemId)
    );
    onSelectionChange(itemId, { amount: '1', unit: item?.unit || 'g' });
  };

  // Handle item removal
  const handleItemRemove = (itemId) => {
    onRemove(itemId);
  };

  // Handle amount change
  const handleAmountChange = (itemId, amount) => {
    onAmountChange(itemId, amount);
  };

  return (
    <div className={`multi-select-grid ${className}`} style={{ 
      display: 'flex',
      gap: '1rem',
      height: 'auto',
      minHeight: '300px',
      maxHeight: '500px',
      flex: 1
    }}>
      {/* Left Column - Available Items */}
      <div style={{ 
        flex: 1, 
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0
      }}>
    
        
        {/* Search */}
        {showSearch && (
          <div style={{ marginBottom: '0.75rem', flexShrink: 0 }}>
            <input
              type="text"
              placeholder={`🔍 ${placeholder}`}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.2s',
                background: '#f8fafc'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#4f46e5';
                e.target.style.background = 'white';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.background = '#f8fafc';
              }}
            />
          </div>
        )}

        {/* Items List */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto',
          border: '2px solid #e2e8f0',
          borderRadius: '8px',
          padding: '0.25rem',
          background: '#f8fafc',
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 #f1f5f9',
          minHeight: 0,
          maxHeight: '100%'
        }}>
          {filteredItems.map(item => (
            <div 
              key={item.id} 
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.5rem 0.75rem',
                borderBottom: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: selectedItems[item.id] ? '#eef2ff' : 'white',
                minHeight: '40px'
              }}
              onClick={() => handleItemSelect(item.id)}
              onMouseEnter={(e) => {
                if (!selectedItems[item.id]) {
                  e.target.style.background = '#f8fafc';
                }
              }}
              onMouseLeave={(e) => {
                if (!selectedItems[item.id]) {
                  e.target.style.background = 'white';
                }
              }}
            >
              <input
                type="checkbox"
                checked={!!selectedItems[item.id]}
                onChange={() => handleItemSelect(item.id)}
                style={{
                  width: '16px',
                  height: '16px',
                  marginRight: '0.5rem',
                  accentColor: '#4f46e5'
                }}
              />
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ 
                  fontSize: '0.8rem', 
                  fontWeight: '500',
                  color: '#374151',
                  lineHeight: '1.2',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  flex: 1
                }}>
                  {item.name}
                </div>
                {selectedItems[item.id] && (
                  <div style={{
                    width: '16px',
                    height: '16px',
                    background: '#4f46e5',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.6rem'
                  }}>
                    ✓
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column - Selected Items */}
      <div style={{ 
        flex: 1, 
        display: 'flex',
        flexDirection: 'column',
        background: '#f8fafc',
        minHeight: 0
      }}>
    
        
        {selectedItemsList.length === 0 ? (
          <div style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6b7280',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '1rem', margin: 0 }}>Chọn từ cột bên trái</p>
          </div>
        ) : (
          <div style={{ 
            flex: 1, 
            overflowY: 'auto',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            padding: '0.25rem',
            background: 'white',
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 #f1f5f9',
            minHeight: 0,
            maxHeight: '100%'
          }}>
            {selectedItemsList.map(item => (
              <div key={item.id} className="item-row" style={{
                display: 'flex',
                padding: '0.5rem 0.75rem',
                borderBottom: '1px solid #e2e8f0',
                background: '#f8fafc',
                marginBottom: '0.25rem',
                borderRadius: '6px',
                minHeight: '40px'
              }}>
                <div className="item-content" style={{ 
                  flex: 1,
                  minWidth: 0,
                  overflow: 'hidden'
                }}>
                  <div className="item-name" style={{ 
                    fontSize: '0.8rem', 
                    fontWeight: '500',
                    color: '#374151',
                    lineHeight: '1.2',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {item?.name || `Ingredient ${item.id}`}
                  </div>
                </div>
                <div className="item-controls" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.25rem' 
                }}>
                  {showAmountInput && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          const currentAmount = parseInt(item.amount) || 1;
                          handleAmountChange(item.id, (currentAmount - 1).toString());
                        }}
                        style={{
                          width: '24px',
                          height: '24px',
                          background: '#ef4444',
                          border: 'none',
                          color: 'white',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#dc2626';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#ef4444';
                        }}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="1"
                        value={item.amount}
                        onChange={(e) => handleAmountChange(item.id, e.target.value)}
                        style={{
                          width: '50px',
                          padding: '0.25rem 0.375rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          textAlign: 'center',
                          outline: 'none',
                          background: 'white'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#4f46e5';
                          e.target.style.boxShadow = '0 0 0 2px rgba(79, 70, 229, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const currentAmount = parseInt(item.amount) || 1;
                          handleAmountChange(item.id, (currentAmount + 1).toString());
                        }}
                        style={{
                          width: '24px',
                          height: '24px',
                          background: '#10b981',
                          border: 'none',
                          color: 'white',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#059669';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#10b981';
                        }}
                      >
                        +
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => handleItemRemove(item.id)}
                    style={{
                      background: '#ef4444',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '0.7rem',
                      padding: '0.25rem',
                      borderRadius: '4px',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#dc2626';
                      e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#ef4444';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSelectGrid;
