import firebaseService from './firebaseService';
import bcrypt from 'bcryptjs';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.useFirebase = true; // Switch to Firebase
    this.usePinLogin = false; // PIN login mode (không dùng Firebase Auth)
    this.pinCode = '9320';
  }

  // Đăng nhập
  async login(username, password) {
    try {
      // PIN-only login mode (UI chỉ nhập mật khẩu)
      if (this.usePinLogin) {
        const pin = password === undefined ? username : password;
        if (String(pin) !== this.pinCode) {
          return {
            success: false,
            error: 'Sai mã PIN',
            message: 'Mật khẩu không đúng'
          };
        }

        this.currentUser = {
          id: 'local-admin',
          username: 'admin',
          fullname: 'Admin',
          role: 'ADMIN',
          avatar: ''
        };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        return {
          success: true,
          user: this.currentUser,
          message: 'Đăng nhập thành công!'
        };
      }

      if (this.useFirebase) {
        // Firebase Authentication (Email/Password)
        // UI hiện đang dùng field "username"; nếu user nhập username thì map ra email trong accounts.
        let email = username;
        if (typeof username === 'string' && !username.includes('@')) {
          const accounts = await firebaseService.getAllAccounts();
          const acc = accounts.find(a => a.username === username);
          if (!acc?.email) {
            return {
              success: false,
              error: 'Không tìm thấy email cho username này',
              message: 'Tài khoản không tồn tại hoặc chưa được phê duyệt'
            };
          }
          email = acc.email;
        }

        const result = await firebaseService.signIn(email, password);
        
        if (result.success) {
          this.currentUser = result.user;
          localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
          return {
            success: true,
            user: this.currentUser,
            message: 'Đăng nhập thành công!'
          };
        } else {
          return result;
        }
      } else {
        // Fallback to MockAPI (old method)
        const response = await fetch(this.apiUrl);
        if (!response.ok) {
          throw new Error('Không thể kết nối đến server');
        }
        
        const accounts = await response.json();
        
        // Tìm tài khoản theo username
        const account = accounts.find(acc => 
          acc.username === username && 
          acc.status === true && 
          acc.isApprove === true
        );
        
        if (!account) {
          throw new Error('Tài khoản không tồn tại hoặc chưa được phê duyệt');
        }
        
        // So sánh mật khẩu với bcrypt (6 rounds)
        const isPasswordValid = await bcrypt.compare(password, account.password);
        if (!isPasswordValid) {
          throw new Error('Mật khẩu không đúng');
        }
        
        // Lưu thông tin user vào localStorage
        this.currentUser = {
          id: account.id,
          username: account.username,
          fullname: account.fullname,
          role: account.role,
          avatar: account.avatar
        };
        
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        return {
          success: true,
          user: this.currentUser,
          message: 'Đăng nhập thành công!'
        };
      }
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Đăng nhập thất bại!'
      };
    }
  }

  // Đăng xuất
  async logout() {
    try {
      if (this.useFirebase) {
        await firebaseService.signOut();
      }
      
      this.currentUser = null;
      localStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local data even if Firebase logout fails
      this.currentUser = null;
      localStorage.removeItem('currentUser');
    }
  }

  // Lấy thông tin user hiện tại
  getCurrentUser() {
    if (this.currentUser) {
      return this.currentUser;
    }
    
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      this.currentUser = JSON.parse(stored);
      return this.currentUser;
    }

    return null;
  }

  // Kiểm tra đã đăng nhập chưa
  isAuthenticated() {
    return this.getCurrentUser() !== null;
  }

  // Kiểm tra quyền admin
  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'ADMIN';
  }

  // Toggle between Firebase and MockAPI
  toggleAuthMode() {
    this.useFirebase = !this.useFirebase;
    return this.useFirebase;
  }

  // Enable/disable PIN login mode
  setPinLoginEnabled(enabled) {
    this.usePinLogin = !!enabled;
    return this.usePinLogin;
  }

  // Check if using Firebase
  isUsingFirebase() {
    return this.useFirebase;
  }

  // Hash mật khẩu với 6 rounds (để sử dụng với MockAPI fallback)
  async hashPassword(password) {
    const bcrypt = await import('bcryptjs');
    const saltRounds = 6;
    return await bcrypt.hash(password, saltRounds);
  }
}

// Tạo instance duy nhất
const authService = new AuthService();

export default authService;
