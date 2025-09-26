import React, { createContext, useContext, useState, useEffect } from 'react';
import dataService from '../services/dataService';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!dataService.isInitialized) {
          await dataService.init();
        }
        
        const menuItemsData = dataService.getMenuItems();
        const ingredientsData = dataService.getIngredients();
        const recipesData = dataService.getAllRecipes();
        
        setMenuItems(menuItemsData);
        setIngredients(ingredientsData);
        setRecipes(recipesData);
      } catch (error) {
        // Handle error silently
      }
    };
    
    loadData();
  }, []);

  // Refresh all data
  const refreshData = async () => {
    setIsLoading(true);
    try {
      setMenuItems(dataService.getMenuItems());
      setIngredients(dataService.getIngredients());
      setRecipes(dataService.getAllRecipes());
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  // Update specific data
  const updateMenuItems = () => {
    setMenuItems(dataService.getMenuItems());
  };

  const updateIngredients = () => {
    setIngredients(dataService.getIngredients());
  };

  const updateRecipes = () => {
    setRecipes(dataService.getAllRecipes());
  };

  // Update all data after CRUD operations
  const updateAllData = () => {
    setMenuItems(dataService.getMenuItems());
    setIngredients(dataService.getIngredients());
    setRecipes(dataService.getAllRecipes());
  };

  const value = {
    menuItems,
    ingredients,
    recipes,
    isLoading,
    refreshData,
    updateMenuItems,
    updateIngredients,
    updateRecipes,
    updateAllData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
