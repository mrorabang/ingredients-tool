import mockAPIService from './mockAPIService';
import toastService from './toastService';

// Service để quản lý dữ liệu - Đọc/ghi từ file JSON và MockAPI
class DataService {
  constructor() {
    // Dữ liệu sẽ được load từ file JSON và MockAPI
    this.menuItems = [];
    this.ingredients = [];
    this.recipes = {};
    this.sales = {};
    this.useMockAPI = true; // Flag để bật/tắt MockAPI
    this.isInitialized = false; // Flag để kiểm tra đã khởi tạo chưa
  }

  // Lấy danh sách món
  getMenuItems() {
    return this.menuItems;
  }

  // Lấy danh sách nguyên liệu
  getIngredients() {
    return this.ingredients;
  }

  // Lấy công thức cho món
  getRecipe(itemId) {
    return this.recipes[itemId] || {};
  }

  // Lấy tất cả công thức
  getAllRecipes() {
    return this.recipes;
  }

  // Cập nhật công thức
  async updateRecipe(itemId, recipe) {
    this.recipes[itemId] = recipe;
    
    
    if (this.useMockAPI) {
      try {
        const menuItem = this.menuItems.find(item => item.id === itemId);
        const mockAPIRecipe = mockAPIService.convertToMockAPIFormat(itemId, recipe, menuItem, this.ingredients);
        
        // Debug: Kiểm tra tất cả recipes trước
        try {
          await mockAPIService.debugGetAllRecipes();
        } catch (debugError) {
        }
        
        // Debug: Kiểm tra recipe cụ thể
        try {
          await mockAPIService.debugGetRecipeById(itemId);
        } catch (debugError) {
        }
        
        // Kiểm tra xem recipe đã tồn tại trong MockAPI chưa
        const recipeExists = await mockAPIService.checkRecipeExists(itemId);
        
        if (recipeExists) {
          // Recipe đã tồn tại, cập nhật
          await mockAPIService.updateRecipe(itemId, mockAPIRecipe);
        } else {
          // Recipe chưa tồn tại, tạo mới
          await mockAPIService.createRecipe(mockAPIRecipe);
        }
      } catch (error) {
        toastService.error('Lỗi khi cập nhật công thức trong MockAPI');
        throw error;
      }
    } else {
      await this.saveRecipesToAPI();
    }
  }

  // Thêm món mới
  async addMenuItem(item) {
    const newId = Math.max(...this.menuItems.map(i => i.id), 0) + 1;
    const newItem = { ...item, id: newId };
    this.menuItems.push(newItem);
    
    if (this.useMockAPI) {
      // Chỉ lưu vào MockAPI, không fallback local
    } else {
      await this.saveMenuItemsToAPI();
    }
    return newItem;
  }

  // Cập nhật món
  async updateMenuItem(itemId, updates) {
    const index = this.menuItems.findIndex(item => item.id === itemId);
    if (index !== -1) {
      this.menuItems[index] = { ...this.menuItems[index], ...updates };
      
      if (this.useMockAPI) {
        // Chỉ lưu vào MockAPI, không fallback local
      } else {
        await this.saveMenuItemsToAPI();
      }
    }
  }

  // Xóa món
  async deleteMenuItem(itemId) {
    this.menuItems = this.menuItems.filter(item => item.id !== itemId);
    delete this.recipes[itemId];
    
    if (this.useMockAPI) {
      // Xóa recipe khỏi MockAPI nếu có
      try {
        await mockAPIService.deleteRecipe(itemId);
      } catch (error) {
        toastService.error('Lỗi khi xóa công thức khỏi MockAPI');
        throw error;
      }
    } else {
      await this.saveMenuItemsToAPI();
      await this.saveRecipesToAPI();
    }
  }

  // Thêm nguyên liệu mới
  async addIngredient(ingredient) {
    if (this.useMockAPI) {
      try {
        const newIngredient = await mockAPIService.createIngredient(ingredient);
        this.ingredients.push(newIngredient);
        return newIngredient;
      } catch (error) {
        toastService.error('Lỗi khi tạo nguyên liệu trong MockAPI');
        throw error;
      }
    } else {
      const newId = Math.max(...this.ingredients.map(i => i.id), 0) + 1;
      const newIngredient = { ...ingredient, id: newId };
      this.ingredients.push(newIngredient);
      await this.saveIngredientsToAPI();
      return newIngredient;
    }
  }

  // Cập nhật nguyên liệu
  async updateIngredient(ingredientId, updates) {
    const index = this.ingredients.findIndex(ing => ing.id === ingredientId);
    if (index !== -1) {
      this.ingredients[index] = { ...this.ingredients[index], ...updates };
      
      if (this.useMockAPI) {
        try {
          const ingredientExists = await mockAPIService.checkIngredientExists(ingredientId);
          
          if (ingredientExists) {
            // Ingredient đã tồn tại, cập nhật
            await mockAPIService.updateIngredient(ingredientId, this.ingredients[index]);
          } else {
            // Ingredient chưa tồn tại, tạo mới
            await mockAPIService.createIngredient(this.ingredients[index]);
          }
        } catch (error) {
          toastService.error('Lỗi khi cập nhật nguyên liệu trong MockAPI');
          throw error;
        }
      } else {
        await this.saveIngredientsToAPI();
      }
    }
  }

  // Xóa nguyên liệu
  async deleteIngredient(ingredientId) {
    
    // Tìm ingredient trước khi xóa để debug
    const ingredientToDelete = this.ingredients.find(ing => ing.id === ingredientId);
    if (ingredientToDelete) {
    } else {
    }
    
    // Xóa nguyên liệu khỏi local data
    this.ingredients = this.ingredients.filter(ing => ing.id !== ingredientId);
    
    // Xóa nguyên liệu khỏi tất cả công thức
    const updatedRecipes = {};
    Object.keys(this.recipes).forEach(itemId => {
      const recipe = { ...this.recipes[itemId] };
      delete recipe[ingredientId];
      updatedRecipes[itemId] = recipe;
    });
    this.recipes = updatedRecipes;
    
    if (this.useMockAPI) {
      try {
        // Xóa ingredient trong MockAPI
        await mockAPIService.deleteIngredient(ingredientId);
        
        // Cập nhật tất cả recipes trong MockAPI
        const updatePromises = Object.keys(this.recipes).map(itemId => 
          this.updateRecipe(itemId, this.recipes[itemId])
        );
        await Promise.all(updatePromises);
        
      } catch (error) {
        toastService.error('Lỗi khi xóa nguyên liệu trong MockAPI');
        throw error;
      }
    } else {
      await this.saveIngredientsToAPI();
      await this.saveRecipesToAPI();
    }
  }

  // Thêm recipe mới (tương thích với MockAPI)
  async addRecipe(itemId, recipe) {
    this.recipes[itemId] = recipe;
    
    if (this.useMockAPI) {
      try {
        const menuItem = this.menuItems.find(item => item.id === itemId);
        const mockAPIRecipe = mockAPIService.convertToMockAPIFormat(itemId, recipe, menuItem, this.ingredients);
        await mockAPIService.createRecipe(mockAPIRecipe);
      } catch (error) {
        toastService.error('Lỗi khi tạo công thức trong MockAPI');
        throw error;
      }
    } else {
      await this.saveRecipesToAPI();
    }
  }

  // Xóa recipe (tương thích với MockAPI)
  async deleteRecipe(itemId) {
    delete this.recipes[itemId];
    
    if (this.useMockAPI) {
      try {
        await mockAPIService.deleteRecipe(itemId);
      } catch (error) {
        toastService.error('Lỗi khi xóa công thức trong MockAPI');
        throw error;
      }
    } else {
      await this.saveRecipesToAPI();
    }
  }

  // Toggle MockAPI mode
  toggleMockAPIMode() {
    this.useMockAPI = !this.useMockAPI;
    return this.useMockAPI;
  }

  // Lấy trạng thái MockAPI
  isMockAPIEnabled() {
    return this.useMockAPI;
  }

  // Kiểm tra trạng thái MockAPI
  checkMockAPIStatus() {
    const status = {
      mockAPI: {
        enabled: this.useMockAPI,
        ingredients: this.ingredients.length,
        recipes: Object.keys(this.recipes).length,
        menuItems: this.menuItems.length
      }
    };
    
    return status;
  }

  // Lấy dữ liệu menu items mặc định
  getDefaultMenuItems() {
    return [
      { "id": 1, "name": "Cà phê đen" },
      { "id": 2, "name": "Cà phê sữa" },
      { "id": 3, "name": "Sinh tố bơ" },
      { "id": 4, "name": "Cacao sữa" },
      { "id": 5, "name": "Bạc xiu" },
      { "id": 6, "name": "Americano" },
      { "id": 7, "name": "Sữa tươi cafe" },
      { "id": 8, "name": "Cafe muối" },
      { "id": 9, "name": "Cacao muối" },
      { "id": 10, "name": "Cacao đá xay" },
      { "id": 11, "name": "Cà phê đá xay" },
      { "id": 12, "name": "Ép táo" },
      { "id": 13, "name": "Ép cam" },
      { "id": 14, "name": "Ép thơm" },
      { "id": 15, "name": "Dừa tươi" },
      { "id": 16, "name": "Sinh tố dừa" },
      { "id": 17, "name": "Matcha sữa yến mạch" },
      { "id": 18, "name": "Sữa chua đá" },
      { "id": 19, "name": "Sữa chua việt quất" },
      { "id": 20, "name": "Trà gừng" },
      { "id": 21, "name": "Nước sấu" }
    ];
  }

  // Sync dữ liệu từ local lên MockAPI
  async syncToMockAPI() {
    if (!this.useMockAPI) {
      return;
    }

    try {
      
      // Sync ingredients
      for (const ingredient of this.ingredients) {
        try {
          await mockAPIService.createIngredient(ingredient);
        } catch (error) {
          if (error.message.includes('409')) {
            // Ingredient đã tồn tại, bỏ qua
          } else {
          }
        }
      }
      
      // Sync recipes
      for (const [itemId, recipe] of Object.entries(this.recipes)) {
        try {
          await this.updateRecipe(itemId, recipe);
        } catch (error) {
        }
      }
      
    } catch (error) {
    }
  }

  // Lấy dữ liệu bán hàng theo ngày
  getSalesByDate(date) {
    return this.sales[date] || {};
  }

  // Cập nhật dữ liệu bán hàng
  updateSales(date, salesData) {
    this.sales[date] = salesData;
    this.saveSalesToLocalStorage();
  }

  // Đọc dữ liệu từ MockAPI
  async loadDataFromAPI() {
    if (!this.useMockAPI) {
      throw new Error('MockAPI không được bật');
    }

    try {
      
      // Load ingredients từ MockAPI
      this.ingredients = await mockAPIService.getAllIngredients();

      // Load recipes từ MockAPI
      const mockAPIRecipes = await mockAPIService.getAllRecipes();
      this.recipes = mockAPIService.convertFromMockAPIFormat(mockAPIRecipes);

      // Load menu items từ MockAPI (tạo từ recipes)
      this.menuItems = this.getDefaultMenuItems();

      // Load sales từ localStorage
      this.loadSalesFromLocalStorage();
      
    } catch (error) {
      toastService.error('Không thể kết nối đến MockAPI. Vui lòng kiểm tra kết nối mạng.');
      throw error;
    }
  }





  // Lưu sales vào localStorage
  saveSalesToLocalStorage() {
    try {
      localStorage.setItem('ingredientsTool_sales', JSON.stringify(this.sales));
    } catch (error) {
    }
  }

  // Load sales từ localStorage
  loadSalesFromLocalStorage() {
    try {
      const savedSales = localStorage.getItem('ingredientsTool_sales');
      if (savedSales) {
        this.sales = JSON.parse(savedSales);
      }
    } catch (error) {
    }
  }



  // Khởi tạo service
  async init() {
    if (this.isInitialized) {
      return; // Đã khởi tạo rồi
    }
    
    if (this.useMockAPI) {
      // Chỉ load từ MockAPI
      try {
        await this.loadDataFromAPI();
      } catch (error) {
        toastService.error('Không thể kết nối đến MockAPI. Vui lòng kiểm tra kết nối mạng.');
        throw error;
      }
    } else {
      // MockAPI bị tắt - không hỗ trợ
      toastService.error('MockAPI phải được bật để sử dụng ứng dụng');
      throw new Error('MockAPI phải được bật');
    }
    
    this.isInitialized = true;
  }
}

// Tạo instance duy nhất
const dataService = new DataService();

export default dataService;
