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

  // Đọc dữ liệu từ API
  async loadDataFromAPI() {
    try {
      const baseURL = 'http://localhost:3001/api';
      
      // Load menu items
      const menuResponse = await fetch(`${baseURL}/menuItems`);
      if (menuResponse.ok) {
        this.menuItems = await menuResponse.json();
      }

      // Load ingredients - sử dụng MockAPI nếu được bật
      if (this.useMockAPI) {
        try {
          this.ingredients = await mockAPIService.getAllIngredients();
          console.log('Đã load ingredients từ MockAPI');
        } catch (mockAPIError) {
          console.error('Lỗi khi load ingredients từ MockAPI, fallback to local API:', mockAPIError);
          const ingredientsResponse = await fetch(`${baseURL}/ingredients`);
          if (ingredientsResponse.ok) {
            this.ingredients = await ingredientsResponse.json();
          }
        }
      } else {
        const ingredientsResponse = await fetch(`${baseURL}/ingredients`);
        if (ingredientsResponse.ok) {
          this.ingredients = await ingredientsResponse.json();
        }
      }

      // Load recipes - sử dụng MockAPI nếu được bật
      if (this.useMockAPI) {
        try {
          const mockAPIRecipes = await mockAPIService.getAllRecipes();
          this.recipes = mockAPIService.convertFromMockAPIFormat(mockAPIRecipes);
          console.log('Đã load recipes từ MockAPI');
        } catch (mockAPIError) {
          console.error('Lỗi khi load recipes từ MockAPI, fallback to local API:', mockAPIError);
          const recipesResponse = await fetch(`${baseURL}/recipes`);
          if (recipesResponse.ok) {
            this.recipes = await recipesResponse.json();
          }
        }
      } else {
        const recipesResponse = await fetch(`${baseURL}/recipes`);
        if (recipesResponse.ok) {
          this.recipes = await recipesResponse.json();
        }
      }

      // Load sales từ localStorage
      this.loadSalesFromLocalStorage();
    } catch (error) {
      console.error('Lỗi khi load dữ liệu từ API:', error);
      // Fallback to file loading
      await this.loadDataFromFiles();
    }
  }

  // Đọc dữ liệu từ file JSON (fallback)
  async loadDataFromFiles() {
    try {
      // Load menu items
      const menuResponse = await fetch('/data/menuItems.json');
      if (menuResponse.ok) {
        this.menuItems = await menuResponse.json();
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
      return; // Đã khởi tạo rồi
    }
    
    if (this.useMockAPI) {
      // Thử load từ API trước, nếu không được thì load từ file JSON, cuối cùng là localStorage
      try {
        await this.loadDataFromAPI();
        console.log('DataService initialized with MockAPI');
      } catch (error) {
        console.log('Không thể load từ API, thử load từ file JSON:', error);
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
  }
}

// Tạo instance duy nhất
const dataService = new DataService();

export default dataService;
