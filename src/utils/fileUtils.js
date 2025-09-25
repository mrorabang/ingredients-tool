// Utility functions for file operations

// Download file as JSON
export const downloadFile = (data, filename) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

// Read file from input
export const readFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch (error) {
        reject(new Error('Không thể đọc file JSON: ' + error.message));
      }
    };
    reader.onerror = () => reject(new Error('Không thể đọc file'));
    reader.readAsText(file);
  });
};

// Create file input for upload
export const createFileInput = (accept = '.json', multiple = false) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = accept;
  input.multiple = multiple;
  input.style.display = 'none';
  return input;
};

// Upload file and return data
export const uploadFile = (accept = '.json') => {
  return new Promise((resolve, reject) => {
    const input = createFileInput(accept);
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) {
        reject(new Error('Không có file được chọn'));
        return;
      }
      
      try {
        const data = await readFile(file);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    
    input.oncancel = () => reject(new Error('Hủy upload file'));
    input.click();
  });
};

// Save data to localStorage with timestamp
export const saveToLocalStorage = (key, data) => {
  const dataWithTimestamp = {
    data,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  };
  localStorage.setItem(key, JSON.stringify(dataWithTimestamp));
};

// Load data from localStorage
export const loadFromLocalStorage = (key) => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    return parsed.data || parsed; // Support both old and new format
  } catch (error) {
    console.error('Lỗi khi load từ localStorage:', error);
    return null;
  }
};

// Export all data as a single file
export const exportAllData = (menuItems, ingredients, recipes, sales) => {
  const allData = {
    menuItems,
    ingredients,
    recipes,
    sales,
    exportDate: new Date().toISOString(),
    version: '1.0.0'
  };
  
  downloadFile(allData, `ingredients-tool-backup-${new Date().toISOString().split('T')[0]}.json`);
};

// Import all data from a single file
export const importAllData = () => {
  return uploadFile('.json').then(data => {
    // Validate data structure
    if (!data.menuItems || !data.ingredients || !data.recipes) {
      throw new Error('File không đúng định dạng. Vui lòng chọn file backup từ Ingredients Tool.');
    }
    
    return {
      menuItems: data.menuItems || [],
      ingredients: data.ingredients || [],
      recipes: data.recipes || {},
      sales: data.sales || {}
    };
  });
};
