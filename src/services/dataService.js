import mockAPIService from './mockAPIService';

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
        
        // Kiểm tra xem recipe đã tồn tại trong MockAPI chưa
        try {
          await mockAPIService.getRecipeById(itemId);
          // Recipe đã tồn tại, cập nhật
          await mockAPIService.updateRecipe(itemId, mockAPIRecipe);
        } catch (error) {
          // Recipe chưa tồn tại, tạo mới
          await mockAPIService.createRecipe(mockAPIRecipe);
        }
        
        console.log('Đã cập nhật recipe trong MockAPI');
      } catch (error) {
        console.error('Lỗi khi cập nhật recipe trong MockAPI:', error);
        // Fallback to local storage
        await this.saveRecipesToAPI();
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
    await this.saveMenuItemsToAPI();
    return newItem;
  }

  // Cập nhật món
  async updateMenuItem(itemId, updates) {
    const index = this.menuItems.findIndex(item => item.id === itemId);
    if (index !== -1) {
      this.menuItems[index] = { ...this.menuItems[index], ...updates };
      await this.saveMenuItemsToAPI();
    }
  }

  // Xóa món
  async deleteMenuItem(itemId) {
    this.menuItems = this.menuItems.filter(item => item.id !== itemId);
    delete this.recipes[itemId];
    await this.saveMenuItemsToAPI();
    await this.saveRecipesToAPI();
  }

  // Thêm nguyên liệu mới
  async addIngredient(ingredient) {
    if (this.useMockAPI) {
      try {
        const newIngredient = await mockAPIService.createIngredient(ingredient);
        this.ingredients.push(newIngredient);
        console.log('Đã tạo ingredient mới trong MockAPI');
        return newIngredient;
      } catch (error) {
        console.error('Lỗi khi tạo ingredient trong MockAPI:', error);
        // Fallback to local
        const newId = Math.max(...this.ingredients.map(i => i.id), 0) + 1;
        const newIngredient = { ...ingredient, id: newId };
        this.ingredients.push(newIngredient);
        await this.saveIngredientsToAPI();
        return newIngredient;
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
          await mockAPIService.updateIngredient(ingredientId, this.ingredients[index]);
          console.log('Đã cập nhật ingredient trong MockAPI');
        } catch (error) {
          console.error('Lỗi khi cập nhật ingredient trong MockAPI:', error);
          await this.saveIngredientsToAPI();
        }
      } else {
        await this.saveIngredientsToAPI();
      }
    }
  }

  // Xóa nguyên liệu
  async deleteIngredient(ingredientId) {
    console.log('Attempting to delete ingredient with ID:', ingredientId);
    console.log('Current ingredients before delete:', this.ingredients.length);
    
    // Tìm ingredient trước khi xóa để debug
    const ingredientToDelete = this.ingredients.find(ing => ing.id === ingredientId);
    if (ingredientToDelete) {
      console.log('Found ingredient to delete:', ingredientToDelete);
    } else {
      console.log('Ingredient not found in local data, ID:', ingredientId);
    }
    
    // Xóa nguyên liệu khỏi local data
    this.ingredients = this.ingredients.filter(ing => ing.id !== ingredientId);
    console.log('Ingredients after local delete:', this.ingredients.length);
    
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
        console.log('Deleting ingredient from MockAPI with ID:', ingredientId);
        await mockAPIService.deleteIngredient(ingredientId);
        console.log('Đã xóa ingredient trong MockAPI');
        
        // Cập nhật tất cả recipes trong MockAPI
        const updatePromises = Object.keys(this.recipes).map(itemId => 
          this.updateRecipe(itemId, this.recipes[itemId])
        );
        await Promise.all(updatePromises);
        console.log('Đã cập nhật tất cả recipes sau khi xóa ingredient');
        
      } catch (error) {
        console.error('Lỗi khi xóa ingredient trong MockAPI:', error);
        
        // Nếu là lỗi 404 (ingredient không tồn tại trong MockAPI), chỉ cần sync local data
        if (error.message.includes('404')) {
          console.log('Ingredient không tồn tại trong MockAPI, chỉ cần sync local data');
          await this.saveIngredientsToAPI();
          await this.saveRecipesToAPI();
        } else {
          // Lỗi khác, fallback to local storage
          await this.saveIngredientsToAPI();
          await this.saveRecipesToAPI();
        }
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
        console.log('Đã tạo recipe mới trong MockAPI');
      } catch (error) {
        console.error('Lỗi khi tạo recipe trong MockAPI:', error);
        await this.saveRecipesToAPI();
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
        console.log('Đã xóa recipe trong MockAPI');
      } catch (error) {
        console.error('Lỗi khi xóa recipe trong MockAPI:', error);
        await this.saveRecipesToAPI();
      }
    } else {
      await this.saveRecipesToAPI();
    }
  }

  // Toggle MockAPI mode
  toggleMockAPIMode() {
    this.useMockAPI = !this.useMockAPI;
    console.log('MockAPI mode:', this.useMockAPI ? 'ON' : 'OFF');
    return this.useMockAPI;
  }

  // Lấy trạng thái MockAPI
  isMockAPIEnabled() {
    return this.useMockAPI;
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
      console.log('MockAPI không được bật, không thể sync');
      return;
    }

    try {
      console.log('Bắt đầu sync dữ liệu lên MockAPI...');
      
      // Sync ingredients
      for (const ingredient of this.ingredients) {
        try {
          await mockAPIService.createIngredient(ingredient);
          console.log('Đã sync ingredient:', ingredient.name);
        } catch (error) {
          if (error.message.includes('409')) {
            // Ingredient đã tồn tại, bỏ qua
            console.log('Ingredient đã tồn tại:', ingredient.name);
          } else {
            console.error('Lỗi khi sync ingredient:', ingredient.name, error);
          }
        }
      }
      
      // Sync recipes
      for (const [itemId, recipe] of Object.entries(this.recipes)) {
        try {
          await this.updateRecipe(itemId, recipe);
          console.log('Đã sync recipe cho item:', itemId);
        } catch (error) {
          console.error('Lỗi khi sync recipe cho item:', itemId, error);
        }
      }
      
      console.log('Hoàn thành sync dữ liệu lên MockAPI');
    } catch (error) {
      console.error('Lỗi khi sync dữ liệu lên MockAPI:', error);
    }
  }

  // Lấy dữ liệu bán hàng theo ngày
  getSalesByDate(date) {
    return this.sales[date] || {};
  }

  // Cập nhật dữ liệu bán hàng
  updateSales(date, salesData) {
    this.sales[date] = salesData;
    this.saveToLocalStorage();
  }

  // Đọc dữ liệu từ MockAPI
  async loadDataFromAPI() {
    try {
      console.log('Bắt đầu load dữ liệu từ MockAPI...');
      
      // Load ingredients từ MockAPI
      if (this.useMockAPI) {
        try {
          this.ingredients = await mockAPIService.getAllIngredients();
          console.log('Đã load ingredients từ MockAPI:', this.ingredients.length, 'ingredients');
        } catch (mockAPIError) {
          console.error('Lỗi khi load ingredients từ MockAPI:', mockAPIError);
          throw mockAPIError;
        }

        // Load recipes từ MockAPI
        try {
          const mockAPIRecipes = await mockAPIService.getAllRecipes();
          this.recipes = mockAPIService.convertFromMockAPIFormat(mockAPIRecipes);
          console.log('Đã load recipes từ MockAPI:', Object.keys(this.recipes).length, 'recipes');
        } catch (mockAPIError) {
          console.error('Lỗi khi load recipes từ MockAPI:', mockAPIError);
          throw mockAPIError;
        }
      }

      // Load menu items từ file JSON (fallback)
      try {
        const menuResponse = await fetch('/data/menuItems.json');
        if (menuResponse.ok) {
          const contentType = menuResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            this.menuItems = await menuResponse.json();
            console.log('Đã load menu items từ file JSON:', this.menuItems.length, 'menu items');
          } else {
            console.log('Response không phải JSON, sử dụng dữ liệu mặc định');
            this.menuItems = this.getDefaultMenuItems();
          }
        } else {
          console.log('Không thể load menu items từ file, sử dụng dữ liệu mặc định');
          this.menuItems = this.getDefaultMenuItems();
        }
      } catch (error) {
        console.error('Lỗi khi load menu items:', error);
        console.log('Sử dụng dữ liệu mặc định cho menu items');
        this.menuItems = this.getDefaultMenuItems();
      }

      // Load sales từ localStorage
      this.loadSalesFromLocalStorage();
    } catch (error) {
      console.error('Lỗi khi load dữ liệu từ MockAPI:', error);
      // Fallback to file loading
      await this.loadDataFromFiles();
    }
  }

  // Đọc dữ liệu từ file JSON (fallback)
  async loadDataFromFiles() {
    try {
      // Load menu items
      try {
        const menuResponse = await fetch('/data/menuItems.json');
        if (menuResponse.ok) {
          const contentType = menuResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            this.menuItems = await menuResponse.json();
            console.log('Đã load menu items từ file JSON:', this.menuItems.length, 'menu items');
          } else {
            console.log('Response không phải JSON, sử dụng dữ liệu mặc định');
            this.menuItems = this.getDefaultMenuItems();
          }
        } else {
          console.log('Không thể load menu items từ file, sử dụng dữ liệu mặc định');
          this.menuItems = this.getDefaultMenuItems();
        }
      } catch (error) {
        console.error('Lỗi khi load menu items:', error);
        this.menuItems = this.getDefaultMenuItems();
      }

      // Load ingredients
      const ingredientsResponse = await fetch('/data/ingredients.json');
      if (ingredientsResponse.ok) {
        this.ingredients = await ingredientsResponse.json();
      }

      // Load recipes
      const recipesResponse = await fetch('/data/recipes.json');
      if (recipesResponse.ok) {
        this.recipes = await recipesResponse.json();
      }

      // Load sales từ localStorage
      this.loadSalesFromLocalStorage();
    } catch (error) {
      console.error('Lỗi khi load dữ liệu từ file:', error);
      // Fallback to default data
      this.menuItems = this.getDefaultMenuItems();
    }
  }

  // Lưu menu items vào API
  async saveMenuItemsToAPI() {
    try {
      const response = await fetch('http://localhost:3001/api/menuItems', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.menuItems)
      });
      
      if (response.ok) {
        console.log('Đã lưu menuItems vào file JSON');
        // Lưu vào localStorage như backup
        localStorage.setItem('ingredientsTool_menuItems', JSON.stringify(this.menuItems));
      } else {
        throw new Error('Không thể lưu menuItems');
      }
    } catch (error) {
      console.error('Lỗi khi lưu menuItems:', error);
      // Fallback to localStorage
      localStorage.setItem('ingredientsTool_menuItems', JSON.stringify(this.menuItems));
    }
  }

  // Lưu ingredients vào API
  async saveIngredientsToAPI() {
    try {
      const response = await fetch('http://localhost:3001/api/ingredients', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.ingredients)
      });
      
      if (response.ok) {
        console.log('Đã lưu ingredients vào file JSON');
        localStorage.setItem('ingredientsTool_ingredients', JSON.stringify(this.ingredients));
      } else {
        throw new Error('Không thể lưu ingredients');
      }
    } catch (error) {
      console.error('Lỗi khi lưu ingredients:', error);
      localStorage.setItem('ingredientsTool_ingredients', JSON.stringify(this.ingredients));
    }
  }

  // Lưu recipes vào API
  async saveRecipesToAPI() {
    try {
      const response = await fetch('http://localhost:3001/api/recipes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.recipes)
      });
      
      if (response.ok) {
        console.log('Đã lưu recipes vào file JSON');
        localStorage.setItem('ingredientsTool_recipes', JSON.stringify(this.recipes));
      } else {
        throw new Error('Không thể lưu recipes');
      }
    } catch (error) {
      console.error('Lỗi khi lưu recipes:', error);
      localStorage.setItem('ingredientsTool_recipes', JSON.stringify(this.recipes));
    }
  }

  // Lưu sales vào localStorage
  saveSalesToLocalStorage() {
    try {
      localStorage.setItem('ingredientsTool_sales', JSON.stringify(this.sales));
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu sales:', error);
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
      console.error('Lỗi khi load dữ liệu sales:', error);
    }
  }

  // Lưu vào localStorage (backup)
  saveToLocalStorage() {
    try {
      localStorage.setItem('ingredientsTool_menuItems', JSON.stringify(this.menuItems));
      localStorage.setItem('ingredientsTool_ingredients', JSON.stringify(this.ingredients));
      localStorage.setItem('ingredientsTool_recipes', JSON.stringify(this.recipes));
      this.saveSalesToLocalStorage();
    } catch (error) {
      console.error('Lỗi khi lưu vào localStorage:', error);
    }
  }

  // Load từ localStorage (backup)
  loadFromLocalStorage() {
    try {
      const savedMenuItems = localStorage.getItem('ingredientsTool_menuItems');
      const savedIngredients = localStorage.getItem('ingredientsTool_ingredients');
      const savedRecipes = localStorage.getItem('ingredientsTool_recipes');
      
      if (savedMenuItems) {
        this.menuItems = JSON.parse(savedMenuItems);
      }
      
      if (savedIngredients) {
        this.ingredients = JSON.parse(savedIngredients);
      }
      
      if (savedRecipes) {
        this.recipes = JSON.parse(savedRecipes);
      }
      
      this.loadSalesFromLocalStorage();
    } catch (error) {
      console.error('Lỗi khi load dữ liệu từ localStorage:', error);
    }
  }

  // Khởi tạo service
  async init() {
    if (this.isInitialized) {
      console.log('DataService đã được khởi tạo rồi');
      return; // Đã khởi tạo rồi
    }
    
    console.log('Bắt đầu khởi tạo DataService, MockAPI mode:', this.useMockAPI);
    
    if (this.useMockAPI) {
      // Thử load từ MockAPI trước, nếu không được thì load từ file JSON, cuối cùng là localStorage
      try {
        console.log('Đang thử load từ MockAPI...');
        await this.loadDataFromAPI();
        console.log('DataService initialized with MockAPI');
      } catch (error) {
        console.log('Không thể load từ MockAPI, thử load từ file JSON:', error);
        try {
          await this.loadDataFromFiles();
          console.log('DataService initialized with local files');
        } catch (fileError) {
          console.log('Không thể load từ file JSON, sử dụng localStorage:', fileError);
          this.loadFromLocalStorage();
          console.log('DataService initialized with localStorage');
        }
      }
    } else {
      // Chỉ sử dụng localStorage khi MockAPI bị tắt
      console.log('MockAPI bị tắt, sử dụng localStorage');
      this.loadFromLocalStorage();
      console.log('DataService initialized with localStorage');
    }
    
    this.isInitialized = true;
    console.log('DataService khởi tạo hoàn tất');
  }
}

// Tạo instance duy nhất
const dataService = new DataService();

export default dataService;
