// dataService.js
// Service quản lý state dữ liệu trong app và đồng bộ với MockAPI

import mockAPIService from './mockAPIService';
import toastService from './toastService';

function arrayToMapById(arr) {
  const map = {};
  for (const item of arr || []) {
    if (item && item.id != null) {
      map[item.id] = item;
    }
  }
  return map;
}

// Suy ra menu items từ recipes:
// - Mặc định: giữ lại các field top-level của recipe (id, name, price, ...)
// - Không ép buộc schema cứng vì mỗi MockAPI có thể khác nhau
function deriveMenuItemsFromRecipes(recipesArray) {
  return (recipesArray || []).map((r) => {
    if (!r || r.id == null) return null;
    // Giữ các field top level của recipe như name, price, category... nếu có
    const {
      id,
      name,
      title, // fallback nếu backend dùng "title"
      // eslint-disable-next-line no-unused-vars
      ingredients, // bỏ qua field ingredients trong menuItems nếu không cần hiển thị
      ...rest
    } = r;

    return {
      id,
      name: name || title || `Món ${id}`,
      ...rest,
    };
  }).filter(Boolean);
}

class DataService {
  constructor() {
    this.menuItems = [];
    this.ingredients = [];
    this.recipes = {}; // map theo id
    this.sales = {};
    this.useMockAPI = true;
    this.isInitialized = false;
  }

  // Khởi tạo: tải ingredients + recipes từ MockAPI và suy ra menuItems
  async init() {
    if (this.isInitialized) return;
    try {
      if (this.useMockAPI) {
        const [ingredientsArr, recipesArr] = await Promise.all([
          mockAPIService.getIngredients(),
          mockAPIService.getRecipes(),
        ]);

        this.ingredients = Array.isArray(ingredientsArr) ? ingredientsArr : [];
        const recipesArray = Array.isArray(recipesArr) ? recipesArr : [];
        this.recipes = arrayToMapById(recipesArray);
        this.menuItems = deriveMenuItemsFromRecipes(recipesArray);
      }

      this.isInitialized = true;
    } catch (error) {
      toastService.error('Không thể tải dữ liệu từ MockAPI');
      // Giữ state trống để app vẫn chạy
      this.ingredients = [];
      this.recipes = {};
      this.menuItems = [];
      this.isInitialized = true;
    }
  }

  // Getters
  getMenuItems() {
    return this.menuItems;
  }

  getIngredients() {
    return this.ingredients;
  }

  getRecipe(itemId) {
    return this.recipes[itemId] || {};
  }

  getAllRecipes() {
    return this.recipes;
  }

  // Cập nhật / tạo mới recipe
  // - itemId: id của món (recipe id)
  // - recipe: dữ liệu recipe đầy đủ sẽ lưu lên MockAPI
  async updateRecipe(itemId, recipe) {
    try {
      let saved;
      if (!this.useMockAPI) {
        // Chế độ offline (nếu có): cập nhật cục bộ
        const id = itemId ?? (recipe && recipe.id);
        if (!id) throw new Error('Thiếu id cho recipe');
        this.recipes[id] = { ...(recipe || {}), id };
        // Suy lại menu items
        this.menuItems = deriveMenuItemsFromRecipes(Object.values(this.recipes));
        return this.recipes[id];
      }

      // Online: gọi MockAPI
      const id = itemId ?? (recipe && recipe.id);
      if (id) {
        saved = await mockAPIService.updateRecipe(id, { ...recipe, id });
      } else {
        saved = await mockAPIService.createRecipe(recipe);
      }

      // Đồng bộ cache cục bộ
      if (!saved || saved.id == null) {
        throw new Error('MockAPI không trả về id cho recipe');
      }
      this.recipes[saved.id] = saved;

      // Cập nhật lại menuItems từ toàn bộ danh sách recipes hiện có
      this.menuItems = deriveMenuItemsFromRecipes(Object.values(this.recipes));

      return saved;
    } catch (error) {
      toastService.error('Cập nhật công thức thất bại');
      throw error;
    }
  }

  // Xóa "món" = xóa recipe trên MockAPI và cập nhật lại menuItems
  async deleteMenuItem(menuItemId) {
    try {
      if (!menuItemId) throw new Error('Thiếu menuItemId');

      if (this.useMockAPI) {
        await mockAPIService.deleteRecipe(menuItemId);
      }

      // Xóa khỏi cache cục bộ
      delete this.recipes[menuItemId];
      this.menuItems = deriveMenuItemsFromRecipes(Object.values(this.recipes));

      return { success: true };
    } catch (error) {
      console.error('Lỗi xóa món:', error);
      return { success: false, error: error.toString() };
    }
  }
}

const dataService = new DataService();
export default dataService;