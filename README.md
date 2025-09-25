# Ingredients Tool

Ứng dụng quản lý nguyên liệu và công thức nấu ăn.

## Tính năng

- 📋 Quản lý nguyên liệu
- 🍽️ Quản lý món ăn và công thức
- 📊 Kiểm kê số lượng bán
- ➕ Tạo món mới
- ✏️ Chỉnh sửa công thức
- 🔍 Tìm kiếm nguyên liệu

## Cài đặt

```bash
npm install
```

## Chạy ứng dụng

```bash
npm start
```

## Deploy lên GitHub Pages

### Bước 1: Cập nhật package.json
Thay đổi `homepage` trong package.json:
```json
"homepage": "https://YOUR_USERNAME.github.io/ingredients-tool"
```

### Bước 2: Tạo repository trên GitHub
1. Tạo repository mới với tên `ingredients-tool`
2. Copy URL của repository

### Bước 3: Khởi tạo Git
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ingredients-tool.git
git push -u origin main
```

### Bước 4: Deploy
```bash
npm run deploy
```

### Bước 5: Cấu hình GitHub Pages
1. Vào Settings của repository
2. Scroll xuống phần "Pages"
3. Chọn source: "Deploy from a branch"
4. Chọn branch: "gh-pages"
5. Chọn folder: "/ (root)"
6. Click "Save"

## Truy cập ứng dụng
Sau khi deploy thành công, ứng dụng sẽ có sẵn tại:
`https://YOUR_USERNAME.github.io/ingredients-tool`

## Cập nhật ứng dụng
Mỗi khi có thay đổi, chạy:
```bash
npm run deploy
```

## Cấu trúc project

```
tool/
├── public/
│   ├── data/
│   │   ├── ingredients.json
│   │   ├── menuItems.json
│   │   └── recipes.json
│   └── index.html
├── src/
│   ├── components/
│   │   ├── AddMenuItemModal.jsx
│   │   ├── IngredientsPage.jsx
│   │   ├── InventoryPage.jsx
│   │   ├── Modal.jsx
│   │   ├── MultiSelectGrid.jsx
│   │   ├── RecipeEditModal.jsx
│   │   ├── RecipeManagementPage.jsx
│   │   └── RecipeViewModal.jsx
│   ├── services/
│   │   ├── dataService.js
│   │   ├── mockAPIService.js
│   │   └── toastService.js
│   └── App.js
└── package.json
```

## Công nghệ sử dụng

- React 19
- React Router DOM
- MockAPI
- GitHub Pages