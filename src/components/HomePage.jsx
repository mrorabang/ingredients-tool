import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      {/* Hero Section */}
      <div className="card text-center fade-in" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        marginBottom: '3rem'
      }}>
        <div style={{ padding: '3rem 2rem' }}>
          <h1 className="text-xl" style={{ 
            marginBottom: '1rem',
            fontSize: '3rem',
            fontWeight: 'bold'
          }}>
            🍹 Ingredients Tool
          </h1>
          <p className="text-lg" style={{ 
            marginBottom: '2rem',
            opacity: 0.9,
            maxWidth: '600px',
            margin: '0 auto 2rem auto'
          }}>
            Công cụ quản lý nguyên liệu và công thức chuyên nghiệp cho quán cafe
          </p>
          <div className="flex flex-center gap-2" style={{ flexWrap: 'wrap' }}>
            <Link to="/inventory" className="btn btn-primary btn-lg">
              📊 Kiểm Kê Nguyên Liệu
            </Link>
            <Link to="/recipes" className="btn btn-success btn-lg">
              📝 Quản Lý Công Thức
            </Link>
            <Link to="/ingredients" className="btn btn-warning btn-lg">
              🥤 Quản Lý Nguyên Liệu
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-3" style={{ marginBottom: '3rem' }}>
        <div className="card text-center fade-in">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <h3 className="text-lg font-bold mb-2">Kiểm Kê Thông Minh</h3>
          <p className="text-muted">
            Theo dõi số lượng bán hàng và tính toán nguyên liệu đã sử dụng một cách chính xác
          </p>
        </div>
        
        <div className="card text-center fade-in">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
          <h3 className="text-lg font-bold mb-2">Quản Lý Công Thức</h3>
          <p className="text-muted">
            Tạo và chỉnh sửa công thức cho từng món với giao diện trực quan, dễ sử dụng
          </p>
        </div>
        
        <div className="card text-center fade-in">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💰</div>
          <h3 className="text-lg font-bold mb-2">Tính Toán Doanh Thu</h3>
          <p className="text-muted">
            Tự động tính toán tổng doanh thu và chi phí nguyên liệu theo từng ngày
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="card fade-in" style={{ 
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        color: 'white',
        border: 'none'
      }}>
        <div className="text-center mb-3">
          <h2 className="text-xl font-bold">Thống Kê Hệ Thống</h2>
        </div>
        <div className="grid grid-4 text-center">
          <div>
            <div className="text-lg font-bold">25</div>
            <div className="text-sm" style={{ opacity: 0.9 }}>Món Đồ Uống</div>
          </div>
          <div>
            <div className="text-lg font-bold">26</div>
            <div className="text-sm" style={{ opacity: 0.9 }}>Nguyên Liệu</div>
          </div>
          <div>
            <div className="text-lg font-bold">25</div>
            <div className="text-sm" style={{ opacity: 0.9 }}>Công Thức</div>
          </div>
          <div>
            <div className="text-lg font-bold">100%</div>
            <div className="text-sm" style={{ opacity: 0.9 }}>Tự Động Hóa</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card fade-in">
        <h3 className="text-lg font-bold mb-3 text-center">Thao Tác Nhanh</h3>
        <div className="grid grid-3 gap-2">
          <Link to="/inventory" className="btn btn-primary">
            📊 Xem Kiểm Kê Hôm Nay
          </Link>
          <Link to="/recipes" className="btn btn-success">
            📝 Chỉnh Sửa Công Thức
          </Link>
          <Link to="/ingredients" className="btn btn-warning">
            🥤 Quản Lý Nguyên Liệu
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
