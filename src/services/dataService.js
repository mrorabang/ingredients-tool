import firebaseService from './firebaseService';
import toastService from './toastService';

// Service để quản lý dữ liệu - Đọc/ghi từ file JSON và MockAPI
class DataService {
  constructor() {
    // Dữ liệu sẽ được load từ Firebase
    this.menuItems = [];
    this.ingredients = [];
    this.recipes = {};
    this.sales = {};
    this.useFirebase = true; // Flag để bật/tắt Firebase
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
    
    if (this.useFirebase) {
      try {
        const menuItem = this.menuItems.find(item => item.id === itemId);
        const firebaseRecipe = firebaseService.convertToMockAPIFormat(itemId, recipe, menuItem, this.ingredients);
        
        // Kiểm tra xem recipe đã tồn tại trong Firebase chưa
        const recipeExists = await firebaseService.checkRecipeExists(itemId);
        
        if (recipeExists) {
          // Recipe đã tồn tại, cập nhật
          await firebaseService.updateRecipe(itemId, firebaseRecipe);
        } else {
          // Recipe chưa tồn tại, tạo mới
          await firebaseService.createRecipe(firebaseRecipe);
        }
      } catch (error) {
        toastService.error('Lỗi khi cập nhật công thức trong Firebase');
        throw error;
      }
    } else {
      throw new Error('Firebase không được bật');
    }
  }

  // Thêm món mới
  async addMenuItem(item) {
    const newId = Math.max(...this.menuItems.map(i => i.id), 0) + 1;
    const newItem = { ...item, id: newId };
    this.menuItems.push(newItem);
    
    if (this.useFirebase) {
      try {
        // Tạo recipe mới trong Firebase
        const firebaseRecipe = firebaseService.convertToMockAPIFormat(
          newId,
          item.ingredients || {},
          newItem,
          this.ingredients
        );
        
        console.log('🔍 [DataService] Creating new recipe in Firebase:', firebaseRecipe);
        await firebaseService.createRecipe(firebaseRecipe);
        console.log('[DataService] Recipe created successfully in Firebase');
      } catch (error) {
        console.error('❌ [DataService] Error creating recipe in Firebase:', error);
        toastService.error('Lỗi khi tạo công thức trong Firebase');
        throw error;
      }
    } else {
      throw new Error('Firebase không được bật');
    }
    return newItem;
  }

  // Cập nhật món
  async updateMenuItem(itemId, updates) {
    const index = this.menuItems.findIndex(item => item.id === itemId);
    if (index !== -1) {
      this.menuItems[index] = { ...this.menuItems[index], ...updates };
      
      if (this.useFirebase) {
        try {
          // Cập nhật recipe trong Firebase
          const firebaseRecipe = firebaseService.convertToMockAPIFormat(
            itemId,
            updates.ingredients || this.menuItems[index].ingredients || {},
            this.menuItems[index],
            this.ingredients
          );
          
          console.log('🔍 [DataService] Updating recipe in Firebase:', firebaseRecipe);
          await firebaseService.updateRecipe(itemId, firebaseRecipe);
          console.log('✅ [DataService] Recipe updated successfully in Firebase');
        } catch (error) {
          console.error('❌ [DataService] Error updating recipe in Firebase:', error);
          toastService.error('Lỗi khi cập nhật công thức trong Firebase');
          throw error;
        }
      } else {
        throw new Error('Firebase không được bật');
      }
    }
  }

  // Xóa món
  async deleteMenuItem(itemId) {
    console.log('🔍 [DataService] deleteMenuItem - Starting...');
    console.log('🔍 [DataService] Item ID:', itemId);
    
    this.menuItems = this.menuItems.filter(item => item.id !== itemId);
    delete this.recipes[itemId];
    
    if (this.useFirebase) {
      // Xóa recipe khỏi Firebase nếu có
      try {
        console.log('🔍 [DataService] Deleting recipe from Firebase...');
        await firebaseService.deleteRecipe(itemId);
        console.log('✅ [DataService] Recipe deleted successfully from Firebase');
      } catch (error) {
        console.error('❌ [DataService] Error deleting recipe from Firebase:', error);
        toastService.error('Lỗi khi xóa công thức khỏi Firebase');
        throw error;
      }
    } else {
      throw new Error('Firebase không được bật');
    }
  }

  // Thêm nguyên liệu mới
  async addIngredient(ingredient) {
    console.log('🔍 [DataService] addIngredient - Starting...');
    console.log('🔍 [DataService] Ingredient data:', ingredient);
    
    if (this.useFirebase) {
      try {
        console.log('🔍 [DataService] Creating ingredient in Firebase...');
        const newIngredient = await firebaseService.createIngredient(ingredient);
        this.ingredients.push(newIngredient);
        console.log('✅ [DataService] Ingredient created successfully in Firebase');
        return newIngredient;
      } catch (error) {
        console.error('❌ [DataService] Error creating ingredient in Firebase:', error);
        toastService.error('Lỗi khi tạo nguyên liệu trong Firebase');
        throw error;
      }
    } else {
      throw new Error('Firebase không được bật');
    }
  }

  // Cập nhật nguyên liệu
  async updateIngredient(ingredientId, updates) {
    console.log('🔍 [DataService] updateIngredient - Starting...');
    console.log('🔍 [DataService] Ingredient ID:', ingredientId);
    console.log('🔍 [DataService] Updates:', updates);
    
    const index = this.ingredients.findIndex(ing => ing.id === ingredientId);
    if (index !== -1) {
      this.ingredients[index] = { ...this.ingredients[index], ...updates };
      
      if (this.useFirebase) {
        try {
          console.log('🔍 [DataService] Checking if ingredient exists in Firebase...');
          const ingredientExists = await firebaseService.checkIngredientExists(ingredientId);
          
          if (ingredientExists) {
            console.log('🔍 [DataService] Ingredient exists, updating in Firebase...');
            await firebaseService.updateIngredient(ingredientId, this.ingredients[index]);
            console.log('✅ [DataService] Ingredient updated successfully in Firebase');
          } else {
            console.log('🔍 [DataService] Ingredient does not exist, creating in Firebase...');
            await firebaseService.createIngredient(this.ingredients[index]);
            console.log('✅ [DataService] Ingredient created successfully in Firebase');
          }
        } catch (error) {
          console.error('❌ [DataService] Error updating ingredient in Firebase:', error);
          toastService.error('Lỗi khi cập nhật nguyên liệu trong Firebase');
          throw error;
        }
      } else {
        throw new Error('Firebase không được bật');
      }
    }
  }

  // Xóa nguyên liệu
  async deleteIngredient(ingredientId) {
    console.log('🔍 [DataService] deleteIngredient - Starting...');
    console.log('🔍 [DataService] Ingredient ID:', ingredientId);
    
    // Tìm ingredient trước khi xóa để debug
    const ingredientToDelete = this.ingredients.find(ing => ing.id === ingredientId);
    if (ingredientToDelete) {
      console.log('🔍 [DataService] Found ingredient to delete:', ingredientToDelete);
    } else {
      console.log('🔍 [DataService] Ingredient not found in local data');
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
    
    if (this.useFirebase) {
      try {
        // Xóa ingredient trong Firebase
        console.log('🔍 [DataService] Deleting ingredient from Firebase...');
        await firebaseService.deleteIngredient(ingredientId);
        console.log('✅ [DataService] Ingredient deleted successfully from Firebase');
        
        // Cập nhật tất cả recipes trong Firebase
        const updatePromises = Object.keys(this.recipes).map(itemId => 
          this.updateRecipe(itemId, this.recipes[itemId])
        );
        await Promise.all(updatePromises);
        
      } catch (error) {
        toastService.error('Lỗi khi xóa nguyên liệu trong Firebase');
        throw error;
      }
    } else {
      throw new Error('Firebase không được bật');
    }
  }

  // Thêm recipe mới (tương thích với MockAPI)
  async addRecipe(itemId, recipe) {
    this.recipes[itemId] = recipe;
    
    if (this.useFirebase) {
      try {
        const menuItem = this.menuItems.find(item => item.id === itemId);
        const firebaseRecipe = firebaseService.convertToMockAPIFormat(itemId, recipe, menuItem, this.ingredients);
        await firebaseService.createRecipe(firebaseRecipe);
      } catch (error) {
        toastService.error('Lỗi khi tạo công thức trong Firebase');
        throw error;
      }
    } else {
      throw new Error('Firebase không được bật');
    }
  }

  // Xóa recipe (tương thích với MockAPI)
  async deleteRecipe(itemId) {
    delete this.recipes[itemId];
    
    if (this.useFirebase) {
      try {
        await firebaseService.deleteRecipe(itemId);
      } catch (error) {
        toastService.error('Lỗi khi xóa công thức trong Firebase');
        throw error;
      }
    } else {
      throw new Error('Firebase không được bật');
    }
  }

  // Toggle Firebase mode
  toggleFirebaseMode() {
    this.useFirebase = !this.useFirebase;
    return this.useFirebase;
  }

  // Lấy trạng thái Firebase
  isFirebaseEnabled() {
    return this.useFirebase;
  }

  // Kiểm tra trạng thái Firebase
  checkFirebaseStatus() {
    const status = {
      firebase: {
        enabled: this.useFirebase,
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

  // Sync dữ liệu từ local lên Firebase
  async syncToFirebase() {
    if (!this.useFirebase) {
      return;
    }

    try {
      for (const ingredient of this.ingredients) {
        try {
          await firebaseService.createIngredient(ingredient);
        } catch (error) {
        }
      }
      
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

  // Đọc dữ liệu từ Firebase
  async loadDataFromAPI() {
    if (!this.useFirebase) {
      throw new Error('Firebase không được bật');
    }

    try {
      
      // Load ingredients từ Firebase
      this.ingredients = await firebaseService.getAllIngredients();

      // Load recipes từ Firebase
      const firebaseRecipes = await firebaseService.getAllRecipes();
      this.recipes = firebaseService.convertFromMockAPIFormat(firebaseRecipes);

      // Load menu items từ Firebase (tạo từ recipes)
      this.menuItems = this.getDefaultMenuItems();

      // Load sales từ localStorage
      this.loadSalesFromLocalStorage();
      
    } catch (error) {
      toastService.error('Không thể kết nối đến Firebase. Vui lòng kiểm tra cấu hình.');
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
    
    if (this.useFirebase) {
      // Chỉ load từ Firebase
      try {
        await this.loadDataFromAPI();
      } catch (error) {
        toastService.error('Không thể kết nối đến Firebase. Vui lòng kiểm tra cấu hình.');
        throw error;
      }
    } else {
      toastService.error('Firebase phải được bật để sử dụng ứng dụng');
      throw new Error('Firebase phải được bật');
    }
    
    this.isInitialized = true;
  }
}

// Tạo instance duy nhất
const dataService = new DataService();

export default dataService;
