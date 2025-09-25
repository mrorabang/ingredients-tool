class ToastService {
  constructor() {
    this.toasts = [];
    this.container = null;
    this.init();
  }

  init() {
    // Tạo container cho toast nếu chưa có
    if (!document.getElementById('toast-container')) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      `;
      document.body.appendChild(this.container);
    } else {
      this.container = document.getElementById('toast-container');
    }
  }

  show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    const toastId = Date.now() + Math.random();
    
    // Styling cho toast
    const baseStyles = {
      padding: '12px 16px',
      borderRadius: '8px',
      color: 'white',
      fontSize: '14px',
      fontWeight: '500',
      maxWidth: '300px',
      wordWrap: 'break-word',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      transform: 'translateX(100%)',
      transition: 'all 0.3s ease',
      pointerEvents: 'auto',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    };

    // Màu sắc theo loại toast
    const typeStyles = {
      success: {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        borderLeft: '4px solid #047857'
      },
      error: {
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        borderLeft: '4px solid #b91c1c'
      },
      warning: {
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        borderLeft: '4px solid #b45309'
      },
      info: {
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        borderLeft: '4px solid #1d4ed8'
      }
    };

    // Áp dụng styles
    Object.assign(toast.style, baseStyles, typeStyles[type] || typeStyles.info);

    // Icon theo loại
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    toast.innerHTML = `
      <span style="font-size: 16px;">${icons[type] || icons.info}</span>
      <span style="flex: 1;">${message}</span>
      <span style="font-size: 18px; cursor: pointer; opacity: 0.7;" onclick="this.parentElement.remove()">×</span>
    `;

    // Thêm toast vào container
    this.container.appendChild(toast);

    // Animation slide in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 10);

    // Auto remove sau duration
    setTimeout(() => {
      this.remove(toast);
    }, duration);

    // Click để đóng
    toast.addEventListener('click', () => {
      this.remove(toast);
    });

    return toastId;
  }

  remove(toast) {
    if (toast && toast.parentNode) {
      toast.style.transform = 'translateX(100%)';
      toast.style.opacity = '0';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }
  }

  // Convenience methods
  success(message, duration) {
    return this.show(message, 'success', duration);
  }

  error(message, duration) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration) {
    return this.show(message, 'info', duration);
  }
}

// Export singleton instance
const toastService = new ToastService();
export default toastService;
