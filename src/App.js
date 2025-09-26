import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';
import Navbar from './components/Navbar';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './components/HomePage';
import InventoryPage from './components/InventoryPage';
import RecipeManagementPage from './components/RecipeManagementPage';
import IngredientsPage from './components/IngredientsPage';
import authService from './services/authService';
import './styles/global.css';

function App() {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  const isLoginPage = location.pathname === '/login';

  return (
    <DataProvider>
      <div className="App">
        {isAuthenticated && !isLoginPage && <Navbar />}
        <main style={{ minHeight: (isAuthenticated && !isLoginPage) ? 'calc(100vh - 50px)' : '100vh' }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/inventory" 
              element={
                <ProtectedRoute>
                  <InventoryPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recipes" 
              element={
                <ProtectedRoute>
                  <RecipeManagementPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ingredients" 
              element={
                <ProtectedRoute>
                  <IngredientsPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </DataProvider>
  );
}

export default App;
