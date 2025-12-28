// Import Firebase modules
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import toastService from './toastService';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAsXppxDg_gcAJJdK08KFyooW0TSxwaQa8",
  authDomain: "nglieu-67e5b.firebaseapp.com",
  projectId: "nglieu-67e5b",
  storageBucket: "nglieu-67e5b.firebasestorage.app",
  messagingSenderId: "937625471592",
  appId: "1:937625471592:web:20de36d7463fa0558c09dd",
  measurementId: "G-QCL0KWRTTG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Analytics có thể lỗi nếu chạy trên localhost/không có window => guard
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  try {
    getAnalytics(app);
  } catch (e) {
  }
}
const db = getFirestore(app);
const auth = getAuth(app);

class FirebaseService {
  constructor() {
    this.db = db;
    this.auth = auth;
    this.useFirebase = true;
  }

  // ===== INGREDIENTS =====

  
  // Lấy tất cả ingredients
  async getAllIngredients() {
    try {
      const snapshot = await getDocs(collection(this.db, 'ingredients'));
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('Error getting ingredients:', error);
      toastService.error('Không thể tải danh sách nguyên liệu');
      throw error;
    }
  }

  // Thêm ingredient mới
  async createIngredient(ingredient) {
    try {
      const docRef = await addDoc(collection(this.db, 'ingredients'), ingredient);
      const newIngredient = { ...ingredient, id: docRef.id };
      await updateDoc(doc(this.db, 'ingredients', docRef.id), { id: docRef.id });
      return newIngredient;
    } catch (error) {
      console.error('Error creating ingredient:', error);
      toastService.error('Không thể tạo nguyên liệu mới');
      throw error;
    }
  }

  // Cập nhật ingredient
  async updateIngredient(ingredientId, updates) {
    try {
      await updateDoc(doc(this.db, 'ingredients', String(ingredientId)), updates);
      return true;
    } catch (error) {
      console.error('Error updating ingredient:', error);
      toastService.error('Không thể cập nhật nguyên liệu');
      throw error;
    }
  }

  // Xóa ingredient
  async deleteIngredient(ingredientId) {
    try {
      await deleteDoc(doc(this.db, 'ingredients', String(ingredientId)));
      return true;
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      toastService.error('Không thể xóa nguyên liệu');
      throw error;
    }
  }

  // Kiểm tra ingredient tồn tại
  async checkIngredientExists(ingredientId) {
    try {
      const snapshot = await getDoc(doc(this.db, 'ingredients', String(ingredientId)));
      return snapshot.exists();
    } catch (error) {
      return false;
    }
  }

  // ===== RECIPES =====

  // Lấy tất cả recipes
  async getAllRecipes() {
    try {
      const snapshot = await getDocs(collection(this.db, 'recipes'));
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('Error getting recipes:', error);
      toastService.error('Không thể tải danh sách công thức');
      throw error;
    }
  }

  // Tạo recipe mới
  async createRecipe(recipe) {
    try {
      // Nếu đã có id (ví dụ itemId), dùng setDoc để đảm bảo update theo id ổn định
      if (recipe?.id !== undefined && recipe?.id !== null) {
        const recipeId = String(recipe.id);
        await setDoc(doc(this.db, 'recipes', recipeId), { ...recipe, id: recipeId }, { merge: true });
        return { ...recipe, id: recipeId };
      }

      const docRef = await addDoc(collection(this.db, 'recipes'), recipe);
      const newRecipe = { ...recipe, id: docRef.id };
      await updateDoc(doc(this.db, 'recipes', docRef.id), { id: docRef.id });
      return newRecipe;
    } catch (error) {
      console.error('Error creating recipe:', error);
      toastService.error('Không thể tạo công thức mới');
      throw error;
    }
  }

  // Cập nhật recipe
  async updateRecipe(recipeId, updates) {
    try {
      const id = String(recipeId);
      await setDoc(doc(this.db, 'recipes', id), { ...updates, id }, { merge: true });
      return true;
    } catch (error) {
      console.error('Error updating recipe:', error);
      toastService.error('Không thể cập nhật công thức');
      throw error;
    }
  }

  // Xóa recipe
  async deleteRecipe(recipeId) {
    try {
      await deleteDoc(doc(this.db, 'recipes', String(recipeId)));
      return true;
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toastService.error('Không thể xóa công thức');
      throw error;
    }
  }

  // Kiểm tra recipe tồn tại
  async checkRecipeExists(recipeId) {
    try {
      const snapshot = await getDoc(doc(this.db, 'recipes', String(recipeId)));
      return snapshot.exists();
    } catch (error) {
      return false;
    }
  }

  // ===== MENU ITEMS =====

  // Lấy tất cả menu items (từ recipes)
  async getAllMenuItems() {
    try {
      const recipes = await this.getAllRecipes();
      return recipes.map(recipe => ({
        id: recipe.id,
        name: recipe.name,
        price: recipe.price,
        category: recipe.category
      }));
    } catch (error) {
      console.error('Error getting menu items:', error);
      return [];
    }
  }

  // ===== ACCOUNTS =====

  // Lấy tất cả accounts
  async getAllAccounts() {
    try {
      const snapshot = await getDocs(collection(this.db, 'accounts'));
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('Error getting accounts:', error);
      throw error;
    }
  }

  // Tạo account mới
  async createAccount(account) {
    try {
      // ưu tiên lưu theo uid nếu có
      if (account?.uid) {
        const uid = String(account.uid);
        await setDoc(doc(this.db, 'accounts', uid), { ...account, id: uid }, { merge: true });
        return { ...account, id: uid };
      }

      const docRef = await addDoc(collection(this.db, 'accounts'), account);
      const newAccount = { ...account, id: docRef.id };
      await updateDoc(doc(this.db, 'accounts', docRef.id), { id: docRef.id });
      return newAccount;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  }

  // ===== AUTHENTICATION =====

  // Đăng nhập với email/password
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      // Lấy thêm thông tin user từ database
      const accounts = await this.getAllAccounts();
      const accountInfo = accounts.find(acc => acc.email === email);
      
      if (!accountInfo || !accountInfo.status || !accountInfo.isApprove) {
        await signOut(this.auth);
        throw new Error('Tài khoản không tồn tại hoặc chưa được phê duyệt');
      }

      return {
        success: true,
        user: {
          id: user.uid,
          email: user.email,
          username: accountInfo.username,
          fullname: accountInfo.fullname,
          role: accountInfo.role,
          avatar: accountInfo.avatar
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Đăng nhập thất bại!'
      };
    }
  }

  // Đăng ký tài khoản mới
  async signUp(email, password, accountInfo) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      // Lưu thông tin thêm vào database
      const newAccount = {
        uid: user.uid,
        email: user.email,
        username: accountInfo.username,
        fullname: accountInfo.fullname,
        role: accountInfo.role || 'USER',
        avatar: accountInfo.avatar || '',
        status: false, // Cần admin phê duyệt
        isApprove: false,
        createdAt: new Date().toISOString()
      };
      
      await this.createAccount(newAccount);
      
      return {
        success: true,
        message: 'Đăng ký thành công! Vui lòng chờ admin phê duyệt.'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Đăng ký thất bại!'
      };
    }
  }

  // Đăng xuất
  async signOut() {
    try {
      await signOut(this.auth);
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      return false;
    }
  }

  // Lấy user hiện tại
  getCurrentUser() {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }

  // Lắng nghe thay đổi auth state
  onAuthStateChanged(callback) {
    return onAuthStateChanged(this.auth, callback);
  }

  // ===== SALES =====

  // Lấy dữ liệu bán hàng theo ngày
  async getSalesByDate(date) {
    try {
      const snapshot = await getDoc(doc(this.db, 'sales', String(date)));
      return snapshot.exists() ? snapshot.data() : {};
    } catch (error) {
      console.error('Error getting sales:', error);
      return {};
    }
  }

  // Cập nhật dữ liệu bán hàng
  async updateSales(date, salesData) {
    try {
      await setDoc(doc(this.db, 'sales', String(date)), salesData, { merge: true });
      return true;
    } catch (error) {
      console.error('Error updating sales:', error);
      return false;
    }
  }

  // ===== UTILITY METHODS =====

  // Convert từ MockAPI format sang Firebase format
  convertFromMockAPIFormat(mockAPIRecipes) {
    const recipes = {};
    mockAPIRecipes.forEach(recipe => {
      recipes[recipe.id] = recipe.ingredients || {};
    });
    return recipes;
  }

  // Convert sang MockAPI format
  convertToMockAPIFormat(itemId, recipe, menuItem, ingredients) {
    return {
      id: itemId,
      name: menuItem?.name || `Món ${itemId}`,
      ingredients: recipe,
      price: menuItem?.price || 0,
      category: menuItem?.category || ''
    };
  }

  // Toggle Firebase mode
  toggleFirebaseMode() {
    this.useFirebase = !this.useFirebase;
    return this.useFirebase;
  }

  // Kiểm tra trạng thái Firebase
  isFirebaseEnabled() {
    return this.useFirebase;
  }
}

// Tạo instance duy nhất
const firebaseService = new FirebaseService();

export default firebaseService;
