import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import InventoryPage from './components/InventoryPage';
import RecipeManagementPage from './components/RecipeManagementPage';
import IngredientsPage from './components/IngredientsPage';
import './styles/global.css';

function App() {
  return (
    <DataProvider>
      <div className="App">
        <Navbar />
        <main style={{ minHeight: 'calc(100vh - 60px)' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/recipes" element={<RecipeManagementPage />} />
            <Route path="/ingredients" element={<IngredientsPage />} />
          </Routes>
        </main>
      </div>
    </DataProvider>
  );
}

export default App;
