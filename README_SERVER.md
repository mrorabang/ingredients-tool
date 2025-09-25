# Hướng Dẫn Chạy Server Backend

## Cài Đặt Dependencies

1. Mở terminal trong thư mục `tool/server`
2. Chạy lệnh:
```bash
npm install
```

## Chạy Server

### Chế độ Development (với auto-reload)
```bash
npm run dev
```

### Chế độ Production
```bash
npm start
```

Server sẽ chạy tại: `http://localhost:3001`

## API Endpoints

### Đọc Dữ Liệu
- `GET /api/menuItems` - Lấy danh sách món
- `GET /api/ingredients` - Lấy danh sách nguyên liệu  
- `GET /api/recipes` - Lấy danh sách công thức

### Cập Nhật Dữ Liệu
- `PUT /api/menuItems` - Cập nhật toàn bộ danh sách món
- `PUT /api/ingredients` - Cập nhật toàn bộ danh sách nguyên liệu
- `PUT /api/recipes` - Cập nhật toàn bộ danh sách công thức

### Cập Nhật Từng Item
- `PUT /api/menuItems/:id` - Cập nhật món cụ thể
- `PUT /api/ingredients/:id` - Cập nhật nguyên liệu cụ thể
- `PUT /api/recipes/:id` - Cập nhật công thức cụ thể

### Thêm Mới
- `POST /api/menuItems` - Thêm món mới
- `POST /api/ingredients` - Thêm nguyên liệu mới

### Xóa
- `DELETE /api/menuItems/:id` - Xóa món
- `DELETE /api/ingredients/:id` - Xóa nguyên liệu

## Lưu Ý

- Server sẽ tự động ghi đè file JSON trong thư mục `public/data/`
- Dữ liệu được lưu với format JSON đẹp (indented)
- Có backup trong localStorage nếu API không hoạt động
- Server hỗ trợ CORS để frontend có thể gọi API

## Troubleshooting

1. **Port 3001 đã được sử dụng**: Thay đổi PORT trong file `server.js`
2. **Không thể ghi file**: Kiểm tra quyền ghi trong thư mục `public/data/`
3. **CORS error**: Đảm bảo frontend chạy trên port khác (thường là 3000)
