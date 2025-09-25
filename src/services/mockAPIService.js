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
      console.log('Đã load recipes từ MockAPI:', recipes.length, 'recipes');
      return recipes;
    } catch (error) {
      console.error('Lỗi khi load recipes từ MockAPI:', error);
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
      console.log('Đã load recipe từ MockAPI:', recipe);
      return recipe;
    } catch (error) {
      console.error('Lỗi khi load recipe từ MockAPI:', error);
      throw error;
    }
  }

  // Tạo recipe mới trong MockAPI
  async createRecipe(recipeData) {
    try {
      const response = await fetch(this.recipesEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipeData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newRecipe = await response.json();
      console.log('Đã tạo recipe mới trong MockAPI:', newRecipe);
      return newRecipe;
    } catch (error) {
      console.error('Lỗi khi tạo recipe trong MockAPI:', error);
      throw error;
    }
  }

  // Cập nhật recipe trong MockAPI
  async updateRecipe(id, recipeData) {
    try {
      const response = await fetch(`${this.recipesEndpoint}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipeData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedRecipe = await response.json();
      console.log('Đã cập nhật recipe trong MockAPI:', updatedRecipe);
      return updatedRecipe;
    } catch (error) {
      console.error('Lỗi khi cập nhật recipe trong MockAPI:', error);
      throw error;
    }
  }

  // Xóa recipe trong MockAPI
  async deleteRecipe(id) {
    try {
      const response = await fetch(`${this.recipesEndpoint}/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log('Đã xóa recipe trong MockAPI:', id);
      return true;
    } catch (error) {
      console.error('Lỗi khi xóa recipe trong MockAPI:', error);
      throw error;
    }
  }

  // Chuyển đổi format từ MockAPI sang format cũ (để tương thích)
  convertFromMockAPIFormat(mockAPIRecipes) {
    const convertedRecipes = {};
    
    mockAPIRecipes.forEach(recipe => {
      const ingredients = {};
      recipe.ingredients.forEach(ingredient => {
        ingredients[ingredient.ingredientId] = ingredient.amount;
      });
      
      convertedRecipes[recipe.id] = ingredients;
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
      console.log('Đã load ingredients từ MockAPI:', ingredients.length, 'ingredients');
      console.log('Sample ingredients:', ingredients.slice(0, 3));
      
      // Debug: tìm ingredient có tên chứa "ổi" hoặc "hồng"
      const oiHong = ingredients.find(ing => 
        ing.name.toLowerCase().includes('ổi') || 
        ing.name.toLowerCase().includes('hồng') ||
        ing.name.includes('Ổi') ||
        ing.name.includes('Hồng')
      );
      if (oiHong) {
        console.log('Found ổi hồng ingredient:', oiHong);
      } else {
        console.log('No ổi hồng ingredient found');
      }
      
      return ingredients;
    } catch (error) {
      console.error('Lỗi khi load ingredients từ MockAPI:', error);
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
      console.log('Đã tạo ingredient mới trong MockAPI:', newIngredient);
      return newIngredient;
    } catch (error) {
      console.error('Lỗi khi tạo ingredient trong MockAPI:', error);
      throw error;
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
      console.log('Đã cập nhật ingredient trong MockAPI:', updatedIngredient);
      return updatedIngredient;
    } catch (error) {
      console.error('Lỗi khi cập nhật ingredient trong MockAPI:', error);
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
      
      console.log('Đã xóa ingredient trong MockAPI:', id);
      return true;
    } catch (error) {
      console.error('Lỗi khi xóa ingredient trong MockAPI:', error);
      throw error;
    }
  }

  // Chuyển đổi format từ format cũ sang MockAPI format
  convertToMockAPIFormat(recipeId, ingredients, menuItem, ingredientsList) {
    const mockAPIIngredients = Object.entries(ingredients).map(([ingredientId, amount]) => {
      const ingredient = ingredientsList.find(ing => ing.id === parseInt(ingredientId));
      return {
        ingredientId: parseInt(ingredientId),
        name: ingredient?.name || 'Unknown',
        amount: amount,
        unit: ingredient?.unit || 'g'
      };
    });

    return {
      id: recipeId,
      name: menuItem?.name || 'Unknown Recipe',
      description: menuItem?.description || '',
      category: menuItem?.category || 'Unknown',
      ingredients: mockAPIIngredients,
      instructions: 'Pha chế theo công thức',
      prepTime: 5,
      difficulty: 'Dễ',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}

// Tạo instance duy nhất
const mockAPIService = new MockAPIService();

export default mockAPIService;
