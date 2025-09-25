const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Đường dẫn đến thư mục data
const dataDir = path.join(__dirname, '..', 'public', 'data');

// API để lấy dữ liệu
app.get('/api/menuItems', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(dataDir, 'menuItems.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Không thể đọc file menuItems.json' });
  }
});

app.get('/api/ingredients', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(dataDir, 'ingredients.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Không thể đọc file ingredients.json' });
  }
});

app.get('/api/recipes', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(dataDir, 'recipes.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Không thể đọc file recipes.json' });
  }
});

// API để cập nhật dữ liệu
app.put('/api/menuItems', async (req, res) => {
  try {
    await fs.writeFile(
      path.join(dataDir, 'menuItems.json'), 
      JSON.stringify(req.body, null, 2),
      'utf8'
    );
    res.json({ success: true, message: 'Đã cập nhật menuItems.json' });
  } catch (error) {
    res.status(500).json({ error: 'Không thể ghi file menuItems.json' });
  }
});

app.put('/api/ingredients', async (req, res) => {
  try {
    await fs.writeFile(
      path.join(dataDir, 'ingredients.json'), 
      JSON.stringify(req.body, null, 2),
      'utf8'
    );
    res.json({ success: true, message: 'Đã cập nhật ingredients.json' });
  } catch (error) {
    res.status(500).json({ error: 'Không thể ghi file ingredients.json' });
  }
});

app.put('/api/recipes', async (req, res) => {
  try {
    await fs.writeFile(
      path.join(dataDir, 'recipes.json'), 
      JSON.stringify(req.body, null, 2),
      'utf8'
    );
    res.json({ success: true, message: 'Đã cập nhật recipes.json' });
  } catch (error) {
    res.status(500).json({ error: 'Không thể ghi file recipes.json' });
  }
});

// API để cập nhật một món cụ thể
app.put('/api/menuItems/:id', async (req, res) => {
  try {
    const menuItems = JSON.parse(await fs.readFile(path.join(dataDir, 'menuItems.json'), 'utf8'));
    const index = menuItems.findIndex(item => item.id === parseInt(req.params.id));
    
    if (index !== -1) {
      menuItems[index] = { ...menuItems[index], ...req.body };
      await fs.writeFile(
        path.join(dataDir, 'menuItems.json'), 
        JSON.stringify(menuItems, null, 2),
        'utf8'
      );
      res.json({ success: true, message: 'Đã cập nhật món' });
    } else {
      res.status(404).json({ error: 'Không tìm thấy món' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Không thể cập nhật món' });
  }
});

// API để cập nhật một nguyên liệu cụ thể
app.put('/api/ingredients/:id', async (req, res) => {
  try {
    const ingredients = JSON.parse(await fs.readFile(path.join(dataDir, 'ingredients.json'), 'utf8'));
    const index = ingredients.findIndex(item => item.id === parseInt(req.params.id));
    
    if (index !== -1) {
      ingredients[index] = { ...ingredients[index], ...req.body };
      await fs.writeFile(
        path.join(dataDir, 'ingredients.json'), 
        JSON.stringify(ingredients, null, 2),
        'utf8'
      );
      res.json({ success: true, message: 'Đã cập nhật nguyên liệu' });
    } else {
      res.status(404).json({ error: 'Không tìm thấy nguyên liệu' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Không thể cập nhật nguyên liệu' });
  }
});

// API để cập nhật một công thức cụ thể
app.put('/api/recipes/:id', async (req, res) => {
  try {
    const recipes = JSON.parse(await fs.readFile(path.join(dataDir, 'recipes.json'), 'utf8'));
    recipes[req.params.id] = req.body;
    
    await fs.writeFile(
      path.join(dataDir, 'recipes.json'), 
      JSON.stringify(recipes, null, 2),
      'utf8'
    );
    res.json({ success: true, message: 'Đã cập nhật công thức' });
  } catch (error) {
    res.status(500).json({ error: 'Không thể cập nhật công thức' });
  }
});

// API để thêm món mới
app.post('/api/menuItems', async (req, res) => {
  try {
    const menuItems = JSON.parse(await fs.readFile(path.join(dataDir, 'menuItems.json'), 'utf8'));
    const newId = Math.max(...menuItems.map(item => item.id), 0) + 1;
    const newItem = { ...req.body, id: newId };
    menuItems.push(newItem);
    
    await fs.writeFile(
      path.join(dataDir, 'menuItems.json'), 
      JSON.stringify(menuItems, null, 2),
      'utf8'
    );
    res.json({ success: true, message: 'Đã thêm món mới', data: newItem });
  } catch (error) {
    res.status(500).json({ error: 'Không thể thêm món mới' });
  }
});

// API để thêm nguyên liệu mới
app.post('/api/ingredients', async (req, res) => {
  try {
    const ingredients = JSON.parse(await fs.readFile(path.join(dataDir, 'ingredients.json'), 'utf8'));
    const newId = Math.max(...ingredients.map(item => item.id), 0) + 1;
    const newItem = { ...req.body, id: newId };
    ingredients.push(newItem);
    
    await fs.writeFile(
      path.join(dataDir, 'ingredients.json'), 
      JSON.stringify(ingredients, null, 2),
      'utf8'
    );
    res.json({ success: true, message: 'Đã thêm nguyên liệu mới', data: newItem });
  } catch (error) {
    res.status(500).json({ error: 'Không thể thêm nguyên liệu mới' });
  }
});

// API để xóa món
app.delete('/api/menuItems/:id', async (req, res) => {
  try {
    const menuItems = JSON.parse(await fs.readFile(path.join(dataDir, 'menuItems.json'), 'utf8'));
    const filteredItems = menuItems.filter(item => item.id !== parseInt(req.params.id));
    
    await fs.writeFile(
      path.join(dataDir, 'menuItems.json'), 
      JSON.stringify(filteredItems, null, 2),
      'utf8'
    );
    res.json({ success: true, message: 'Đã xóa món' });
  } catch (error) {
    res.status(500).json({ error: 'Không thể xóa món' });
  }
});

// API để xóa nguyên liệu
app.delete('/api/ingredients/:id', async (req, res) => {
  try {
    const ingredients = JSON.parse(await fs.readFile(path.join(dataDir, 'ingredients.json'), 'utf8'));
    const filteredItems = ingredients.filter(item => item.id !== parseInt(req.params.id));
    
    await fs.writeFile(
      path.join(dataDir, 'ingredients.json'), 
      JSON.stringify(filteredItems, null, 2),
      'utf8'
    );
    res.json({ success: true, message: 'Đã xóa nguyên liệu' });
  } catch (error) {
    res.status(500).json({ error: 'Không thể xóa nguyên liệu' });
  }
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`- GET /api/menuItems`);
  console.log(`- GET /api/ingredients`);
  console.log(`- GET /api/recipes`);
  console.log(`- PUT /api/menuItems`);
  console.log(`- PUT /api/ingredients`);
  console.log(`- PUT /api/recipes`);
});
