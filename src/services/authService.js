import bcrypt from 'bcryptjs';

class AuthService {
  constructor() {
    this.apiUrl = 'https://683dc621199a0039e9e6d42d.mockapi.io/accounts';
    this.currentUser = null;
  }

  // Đăng nhập
  async login(username, password) {
    try {
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
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Đăng nhập thất bại!'
      };
    }
  }

  // Đăng xuất
  logout() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
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

  // Hash mật khẩu với 6 rounds (để sử dụng trong tương lai)
  async hashPassword(password) {
    const saltRounds = 6;
    return await bcrypt.hash(password, saltRounds);
  }
}

// Tạo instance duy nhất
const authService = new AuthService();

export default authService;
