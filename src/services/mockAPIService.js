import toastService from './toastService';

// Service để quản lý kết nối với MockAPI
class MockAPIService {
  constructor() {
    this.baseURL = 'https://68d4a223214be68f8c69d69b.mockapi.io';
    this.recipesEndpoint = `${this.baseURL}/recipes`;
    this.ingredientsEndpoint = `${this.baseURL}/ingredients`;
  }

  // Lấy tất cả recipes từ MockAPI
  async getAllRecipes() {
    try {
      const response = await fetch(this.recipesEndpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const recipes = await response.json();
      return recipes;
    } catch (error) {
      toastService.error('Không thể tải danh sách công thức từ MockAPI');
      throw error;
    }
  }

  // Lấy recipe theo ID từ MockAPI
  async getRecipeById(id) {
    try {
      const response = await fetch(`${this.recipesEndpoint}/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const recipe = await response.json();
      return recipe;
    } catch (error) {
      // Chỉ log error nếu không phải 404 (recipe không tồn tại)
      if (!error.message.includes('404')) {
        toastService.error('Không thể tải công thức từ MockAPI');
      }
      throw error;
    }
  }

  // Lấy recipe theo ID sử dụng filter API
  async getRecipeById(id) {
    try {
      const url = new URL(this.recipesEndpoint);
      url.searchParams.append('id', id);
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {'content-type': 'application/json'},
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const recipes = await response.json();
      return recipes.length > 0 ? recipes[0] : null;
    } catch (error) {
      toastService.error('Không thể lấy công thức từ MockAPI');
      return null;
    }
  }

  // Kiểm tra recipe có tồn tại trong MockAPI không bằng filter API
  async checkRecipeExists(id) {
    try {
      const recipe = await this.getRecipeById(id);
      return recipe !== null;
    } catch (error) {
      toastService.error('Không thể kiểm tra công thức trong MockAPI');
      return false;
    }
  }

  // Tạo recipe mới trong MockAPI
  async createRecipe(recipeData) {
    try {
      const response = await fetch(this.recipesEndpoint, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(recipeData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newRecipe = await response.json();
      // toastService.success('Đã tạo công thức mới trong MockAPI');
      return newRecipe;
    } catch (error) {
      toastService.error('Không thể tạo công thức trong MockAPI');
      throw error;
    }
  }

  // Cập nhật recipe trong MockAPI
  async updateRecipe(id, recipeData) {
    try {
      // Kiểm tra recipe có tồn tại không
      const existingRecipe = await this.getRecipeById(id);
      if (!existingRecipe) {
        throw new Error(`Recipe ID ${id} không tồn tại trong MockAPI`);
      }
      
      // Thử sử dụng direct API để update
      try {
        const response = await fetch(`${this.recipesEndpoint}/${id}`, {
          method: 'PUT',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify(recipeData)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const updatedRecipe = await response.json();
        return updatedRecipe;
      } catch (putError) {
        // Nếu PUT thất bại, thử xóa và tạo mới
        try {
          await this.deleteRecipe(id);
          const newRecipe = await this.createRecipe(recipeData);
          return newRecipe;
        } catch (fallbackError) {
          throw putError; // Throw lỗi PUT gốc
        }
      }
    } catch (error) {
      toastService.error('Không thể cập nhật công thức trong MockAPI');
      throw error;
    }
  }

  // Xóa recipe trong MockAPI
  async deleteRecipe(id) {
    try {
      // Kiểm tra recipe có tồn tại không
      const existingRecipe = await this.getRecipeById(id);
      if (!existingRecipe) {
        return true; // Đã không tồn tại, coi như đã xóa
      }
      
      // Thử sử dụng direct API để xóa
      try {
        const response = await fetch(`${this.recipesEndpoint}/${id}`, {
          method: 'DELETE',
          headers: {'content-type': 'application/json'},
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const deletedRecipe = await response.json();
        // toastService.success('Đã xóa công thức trong MockAPI');
        return true;
      } catch (deleteError) {
        // Nếu DELETE thất bại, coi như đã xóa (MockAPI có thể không hỗ trợ DELETE)
        // toastService.success('Đã xóa công thức trong MockAPI');
        return true;
      }
    } catch (error) {
      toastService.error('Không thể xóa công thức trong MockAPI');
      throw error;
    }
  }

  // Chuyển đổi format từ MockAPI sang format cũ (để tương thích)
  convertFromMockAPIFormat(mockAPIRecipes) {
    const convertedRecipes = {};
    
    mockAPIRecipes.forEach(recipe => {
      // Chỉ xử lý nếu có ingredients
      if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        const ingredients = {};
        recipe.ingredients.forEach(ingredient => {
          // Xử lý cả trường hợp amount là object hoặc primitive
          let amount = ingredient.amount;
          if (typeof amount === 'object' && amount !== null) {
            // Nếu amount là object {amount: 20, unit: "ml"}, lấy giá trị amount
            amount = amount.amount;
          }
          
          // Đảm bảo amount là number nếu có thể
          if (typeof amount === 'string' && !isNaN(amount)) {
            amount = parseFloat(amount);
          }
          
          ingredients[ingredient.ingredientId] = amount;
        });
        
        convertedRecipes[recipe.id] = ingredients;
      }
    });
    
    return convertedRecipes;
  }

  // Lấy tất cả ingredients từ MockAPI
  async getAllIngredients() {
    try {
      const response = await fetch(this.ingredientsEndpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const ingredients = await response.json();
      
      // Debug: tìm ingredient có tên chứa "ổi" hoặc "hồng"
      const oiHong = ingredients.find(ing => 
        ing.name.toLowerCase().includes('ổi') || 
        ing.name.toLowerCase().includes('hồng') ||
        ing.name.includes('Ổi') ||
        ing.name.includes('Hồng')
      );
      if (oiHong) {
      }
      
      return ingredients;
    } catch (error) {
      // toastService.error('Không thể tải danh sách nguyên liệu từ MockAPI');
      throw error;
    }
  }

  // Tạo ingredient mới trong MockAPI
  async createIngredient(ingredientData) {
    try {
      const response = await fetch(this.ingredientsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ingredientData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newIngredient = await response.json();
      // toastService.success('Đã tạo nguyên liệu mới trong MockAPI');
      return newIngredient;
    } catch (error) {
      toastService.error('Không thể tạo nguyên liệu trong MockAPI');
      throw error;
    }
  }

  // Kiểm tra ingredient có tồn tại trong MockAPI không bằng filter
  async checkIngredientExists(id) {
    try {
      const url = new URL(this.ingredientsEndpoint);
      url.searchParams.append('id', id);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {'content-type': 'application/json'},
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const ingredients = await response.json();
      return ingredients.length > 0; // Trả về true nếu tìm thấy ingredient
    } catch (error) {
      toastService.error('Không thể kiểm tra nguyên liệu trong MockAPI');
      return false;
    }
  }

  // Cập nhật ingredient trong MockAPI
  async updateIngredient(id, ingredientData) {
    try {
      const response = await fetch(`${this.ingredientsEndpoint}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ingredientData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedIngredient = await response.json();
      // toastService.success('Đã cập nhật nguyên liệu trong MockAPI');
      return updatedIngredient;
    } catch (error) {
      toastService.error('Không thể cập nhật nguyên liệu trong MockAPI');
      throw error;
    }
  }

  // Xóa ingredient trong MockAPI
  async deleteIngredient(id) {
    try {
      const response = await fetch(`${this.ingredientsEndpoint}/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // toastService.success('Đã xóa nguyên liệu trong MockAPI');
      return true;
    } catch (error) {
      toastService.error('Không thể xóa nguyên liệu trong MockAPI');
      throw error;
    }
  }

  // Chuyển đổi format từ format cũ sang MockAPI format
  convertToMockAPIFormat(recipeId, ingredients, menuItem, ingredientsList) {
    const mockAPIIngredients = Object.entries(ingredients).map(([ingredientId, amount]) => {
      // Tìm ingredient theo id hoặc ingredientId (so sánh string với string)
      const ingredient = ingredientsList.find(ing => 
        ing.id === ingredientId || 
        ing.id === parseInt(ingredientId).toString() ||
        ing.ingredientId === parseInt(ingredientId)
      );
      
      // Đảm bảo amount là primitive value, không phải object
      let cleanAmount = amount;
      if (typeof amount === 'object' && amount !== null) {
        // Nếu amount là object {amount: 20, unit: "ml"}, lấy giá trị amount
        cleanAmount = amount.amount || amount;
      }
      
      return {
        ingredientId: parseInt(ingredientId),
        name: ingredient?.name || `Ingredient ${ingredientId}`,
        amount: cleanAmount,  // Primitive value
        unit: ingredient?.unit || 'g'
      };
    });

    return {
      id: recipeId,
      name: menuItem?.name || 'Unknown Recipe',
      ingredients: mockAPIIngredients
    };
  }
}

// Tạo instance duy nhất
const mockAPIService = new MockAPIService();

export default mockAPIService;
