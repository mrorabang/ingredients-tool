# Hướng dẫn Deploy lên GitHub Pages

## Bước 1: Tạo Repository trên GitHub
1. Đăng nhập vào GitHub
2. Tạo repository mới với tên `ingredients-tool`
3. Copy URL của repository

## Bước 2: Cập nhật package.json
Thay đổi `homepage` trong package.json:
```json
"homepage": "https://YOUR_USERNAME.github.io/ingredients-tool"
```

## Bước 3: Khởi tạo Git (nếu chưa có)
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ingredients-tool.git
git push -u origin main
```

## Bước 4: Deploy
```bash
npm run deploy
```

## Bước 5: Cấu hình GitHub Pages
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
